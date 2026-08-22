import { useState, useEffect } from "react";
import { ShipWheelIcon, Lock, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router";
import { axiosInstance } from "../lib/axios";

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axiosInstance.get(`/auth/verify-reset-token/${token}`);
        setIsTokenValid(response.data.valid);
      } catch (err) {
        setIsTokenValid(false);
        setError(err?.response?.data?.message || "Invalid or expired reset link");
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setIsVerifying(false);
      setError("No reset token provided");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/reset-password", {
        token,
        newPassword
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state while verifying token
  if (isVerifying) {
    return (
      <div className="h-screen flex items-center justify-center p-4" data-theme="forest">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 opacity-70">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  // Invalid token state
  if (!isTokenValid && !isSuccess) {
    return (
      <div className="h-screen flex items-center justify-center p-4" data-theme="forest">
        <div className="border border-primary/25 w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center">
                <XCircle className="w-8 h-8 text-error" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Invalid Reset Link</h2>
            <p className="text-sm opacity-70 mb-6">
              {error || "This password reset link is invalid or has expired. Please request a new one."}
            </p>
            <Link to="/forgot-password" className="btn btn-primary w-full mb-3">
              Request New Link
            </Link>
            <Link to="/login" className="btn btn-ghost w-full">
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="h-screen flex items-center justify-center p-4" data-theme="forest">
        <div className="border border-primary/25 w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Password Reset!</h2>
            <p className="text-sm opacity-70 mb-6">
              Your password has been successfully reset. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="btn btn-primary w-full"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Reset password form
  return (
    <div className="h-screen flex items-center justify-center p-4" data-theme="forest">
      <div className="border border-primary/25 w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            LangPal
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Create new password</h2>
          <p className="text-sm opacity-70">
            Your new password must be at least 6 characters long.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-4">
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-control w-full space-y-2 mb-4">
            <label className="label">
              <span className="label-text">New Password</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter new password"
                className="input input-bordered w-full pl-10 pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50 hover:opacity-100"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="form-control w-full space-y-2 mb-6">
            <label className="label">
              <span className="label-text">Confirm Password</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                className="input input-bordered w-full pl-10 pr-10"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 opacity-50 hover:opacity-100"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
