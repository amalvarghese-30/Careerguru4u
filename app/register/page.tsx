"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Mail, Lock, Eye, EyeOff, User, Phone, GraduationCap, BookOpen, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/lib/auth-store";

const registerSchema = z.object({
  fullName: z.string().min(2, "Name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email"),
  phone: z.string().min(10, "Valid phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  board: z.string().min(1, "Please select a board"),
  class: z.string().min(1, "Please select your class"),
});

type RegisterForm = z.infer<typeof registerSchema>;

const boards = ["CBSE", "ICSE", "Maharashtra Board"];
const classes = Array.from({ length: 12 }, (_, i) => `Class ${i + 1}`).concat(["Graduate", "Postgraduate"]);

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registration failed");

      // Auto-login after register
      const loginRes = await fetch("/api/auth/Login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: data.email, password: data.password }),
      });
      const loginJson = await loginRes.json();
      if (loginRes.ok) {
        setAuth(loginJson.user);
        router.push("/dashboard");
      } else {
        router.push("/login");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg pt-16 pb-16 px-4">
      <div className="w-full max-w-lg">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-brand-hover border border-neutral-lightGray/50 overflow-hidden"
        >
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="h-14 w-14 rounded-2xl bg-brand-gradient-static flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-royal/20">
                <GraduationCap className="h-7 w-7 text-white" />
              </div>
              <h1 className="heading-section text-2xl md:text-3xl">Create Free Account</h1>
              <p className="text-neutral-mediumGray text-sm mt-2">Start your journey with Career Guru</p>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 text-red-600 text-sm p-3 rounded-xl mb-6 text-center"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-darkGray mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-mediumGray" />
                    <input
                      type="text"
                      {...register("fullName")}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darkGray mb-1.5">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-mediumGray" />
                    <input
                      type="tel"
                      {...register("phone")}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 transition-all"
                      placeholder="9876543210"
                    />
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-darkGray mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-mediumGray" />
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-darkGray mb-1.5">Board</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-mediumGray" />
                    <select
                      {...register("board")}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 transition-all appearance-none bg-white"
                    >
                      <option value="">Select Board</option>
                      {boards.map((b) => (<option key={b} value={b}>{b}</option>))}
                    </select>
                  </div>
                  {errors.board && <p className="text-red-500 text-xs mt-1">{errors.board.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-darkGray mb-1.5">Class</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-mediumGray" />
                    <select
                      {...register("class")}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 transition-all appearance-none bg-white"
                    >
                      <option value="">Select Class</option>
                      {classes.map((c) => (<option key={c} value={c}>{c}</option>))}
                    </select>
                  </div>
                  {errors.class && <p className="text-red-500 text-xs mt-1">{errors.class.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-darkGray mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-mediumGray" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 transition-all"
                    placeholder="Min 6 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-mediumGray hover:text-neutral-darkGray"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 text-base flex items-center justify-center gap-2 mt-2"
              >
                {loading ? "Creating Account..." : (
                  <>Create Free Account <ArrowRight className="h-5 w-5" /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-neutral-mediumGray mt-6">
              Already have an account?{" "}
              <Link href="/login" className="text-brand-royal font-semibold hover:underline">
                Login
              </Link>
            </p>
            <p className="text-center text-xs text-neutral-mediumGray/60 mt-3">
              By continuing, you agree to our Terms and Privacy Policy.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
