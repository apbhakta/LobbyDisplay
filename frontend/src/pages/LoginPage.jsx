import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, AlertCircle } from "lucide-react";
import axios from "axios";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_user", JSON.stringify(res.data));
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6" data-testid="login-page">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        <motion.div
          className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-blue-600/5 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/4 -right-20 w-80 h-80 rounded-full bg-purple-600/5 blur-3xl"
          animate={{ x: [0, -30, 0], y: [0, 30, 0] }}
          transition={{ duration: 12, repeat: Infinity }}
        />
      </div>

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
            >
              <Lock className="w-7 h-7 text-white" />
            </motion.div>
            <h1 className="text-2xl font-semibold text-white tracking-wide">Admin Login</h1>
            <p className="text-white/50 text-sm mt-1">Sign in to manage your lobby display</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              data-testid="login-error"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@lobbydisplay.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  data-testid="login-email"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-white/50 uppercase tracking-wider mb-2">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-12 py-3 text-white placeholder:text-white/25 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  data-testid="login-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              data-testid="login-submit-btn"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
