import supabase from '@/config/supabase';

export interface ChatMessage {
  id: number;
  content: string;
  channelId: number;
  userId: number;
  status: 'sent' | 'delivered' | 'read';
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface ChatChannel {
  id: number;
  name: string;
  description: string | null;
  type: 'public' | 'private' | 'direct';
  lastMessageId: number | null;
  event_id: number | null;
  createdAt: string;
  updatedAt: string;
  members?: ChannelMember[];
}

export interface ChannelMember {
  id: number;
  channelId: number;
  userId: number;
  role: 'admin' | 'member';
  lastReadMessageId: number | null;
  createdAt: string;
  updatedAt: string;
}

const chatService = {
  // Get user's channels
  async getMyChannels(): Promise<{ success: boolean; data: ChatChannel[] }> {
    try {
      const { data, error } = await supabase
        .from('Channels')
        .select('*, members:ChannelMembers(*)')
        .order('updatedAt', { ascending: false });

      if (error) throw error;

      return {
        success: true,
        data: data || [],
      };
    } catch (error: any) {
      console.error('Failed to fetch channels:', error);
      return { success: false, data: [] };
    }
  },

  // Get messages for a channel
  async getChannelMessages(
    channelId: number,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ success: boolean; data: ChatMessage[] }> {
    try {
      const { data, error } = await supabase
        .from('Messages')
        .select('*')
        .eq('channelId', channelId)
        .order('createdAt', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        data: data ? data.reverse() : [],
      };
    } catch (error: any) {
      console.error('Failed to fetch messages:', error);
      return { success: false, data: [] };
    }
  },

  // Send a message
  async sendMessage(channelId: number, content: string, userId: number): Promise<{ success: boolean; data?: ChatMessage }> {
    try {
      const { data, error } = await supabase
        .from('Messages')
        .insert({
          content,
          channelId,
          userId,
          status: 'sent',
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (error: any) {
      console.error('Failed to send message:', error);
      return { success: false };
    }
  },

  // Edit a message
  async editMessage(messageId: number, content: string): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('Messages')
        .update({ content, updatedAt: new Date().toISOString() })
        .eq('id', messageId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Failed to edit message:', error);
      return { success: false };
    }
  },

  // Delete a message
  async deleteMessage(messageId: number): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('Messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Failed to delete message:', error);
      return { success: false };
    }
  },

  // Subscribe to new messages in a channel
  subscribeToChannel(channelId: number, onNewMessage: (message: ChatMessage) => void) {
    const subscription = supabase
      .channel(`channel-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'Messages',
          filter: `channelId=eq.${channelId}`,
        },
        (payload) => {
          onNewMessage(payload.new as ChatMessage);
        }
      )
      .subscribe();

    return subscription;
  },

  // Unsubscribe from channel
  async unsubscribeFromChannel(subscription: any) {
    await supabase.removeChannel(subscription);
  },

  // Create a direct message channel
  async createDirectChannel(userId1: number, userId2: number): Promise<{ success: boolean; data?: ChatChannel }> {
    try {
      // Check if a direct channel already exists
      const { data: existingChannels } = await supabase
        .from('ChannelMembers')
        .select('channelId, Channels(*)')
        .in('userId', [userId1, userId2]);

      if (existingChannels && existingChannels.length > 0) {
        // Find a channel where both users are members
        const sharedChannels = existingChannels.filter((member: any) =>
          member.Channels?.type === 'direct'
        );

        if (sharedChannels.length > 0) {
          const channel = sharedChannels[0].Channels;
          const directChannel = (Array.isArray(channel) ? channel[0] : channel) as ChatChannel;
          return { success: true, data: directChannel };
        }
      }

      // Create a new direct channel
      const { data: newChannel, error: channelError } = await supabase
        .from('Channels')
        .insert({
          name: 'Direct Message',
          type: 'direct',
        })
        .select()
        .single();

      if (channelError) throw channelError;

      // Add both users as members
      const { error: membersError } = await supabase
        .from('ChannelMembers')
        .insert([
          { channelId: newChannel.id, userId: userId1 },
          { channelId: newChannel.id, userId: userId2 },
        ]);

      if (membersError) throw membersError;

      return { success: true, data: newChannel };
    } catch (error: any) {
      console.error('Failed to create direct channel:', error);
      return { success: false };
    }
  },

  // Join a public channel
  async joinChannel(channelId: number, userId: number): Promise<{ success: boolean }> {
    try {
      const { error } = await supabase
        .from('ChannelMembers')
        .insert({
          channelId,
          userId,
        });

      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      console.error('Failed to join channel:', error);
      return { success: false };
    }
  },
};

export default chatService;
