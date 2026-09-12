import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUsers } from "../../context/UserContext";
import { useToast } from "../../components/shared";

function ForgotPassword() {
  const navigate = useNavigate();
  const { users } = useUsers();
  const toast = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const normalized = email.trim().toLowerCase();

    const userExists = users.some(
      (user) => (user.email || "").trim().toLowerCase() === normalized
    );

    if (!userExists) {
      toast.error("No account found with this email address.");
      setLoading(false);
      return;
    }

    // Simulate sending reset email
    setTimeout(() => {
      // Store reset email for the next step
      localStorage.setItem("resetEmail", normalized);

      toast.success(`Password reset link sent to ${normalized}. Redirecting...`);
      setLoading(false);

      // Redirect to reset page after 2 seconds
      setTimeout(() => navigate("/reset-password"), 2000);
    }, 1500);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#4648d4]/10">
            <span className="material-symbols-outlined text-2xl text-[#4648d4]">
              lock_reset
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[#1b1b1e]">Forgot Password</h2>
          <p className="mt-2 text-sm text-[#45464e]">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1b1b1e]">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full rounded-xl bg-[#edf0f5] px-4 py-3 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#4648d4] py-3 font-semibold text-white transition hover:bg-[#3b3db8] disabled:opacity-50"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#4648d4] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;