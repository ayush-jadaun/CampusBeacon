import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { handleResetPassword, clearError } from "../../slices/authSlice";
import { ButtonColourfull } from "../../components/common/buttons";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { error: authError } = useSelector((state) => state.auth);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract the token from query parameters (e.g., ?token=abc123)
  const token = searchParams.get("token");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    dispatch(clearError());

    try {
      const response = await dispatch(
        handleResetPassword({ token, newPassword: password })
      ).unwrap();
      if (response) {
        toast.success("Password reset successful! Redirecting to login...", {
          position: "top-right",
          autoClose: 2000,
        });
        // After a short delay, navigate to the login page
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      toast.error(err.message || "Password reset failed", {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center p-4">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{ zIndex: 9999 }}
      />
      <AnimatePresence>
        <motion.div
          key="reset-password"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="p-8 bg-ink-2 border border-ink-line rounded-sm w-full max-w-[400px]"
        >
          <div className="text-center mb-2">
            <span className="font-display italic font-semibold text-paper text-2xl">
              Campus<span className="text-beacon">Beacon</span>
            </span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-paper mb-6 text-center">
            Reset password
          </h2>
          {authError && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 mb-4 bg-red-500/10 border border-red-500/30 p-3 rounded-sm"
            >
              {authError}
            </motion.div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block font-mono text-xs uppercase tracking-widest text-dim"
              >
                New Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 bg-ink rounded-sm text-paper border border-ink-line focus:outline-none focus:border-beacon transition-colors mt-2"
              />
            </div>
            <ButtonColourfull
              text={isLoading ? "Resetting..." : "Reset Password"}
              type="submit"
              disabled={isLoading}
            />
          </form>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ResetPassword;
