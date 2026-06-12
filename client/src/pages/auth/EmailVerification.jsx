import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { handleEmailVerification, clearError } from "../../slices/authSlice";

const EmailVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    error: authError,
    isAuthenticated,
    user,
  } = useSelector((state) => state.auth);
  const [verificationState, setVerificationState] = useState({
    status: "pending",
    error: null,
    isLoading: true,
  });

  const hasAttemptedVerification = useRef(false);
  const tokenRef = useRef(searchParams.get("token"));

  const validateToken = useCallback((token) => {
    if (!token || typeof token !== "string" || token.trim() === "") {
      return {
        isValid: false,
        error: "Invalid or missing verification token.",
      };
    }
    return {
      isValid: true,
      error: null,
    };
  }, []);

  const handleNavigateHome = useCallback(() => {
    navigate("/");
  }, [navigate]);

  useEffect(() => {
    if (hasAttemptedVerification.current) return;

    const token = tokenRef.current;
    const tokenValidation = validateToken(token);

    if (!tokenValidation.isValid) {
      setVerificationState({
        status: "failed",
        error: tokenValidation.error,
        isLoading: false,
      });
      hasAttemptedVerification.current = true;
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await dispatch(
          handleEmailVerification(token)
        ).unwrap();
        if (response) {
          setVerificationState({
            status: "success",
            error: null,
            isLoading: false,
          });
        } else {
          throw new Error("Verification failed.");
        }
      } catch (error) {
        setVerificationState({
          status: "failed",
          error: error.message,
          isLoading: false,
        });
      }
    };

    hasAttemptedVerification.current = true;
    verifyEmail();
  }, [dispatch, validateToken]);

  useEffect(() => {
    return () => {
      hasAttemptedVerification.current = false;
    };
  }, []);

  useEffect(() => {
    if (authError) {
      setVerificationState((prev) => ({
        ...prev,
        status: "failed",
        error: authError,
      }));
    }
  }, [authError]);

  useEffect(() => {
    let timer;
    if (
      verificationState.status === "success" &&
      isAuthenticated &&
      user?.isVerified
    ) {
      timer = setTimeout(handleNavigateHome, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [verificationState.status, isAuthenticated, user, handleNavigateHome]);

  const renderContent = () => {
    if (verificationState.isLoading) {
      return (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-beacon"></div>
        </div>
      );
    }

    if (verificationState.status === "success") {
      return (
        <>
          <div className="text-center mt-4">
            <p className="text-dim mb-2">Redirecting to homepage...</p>
            <button
              onClick={handleNavigateHome}
              className="link-sweep px-1 py-2 font-mono text-sm tracking-wide text-beacon transition-colors duration-200"
            >
              Continue now →
            </button>
          </div>
        </>
      );
    }

    if (verificationState.error) {
      return (
        <div
          className="text-red-400 mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-sm text-center"
          data-testid="error-message"
        >
          {verificationState.error}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ink text-paper">
      <div className="max-w-md w-full bg-ink-2 text-paper p-8 rounded-sm border border-ink-line">
        <div className="text-center mb-2">
          <span className="font-display italic font-semibold text-paper text-2xl">
            Campus<span className="text-beacon">Beacon</span>
          </span>
        </div>
        <h1 className="font-display text-2xl mb-6 font-semibold text-center text-paper">
          {verificationState.status === "success"
            ? "Email verified!"
            : verificationState.status === "failed"
            ? "Verification failed"
            : "Verifying email..."}
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default EmailVerification;
