import { useState, useEffect } from "react";
import { ShipWheelIcon, CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import { Link, useParams, useNavigate } from "react-router";
import { axiosInstance } from "../lib/axios";

const VerifyEmailPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("No verification token provided");
        return;
      }

      try {
        const response = await axiosInstance.get(`/auth/verify-email/${token}`);
        setStatus("success");
        setMessage(response.data.message || "Email verified successfully!");
      } catch (err) {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Verification failed. The link may be invalid or expired.");
      }
    };

    verifyEmail();
  }, [token]);

  // Loading state
  if (status === "verifying") {
    return (
      <div className="h-screen flex items-center justify-center p-4" data-theme="forest">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-lg">Verifying your email...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <div className="h-screen flex items-center justify-center p-4" data-theme="forest">
        <div className="border border-primary/25 w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
          <div className="text-center">
            {/* Logo */}
            <div className="mb-6 flex items-center justify-center gap-2">
              <ShipWheelIcon className="size-9 text-primary" />
              <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
                Streamify
              </span>
            </div>

            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-success" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold mb-2">Email Verified!</h2>
            <p className="text-sm opacity-70 mb-6">{message}</p>
            <button
              onClick={() => navigate("/login")}
              className="btn btn-primary w-full"
            >
              Continue to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  return (
    <div className="h-screen flex items-center justify-center p-4" data-theme="forest">
      <div className="border border-primary/25 w-full max-w-md bg-base-100 rounded-xl shadow-lg p-8">
        <div className="text-center">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <ShipWheelIcon className="size-9 text-primary" />
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-error/20 rounded-full flex items-center justify-center">
              <XCircle className="w-8 h-8 text-error" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold mb-2">Verification Failed</h2>
          <p className="text-sm opacity-70 mb-6">{message}</p>

          <ResendVerificationForm />

          <div className="divider">OR</div>

          <Link to="/login" className="btn btn-ghost w-full">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

// Resend verification form component
const ResendVerificationForm = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleResend = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await axiosInstance.post("/auth/resend-verification", { email });
      setSent(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to send verification email");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="alert alert-success">
        <Mail className="w-5 h-5" />
        <span>If your email is registered and unverified, you'll receive a new verification link.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleResend} className="space-y-4">
      <p className="text-sm opacity-70">Enter your email to request a new verification link:</p>

      {error && (
        <div className="alert alert-error py-2">
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="form-control">
        <input
          type="email"
          placeholder="your@email.com"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Mail className="w-4 h-4" />
            Resend Verification Email
          </>
        )}
      </button>
    </form>
  );
};

export default VerifyEmailPage;
