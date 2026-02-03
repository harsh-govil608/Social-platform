import { useState } from "react";
import { ShipWheelIcon, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router";
import { axiosInstance } from "../lib/axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/forgot-password", { email });
      setIsSubmitted(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="h-screen flex items-center justify-center p-4" data-theme="forest">
        <div className="border border-primary/25 w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Check your email</h2>
            <p className="text-sm opacity-70 mb-6">
              If an account with <span className="font-medium">{email}</span> exists,
              we've sent you a password reset link. Please check your inbox and spam folder.
            </p>
            <Link to="/login" className="btn btn-primary w-full">
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center p-4" data-theme="forest">
      <div className="border border-primary/25 w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
        {/* Logo */}
        <div className="mb-6 flex items-center justify-center gap-2">
          <ShipWheelIcon className="size-9 text-primary" />
          <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
            Streamify
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-semibold mb-2">Forgot your password?</h2>
          <p className="text-sm opacity-70">
            No worries! Enter your email and we'll send you a reset link.
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
              <span className="label-text">Email address</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 opacity-50" />
              <input
                type="email"
                placeholder="hello@example.com"
                className="input input-bordered w-full pl-10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-full mb-4" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="loading loading-spinner loading-xs"></span>
                Sending reset link...
              </>
            ) : (
              "Send Reset Link"
            )}
          </button>

          <Link to="/login" className="btn btn-ghost w-full">
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </Link>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
