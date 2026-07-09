import { Mail, Phone, MapPin, Clock, MessageSquare, Send } from "lucide-react";

const contactDetails = [
  { icon: Mail, label: "Email", value: "info@careerguru.com", href: "mailto:info@careerguru.com" },
  { icon: Phone, label: "Phone", value: "+91 98765 43210", href: "tel:+919876543210" },
  { icon: MapPin, label: "Address", value: "Mumbai, Maharashtra, India" },
  { icon: Clock, label: "Working Hours", value: "Mon - Sat, 9:00 AM - 7:00 PM" },
];

export default function ContactPage() {
  return (
    <div className="bg-brand-bg min-h-screen">
      {/* Hero */}
      <section className="relative bg-brand-navy py-16 md:py-20">
        <div className="container-custom text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-sky/15 border border-brand-sky/30 text-brand-sky text-sm font-medium mb-6">
            <MessageSquare className="h-4 w-4" />
            We&apos;d Love to Hear From You
          </div>
          <h1 className="text-3xl md:text-5xl font-bold font-sora text-white mb-4">
            Contact Us
          </h1>
          <p className="text-white/70 text-lg max-w-2xl mx-auto">
            Have questions about our platform, need academic guidance, or want to partner with us? Reach out and we&apos;ll get back to you.
          </p>
        </div>
      </section>

      {/* Contact section */}
      <section className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Contact details */}
          <div className="space-y-4">
            {contactDetails.map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-slate-200 p-5">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-brand-royal/10 flex items-center justify-center flex-shrink-0">
                    <item.icon className="h-5 w-5 text-brand-royal" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.label}</p>
                    {item.href ? (
                      <a href={item.href} className="text-sm text-brand-royal hover:text-brand-sky font-medium">
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-sm text-slate-700 font-medium">{item.value}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 md:p-8">
            <h2 className="text-xl font-semibold text-slate-800 mb-6">Send Us a Message</h2>
            <form className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Full Name</label>
                  <input
                    type="text"
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal focus:ring-2 focus:ring-brand-royal/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal focus:ring-2 focus:ring-brand-royal/10 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Subject</label>
                <input
                  type="text"
                  placeholder="What is this about?"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal focus:ring-2 focus:ring-brand-royal/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell us more..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-brand-royal focus:ring-2 focus:ring-brand-royal/10 transition-all resize-none"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-3 bg-brand-gradient-static text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all"
              >
                <Send className="h-4 w-4" />
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
