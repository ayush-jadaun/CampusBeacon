import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import authService from '@/services/auth.service';

// This is required for the OAuth redirect to work properly
WebBrowser.maybeCompleteAuthSession();

// Get Google Client ID from environment or use placeholder
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE.apps.googleusercontent.com';

// OAuth configuration
const config = {
  clientId: GOOGLE_CLIENT_ID,
  scopes: ['profile', 'email'],
  redirectUri: AuthSession.makeRedirectUri({
    scheme: 'campusbeacon',
    path: 'auth',
  }),
};

export const googleAuthService = {
  /**
   * Initiate Google OAuth flow
   * @returns Promise with authentication result
   */
  async signInWithGoogle(): Promise<{ success: boolean; message?: string }> {
    try {
      // Create auth request
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
        client_id: config.clientId,
        redirect_uri: config.redirectUri,
        response_type: 'id_token',
        scope: config.scopes.join(' '),
        nonce: Math.random().toString(36).substring(7),
      }).toString()}`;

      // Open browser for OAuth
      const result = await WebBrowser.openAuthSessionAsync(
        authUrl,
        config.redirectUri
      );

      if (result.type === 'success' && result.url) {
        // Extract ID token from URL
        const url = new URL(result.url);
        const params = new URLSearchParams(url.hash.substring(1));
        const idToken = params.get('id_token');

        if (!idToken) {
          throw new Error('No ID token received from Google');
        }

        // Verify email domain before sending to backend
        const payload = parseJwt(idToken);
        const email = payload.email;

        if (!email || !email.endsWith('@mnnit.ac.in')) {
          throw new Error('Only MNNIT institutional emails (@mnnit.ac.in) are allowed');
        }

        // Send ID token to backend for verification
        const response = await authService.googleAuth(idToken);

        if (response.success) {
          return { success: true };
        } else {
          throw new Error(response.message || 'Google authentication failed');
        }
      } else if (result.type === 'cancel') {
        return { success: false, message: 'Authentication cancelled' };
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw new Error(error.message || 'Google Sign-In failed');
    }
  },
};

/**
 * Parse JWT token (client-side only for email validation)
 * Backend will do proper verification
 */
function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    throw new Error('Invalid token');
  }
}
