import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../components/shared";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const user = await login(email, password);

    if (!user) {
      toast.error("Invalid email or password. Please try again.");
      return;
    }

    toast.success(`Welcome back, ${user.fullName}!`);

    // Redirect based on role
    if (user.role === "resident") {
      navigate("/resident");
    } else if (user.role === "volunteer") {
      navigate("/volunteer");
    } else if (user.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-[#f5f7fb] text-[#1b1b1e] antialiased md:flex-row">
      {/* LEFT — BRANDING */}
      <div className="relative hidden w-full overflow-hidden bg-[#0e1a39] p-8 text-white md:flex md:w-[45%] md:flex-col md:justify-between md:p-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(96,99,238,0.15)_0%,transparent_20%),radial-gradient(circle_at_90%_80%,rgba(96,99,238,0.10)_0%,transparent_20%)]" />

        <div className="relative z-10 mt-8 max-w-md">
          <div className="mb-8 flex items-center gap-2">
            <span className="material-symbols-outlined text-3xl text-[#e1e0ff]">
              public
            </span>
            <h1
              className="text-xl font-bold tracking-tight"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              DisasterLink
            </h1>
          </div>

          <h2
            className="mb-4 text-5xl font-bold leading-tight"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            Respond. Coordinate. Protect.
          </h2>

          <p className="mb-8 max-w-sm text-lg leading-relaxed text-[#bac5ed]">
            Connecting communities with faster disaster reporting, response, and resources.
          </p>

          <ul className="mt-10 space-y-6">
            <FeatureItem
              title="Real-time Reporting"
              description="Submit and track local incidents instantly."
            />
            <FeatureItem
              title="Shelter Navigation"
              description="Find active shelters and resource centers nearby."
            />
            <FeatureItem
              title="Critical Alerts"
              description="Receive verified broadcast updates from response teams."
            />
          </ul>
        </div>

        <div className="relative z-10 mt-12 text-xs font-bold tracking-wide text-[#bac5ed]/70">
          © 2026 DisasterLink • Community Disaster Coordination
        </div>
      </div>

      {/* RIGHT — FORM */}
      <div className="relative flex w-full items-center justify-center bg-[#f5f7fb] p-4 md:w-[55%] md:p-12">
        <div className="absolute left-6 top-8 flex items-center gap-2 md:hidden">
          <span className="material-symbols-outlined text-[#4648d4]">public</span>
          <span
            className="text-xl font-bold text-[#0e1a39]"
            style={{ fontFamily: '"Space Grotesk", sans-serif' }}
          >
            DisasterLink
          </span>
        </div>

        <div className="w-full max-w-md rounded-2xl border border-[#e4e1e5] bg-white p-8 shadow-lg transition-transform duration-300 hover:-translate-y-0.5 md:p-10">
          <div className="mb-8 text-center">
            <h2
              className="mb-2 text-2xl font-semibold"
              style={{ fontFamily: '"Space Grotesk", sans-serif' }}
            >
              Welcome Back
            </h2>
            <p className="text-base text-[#45464e]">
              Sign in to access your disaster-response dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-semibold" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#76767f]">
                  mail
                </span>
                <input
                  className="w-full rounded-lg bg-[#f6f2f7] py-3 pl-12 pr-4 outline-none transition focus:ring-2 focus:ring-[#4648d4]/30"
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="block text-sm font-semibold" htmlFor="password">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs font-bold text-[#4648d4] transition hover:text-[#0e1a39]"
                >
                  Forgot Password?
                </button>
              </div>

              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#76767f]">
                  lock
                </span>
                <input
                  className="w-full rounded-lg bg-[#f6f2f7] py-3 pl-12 pr-12 outline-none transition focus:ring-2 focus:ring-[#4648d4]/30"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-[#76767f] transition hover:text-[#1b1b1e]"
                  aria-label="Toggle password visibility"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 accent-[#4648d4]"
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-[#45464e]">
                Remember me for 30 days
              </label>
            </div>

            {/* Buttons */}
            <div className="space-y-4 pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`flex w-full items-center justify-center gap-2 rounded-xl bg-[#4648d4] py-3 font-semibold text-white shadow-sm transition ${
                  loading
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-[#383ab8] hover:shadow-md"
                }`}
              >
                {loading ? "Signing in..." : "Sign In"}
                {!loading && (
                  <span className="material-symbols-outlined text-lg">
                    arrow_forward
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className="w-full rounded-xl border-2 border-[#4648d4] py-3 font-semibold text-[#4648d4] transition hover:bg-[#4648d4]/5"
              >
                Create Account
              </button>
            </div>
          </form>

          <div className="mt-8 flex items-center justify-center gap-1 border-t border-[#e4e1e5] pt-6 text-center text-xs font-semibold text-[#45464e]/60">
            <span className="material-symbols-outlined text-base">lock</span>
            <span>Your information is securely protected.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Small helper ---------- */

const FeatureItem = ({ title, description }) => (
  <li className="flex items-start gap-4">
    <div className="mt-1 rounded-full bg-[#6063ee]/20 p-1">
      <span className="material-symbols-outlined text-base text-green-400">
        check_circle
      </span>
    </div>
    <div>
      <span className="mb-1 block text-sm font-bold">{title}</span>
      <span className="text-sm leading-relaxed text-[#bac5ed]">{description}</span>
    </div>
  </li>
);

export default Login; 