import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  handleSignIn,
  handleSignUp,
  handleForgetPassword,
  handleGoogleAuth,
  clearError,
  checkAuthStatus,
} from "../../slices/authSlice";
import { ButtonColourfull } from "../../components/common/buttons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import CustomEmailInput from "./customEmailInput";
import PasswordInput from "./password";

const LoginSignup = () => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const authError = useSelector((state) => state.auth.error);
  const loading = useSelector((state) => state.auth.loading);

  const [isSignUp, setIsSignUp] = useState(false);
  const [authMode, setAuthMode] = useState("default");

  const navigate = useNavigate();
  const loginSuccessShown = useRef(false);
  const redirectTimerRef = useRef(null);
  const toastIdRef = useRef(null);

  useEffect(() => {
    dispatch(clearError());
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    loginSuccessShown.current = false;
  }, [dispatch, authMode, isSignUp]);

  useEffect(() => {
    if (isAuthenticated && !loading && !loginSuccessShown.current) {
      loginSuccessShown.current = true;
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);

      toastIdRef.current = toast.success("Welcome back!", {
        position: "top-right",
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        closeButton: false,
        onClose: () => {
          toastIdRef.current = null;
        },
      });

      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      redirectTimerRef.current = setTimeout(() => {
        navigate("/");
        redirectTimerRef.current = null;
      }, 1800);

      return () => {
        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
          redirectTimerRef.current = null;
        }
      };
    }
    if (!isAuthenticated) {
      loginSuccessShown.current = false;
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
        redirectTimerRef.current = null;
      }
    }
  }, [isAuthenticated, loading, navigate, dispatch]);

  useEffect(() => {
    if (authError && !loading) {
      if (toastIdRef.current) toast.dismiss(toastIdRef.current);
      toastIdRef.current = toast.error(authError, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        closeButton: true,
        onClose: () => {
          toastIdRef.current = null;
        },
      });
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [authError, loading, dispatch]);

  const handleFormSubmit = async (e, type) => {
    e.preventDefault();
    dispatch(clearError());
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    loginSuccessShown.current = false;

    const email = e.target.elements.email?.value;
    const password = e.target.elements.password?.value;

    if (!email) {
      console.error("Email field not found in form");
      toast.error("An error occurred. Could not find email field.");
      return;
    }
    if (type !== "forgot" && !password) {
      console.error("Password field not found in form");
      toast.error("An error occurred. Could not find password field.");
      return;
    }

    try {
      if (type === "login") {
        await dispatch(handleSignIn({ email, password })).unwrap();
        toast.success("Welcome back!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
        });
        setTimeout(() => {
          navigate("/");
        }, 1000);
      } else if (type === "signup") {
        await dispatch(handleSignUp({ email, password })).unwrap();
        toastIdRef.current = toast.success(
          "Account created! Please check your email for verification.",
          {
            position: "top-right",
            autoClose: 5000,
            onClose: () => {
              toastIdRef.current = null;
            },
          }
        );
        setIsSignUp(false);
        setAuthMode("default");
      } else if (type === "forgot") {
        await dispatch(handleForgetPassword(email)).unwrap();
        toastIdRef.current = toast.success(
          "Reset link sent! Please check your email.",
          {
            position: "top-right",
            autoClose: 5000,
            onClose: () => {
              toastIdRef.current = null;
            },
          }
        );
        setAuthMode("default");
        setIsSignUp(false);
      }
    } catch (err) {
      console.error(`[${type}] Dispatch rejected:`, err);
    }
  };




  const AuthForm = ({ type }) => (
    <div className="space-y-6 w-full">
      <form onSubmit={(e) => handleFormSubmit(e, type)} className="space-y-4">
        <CustomEmailInput
          id={`${type}-email-input`}
          name="email"
          required
          autoComplete={type === "signup" ? "email" : "username"}
        />
        {type !== "forgot" && (
          <PasswordInput
            id={`${type}-password-input`}
            name="password"
            placeholder="Enter password"
            required
            autoComplete={
              type === "login" ? "current-password" : "new-password"
            }
          />
        )}
        <ButtonColourfull
          text={
            loading
              ? "Processing..."
              : type === "signup"
              ? "Create Account"
              : type === "login"
              ? "Sign In"
              : "Send Reset Link"
          }
          type="submit"
          disabled={loading}
          className="w-full py-3"
        />
      </form>

      {type !== "forgot" && (
        <>
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative px-4 bg-transparent">
            </div>
          </div>

          
        </>
      )}
    </div>
  );

  const switchView = (newIsSignUp, newAuthMode = "default") => {
    dispatch(clearError());
    if (toastIdRef.current) toast.dismiss(toastIdRef.current);
    setIsSignUp(newIsSignUp);
    setAuthMode(newAuthMode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-900 to-black flex items-center justify-center p-4">
      <AnimatePresence mode="wait">
        {authMode === "default" ? (
          <motion.div
            key="default-auth"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-[900px] md:h-[620px] h-auto rounded-2xl overflow-hidden md:flex shadow-2xl my-8 md:my-0"
            style={{
              background: "rgba(0, 0, 0, 0.7)",
              backdropFilter: "blur(10px)",
            }}
          >
            {/* Sliding overlay panel for desktop */}
            <motion.div
              animate={{ x: isSignUp ? "100%" : "0%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute top-0 left-0 w-1/2 h-full z-10 hidden md:block"
              style={{
                background: "rgba(139, 92, 246, 0.2)", // More transparent
                backdropFilter: "blur(8px)",
                boxShadow: "0 0 50px rgba(139, 92, 246, 0.3)",
                borderRight: isSignUp
                  ? "none"
                  : "1px solid rgba(139, 92, 246, 0.3)",
                borderLeft: isSignUp
                  ? "1px solid rgba(139, 92, 246, 0.3)"
                  : "none",
              }}
            >
              <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-purple-900/100 ">
                <h2 className="text-4xl font-bold text-white mb-6">
                  {isSignUp ? "Welcome Back!" : "New Here?"}
                </h2>
                <p className="text-white/80 mb-8 max-w-xs">
                  {isSignUp
                    ? "Already have an account? Sign in to continue your journey."
                    : "Sign up and join our community today! It only takes a minute."}
                </p>
                <button
                  onClick={() => switchView(!isSignUp)}
                  className="px-10 py-3 border-2 border-white text-white rounded-full hover:bg-white hover:text-purple-900 transition-all duration-300"
                  disabled={loading}
                >
                  {isSignUp ? "Sign In" : "Sign Up"}
                </button>
              </div>
            </motion.div>

            {/* Mobile view with flipping animation */}
            <div className="md:hidden w-full p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={isSignUp ? "signUpMobile" : "signInMobile"}
                  initial={{ rotateY: isSignUp ? -90 : 90, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  exit={{ rotateY: isSignUp ? 90 : -90, opacity: 0 }}
                  transition={{
                    duration: 0.6,
                    type: "spring",
                    stiffness: 200,
                    damping: 25,
                  }}
                  style={{
                    backfaceVisibility: "hidden",
                    transformStyle: "preserve-3d",
                  }}
                  className="w-full"
                >
                  {isSignUp ? (
                    <div className="w-full">
                      <h2 className="text-3xl font-bold text-white mb-6 text-center">
                        Create Account
                      </h2>
                      <AuthForm type="signup" />
                      <div className="mt-6 text-center">
                        <button
                          onClick={() => switchView(false)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          disabled={loading}
                        >
                          Already have an account? Sign In
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full">
                      <h2 className="text-3xl font-bold text-white mb-6 text-center">
                        Welcome Back!
                      </h2>
                      <AuthForm type="login" />
                      <div className="mt-6 flex flex-col items-center space-y-3">
                        <button
                          onClick={() => switchView(false, "forgot")}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          disabled={loading}
                        >
                          Forgot Password?
                        </button>
                        <button
                          onClick={() => switchView(true)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                          disabled={loading}
                        >
                          New here? Create Account
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Desktop view with forms */}
            <div className="hidden md:flex w-full">
              <div className="w-1/2 flex items-center justify-center p-10">
                <div
                  className={`w-full max-w-md mx-auto transition-all duration-300 ${
                    isSignUp
                      ? "opacity-100 z-20"
                      : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <h2 className="text-3xl font-bold text-white mb-8 text-center">
                    Create Account
                  </h2>
                  <AuthForm type="signup" />
                </div>
              </div>
              <div className="w-1/2 flex items-center justify-center p-10">
                <div
                  className={`w-full max-w-md mx-auto transition-all duration-300 ${
                    !isSignUp
                      ? "opacity-100 z-20"
                      : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <h2 className="text-3xl font-bold text-white mb-2 text-center">
                    Welcome Back!
                  </h2>
                  <AuthForm type="login" />
                  <button
                    className="mt-4 text-purple-400 hover:text-purple-300 w-full text-center transition-colors"
                    onClick={() => switchView(false, "forgot")}
                    disabled={loading}
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          // Forgot password view
          <motion.div
            key="forgot-password"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="p-8 bg-black/70 backdrop-blur-md rounded-2xl shadow-2xl w-full max-w-md mx-auto border border-purple-500/30"
          >
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Reset Password
            </h2>
            <AuthForm type="forgot" />
            <button
              className="mt-6 text-purple-400 hover:text-purple-300 w-full text-center transition-colors"
              onClick={() => switchView(false, "default")}
              disabled={loading}
            >
              Back to Login
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LoginSignup;
