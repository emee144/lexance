'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState("");

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        cache: "no-store",
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Login successful! Redirecting...");
        router.refresh();
        router.push("/dashboard");
      } else {
        setMessage(data.error || "Invalid credentials");
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setResetMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();

      if (res.ok) {
        setResetMessage("Reset link sent! Check your email.");
      } else {
        setResetMessage(data.error || "Email not found");
      }
    } catch (err) {
      setResetMessage("Network error. Try again later.");
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md text-white">
        <h2 className="text-3xl font-bold mb-2 text-center">Welcome to Lexance</h2>
        <p className="mb-6 text-center text-gray-400">
          Don't have an account?{" "}
          <a href="/signup" className="text-blue-500 hover:underline">
            Sign Up
          </a>
        </p>

        {/* Login Form */}
        {!isForgotPassword ? (
          <form onSubmit={handleLogin}>
            {message && (
              <div className={`mb-4 text-center ${message.includes("successful") ? "text-green-400" : "text-red-400"}`}>
                {message}
              </div>
            )}

            <div className="mb-4">
              <label className="block mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4 relative">
              <label className="block mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-10 text-gray-300 hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="mb-6 text-right">
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setMessage("");
                }}
                className="text-blue-400 hover:underline text-sm cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-semibold transition cursor-pointer"
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
         
          <div>
            <button
              onClick={() => {
                setIsForgotPassword(false);
                setResetMessage("");
                setResetEmail("");
              }}
              className="mb-4 text-blue-400 hover:underline text-sm cursor-pointer"
            >
              ← Login
            </button>

            <h3 className="text-2xl font-bold mb-4">Reset Password</h3>
            <p className="text-gray-400 mb-6">
              Enter your email and we'll send you a password reset link.
            </p>

            <form onSubmit={handleForgotPassword}>
              {resetMessage && (
                <div className={`mb-4 text-center ${resetMessage.includes("sent") ? "text-green-400" : "text-red-400"}`}>
                  {resetMessage}
                </div>
              )}

              <div className="mb-6">
                <label className="block mb-1">Email</label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2 rounded-md bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={resetLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-md font-semibold transition cursor-pointer"
              >
                {resetLoading ? "Sending..." : "Reset"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}