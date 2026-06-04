"use client";

import { useState } from "react";
import { Send, CheckCircle } from "lucide-react";

interface LeadCaptureFormProps {
  source?: string;
  interest?: string;
  className?: string;
}

export default function LeadCaptureForm({ source = "Website", interest = "General", className = "" }: LeadCaptureFormProps) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, source, interest }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setForm({ name: "", email: "", phone: "" });
      } else {
        setError(data.error || "Something went wrong");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className={`bg-white rounded-2xl border border-slate-200 p-6 text-center ${className}`}>
        <CheckCircle className="h-10 w-10 text-emerald-500 mx-auto mb-3" />
        <h3 className="font-bold text-slate-800 mb-1">Thank You!</h3>
        <p className="text-sm text-slate-500">We'll get in touch with you shortly.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`bg-white rounded-2xl border border-slate-200 p-6 space-y-4 ${className}`}>
      <h3 className="font-bold text-slate-800">Get Free Career Guidance</h3>
      <p className="text-xs text-slate-500 -mt-2">Fill in your details and our experts will call you back.</p>

      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="Your name" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
        <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          placeholder="your@email.com" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number</label>
        <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="+91 98765 43210" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>}

      <button type="submit" disabled={submitting}
        className="w-full py-2.5 rounded-xl bg-brand-gradient-static text-white text-sm font-bold hover:shadow-brand-btn transition-shadow disabled:opacity-60 flex items-center justify-center gap-2">
        <Send className="h-4 w-4" /> {submitting ? "Submitting..." : "Get Free Callback"}
      </button>
    </form>
  );
}
