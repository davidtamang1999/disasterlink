import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useUsers } from "../../context/UserContext";
import { useToast } from "../../components/shared";

function ResetPassword() {
  const navigate = useNavigate();
  const { users, updateUser } = useUsers();
  const toast = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      setLoading(false);
      return;
    }

    const resetEmail = localStorage.getItem("resetEmail");
    if (!resetEmail) {
      toast.error("No reset request found. Please request a new password reset.");
      setLoading(false);
      return;
    }

    const user = users.find(
      (u) => (u.email || "").trim().toLowerCase() === resetEmail
    );

    if (!user) {
      toast.error("User not found. Please request a new password reset.");
      localStorage.removeItem("resetEmail");
      setLoading(false);
      return;
    }

    await updateUser(user.id, { password });
    localStorage.removeItem("resetEmail");

    toast.success("Password reset successfully! Redirecting to login...");
    setLoading(false);

    setTimeout(() => navigate("/login"), 1800);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f5f7fb] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]/10">
            <span className="material-symbols-outlined text-2xl text-[#22c55e]">
              password
            </span>
          </div>
          <h2 className="mt-4 text-2xl font-bold text-[#1b1b1e]">Reset Password</h2>
          <p className="mt-2 text-sm text-[#45464e]">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1b1b1e]">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
                className="w-full rounded-xl bg-[#edf0f5] px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#45464e]"
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-[#1b1b1e]">
              Confirm Password
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
              className="w-full rounded-xl bg-[#edf0f5] px-4 py-3 outline-none focus:ring-2 focus:ring-[#4648d4]/30"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#22c55e] py-3 font-semibold text-white transition hover:bg-[#16a34a] disabled:opacity-50"
          >
            {loading ? "Resetting..." : "Reset Password"}
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

export default ResetPassword;