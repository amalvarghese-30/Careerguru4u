"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, Globe, Bell, Shield, Palette, Mail as MailIcon, Database, Phone, Link2, FileText, CheckCircle } from "lucide-react";

interface SocialLinks {
  facebook?: string; twitter?: string; instagram?: string; linkedin?: string; youtube?: string;
}

interface SiteSettings {
  siteName: string; tagline: string; siteUrl: string;
  metaDescription: string; language: string; timezone: string;
  primaryColor: string; secondaryColor: string;
  logo: string; favicon: string;
  contactEmail: string; contactPhone: string; whatsappNumber: string;
  address: string;
  socialLinks: SocialLinks;
  footerContent: string;
}

const defaultSettings: SiteSettings = {
  siteName: "CareerGuru4U", tagline: "Your AI-Powered Career Guide",
  siteUrl: "https://careerguru.com", metaDescription: "",
  language: "en", timezone: "Asia/Kolkata",
  primaryColor: "#4F46E5", secondaryColor: "#7C3AED",
  logo: "", favicon: "",
  contactEmail: "", contactPhone: "", whatsappNumber: "",
  address: "",
  socialLinks: { facebook: "", twitter: "", instagram: "", linkedin: "", youtube: "" },
  footerContent: "",
};

const tabItems = [
  { id: "general", label: "General", icon: Globe },
  { id: "branding", label: "Branding", icon: Palette },
  { id: "contact", label: "Contact", icon: Phone },
  { id: "social", label: "Social & Footer", icon: Link2 },
  { id: "email", label: "Email", icon: MailIcon },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
  { id: "backup", label: "Backup", icon: Database },
];

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("general");
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState("");


  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        credentials: "include",
      });
      const data = await res.json();
      if (data.settings) setSettings({ ...defaultSettings, ...data.settings });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.success) {
        setSaved(true); setMessage("Settings saved");
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (e) { console.error(e); }
  };

  const updateSetting = (key: keyof SiteSettings, value: string | SocialLinks) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateSocial = (platform: keyof SocialLinks, value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [platform]: value },
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Site Settings</h1>
        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Site Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage platform configuration from database</p>
        </div>
        <button onClick={handleSave} className="btn-primary py-2.5 px-5 text-sm flex items-center gap-2 flex-shrink-0">
          {saved ? <CheckCircle className="h-4 w-4" /> : <Save className="h-4 w-4" />} {saved ? "Saved" : "Save Changes"}
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl text-center">
          {message}
        </motion.div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        {/* Mobile: horizontal scrollable tabs | Desktop: vertical sidebar */}
        <div className="lg:w-56 lg:flex-shrink-0">
          <div className="bg-white rounded-2xl border border-slate-200 p-2 overflow-x-auto lg:overflow-visible">
            <div className="flex lg:flex-col gap-1">
              {tabItems.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-shrink-0 lg:flex-shrink flex items-center gap-2 lg:gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "bg-brand-gradient-static text-white shadow-brand-btn"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {activeTab === "general" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h3 className="font-bold text-slate-800">General Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Site Name</label><input value={settings.siteName} onChange={(e) => updateSetting("siteName", e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Tagline</label><input value={settings.tagline} onChange={(e) => updateSetting("tagline", e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">Site URL</label><input value={settings.siteUrl} onChange={(e) => updateSetting("siteUrl", e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">Meta Description</label><textarea rows={2} value={settings.metaDescription} onChange={(e) => updateSetting("metaDescription", e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Default Language</label><select value={settings.language} onChange={(e) => updateSetting("language", e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option value="en">English</option><option value="hi">Hindi</option></select></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Timezone</label><select value={settings.timezone} onChange={(e) => updateSetting("timezone", e.target.value)} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option>Asia/Kolkata</option><option>UTC</option></select></div>
              </div>
            </div>
          )}

          {activeTab === "branding" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h3 className="font-bold text-slate-800">Branding</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Primary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={settings.primaryColor} onChange={(e) => updateSetting("primaryColor", e.target.value)} className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer" />
                    <input value={settings.primaryColor} onChange={(e) => updateSetting("primaryColor", e.target.value)} className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Secondary Color</label>
                  <div className="flex items-center gap-3">
                    <input type="color" value={settings.secondaryColor} onChange={(e) => updateSetting("secondaryColor", e.target.value)} className="h-10 w-10 rounded-lg border border-slate-200 cursor-pointer" />
                    <input value={settings.secondaryColor} onChange={(e) => updateSetting("secondaryColor", e.target.value)} className="flex-1 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono" />
                  </div>
                </div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">Logo URL</label><input value={settings.logo} onChange={(e) => updateSetting("logo", e.target.value)} placeholder="/logo.svg" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">Favicon URL</label><input value={settings.favicon} onChange={(e) => updateSetting("favicon", e.target.value)} placeholder="/favicon.ico" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
            </div>
          )}

          {activeTab === "contact" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h3 className="font-bold text-slate-800">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Contact Email</label><input type="email" value={settings.contactEmail} onChange={(e) => updateSetting("contactEmail", e.target.value)} placeholder="hello@careerguru.com" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Contact Phone</label><input value={settings.contactPhone} onChange={(e) => updateSetting("contactPhone", e.target.value)} placeholder="+91-" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">WhatsApp Number</label><input value={settings.whatsappNumber} onChange={(e) => updateSetting("whatsappNumber", e.target.value)} placeholder="+91-" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">Address</label><textarea rows={2} value={settings.address} onChange={(e) => updateSetting("address", e.target.value)} placeholder="Office address" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h3 className="font-bold text-slate-800">Social Links</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "facebook" as const, label: "Facebook", placeholder: "https://facebook.com/..." },
                  { key: "twitter" as const, label: "Twitter / X", placeholder: "https://x.com/..." },
                  { key: "instagram" as const, label: "Instagram", placeholder: "https://instagram.com/..." },
                  { key: "linkedin" as const, label: "LinkedIn", placeholder: "https://linkedin.com/..." },
                  { key: "youtube" as const, label: "YouTube", placeholder: "https://youtube.com/..." },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}><label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label><input value={settings.socialLinks[key] || ""} onChange={(e) => updateSocial(key, e.target.value)} placeholder={placeholder} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1">Footer Content</label>
                <textarea rows={3} value={settings.footerContent} onChange={(e) => updateSetting("footerContent", e.target.value)} placeholder="Copyright text or additional footer HTML" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" />
              </div>
            </div>
          )}

          {activeTab === "email" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h3 className="font-bold text-slate-800">Email Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">SMTP Host</label><input defaultValue="smtp.resend.com" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">SMTP Port</label><input defaultValue="587" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50"><MailIcon className="h-4 w-4" /> Send Test Email</button>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h3 className="font-bold text-slate-800">Notification Preferences</h3>
              {[
                { label: "New User Registration", desc: "Get notified when a new user signs up" },
                { label: "Counselling Bookings", desc: "Alert on new counselling session bookings" },
                { label: "New Leads", desc: "Get notified of new lead submissions" },
                { label: "Blog Comments", desc: "Notify on new article comments" },
                { label: "System Errors", desc: "Critical error alerts" },
              ].map((n) => (
                <div key={n.label} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{n.label}</p>
                    <p className="text-xs text-slate-400">{n.desc}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-brand-royal peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h3 className="font-bold text-slate-800">Security Settings</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">JWT Secret</label><input type="password" defaultValue="••••••••••••••••" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm font-mono" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Session Duration</label><select defaultValue="7d" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option value="1d">1 Day</option><option value="7d">7 Days</option><option value="30d">30 Days</option></select></div>
              </div>
              <div><label className="block text-xs font-semibold text-slate-500 mb-1">Allowed Admin IPs</label><input placeholder="e.g., 192.168.1.1, 10.0.0.1" className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
              <div className="flex items-center justify-between py-2">
                <div><p className="text-sm font-medium text-slate-700">Two-Factor Authentication</p><p className="text-xs text-slate-400">Require 2FA for all admin accounts</p></div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-brand-royal peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            </div>
          )}

          {activeTab === "backup" && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
              <h3 className="font-bold text-slate-800">Backup & Maintenance</h3>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3">
                <Database className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-amber-800">Last Backup</p>
                  <p className="text-xs text-amber-600">June 1, 2026 at 03:00 AM IST (24 hours ago)</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-royal text-white text-sm font-medium hover:bg-brand-navy transition-colors"><Database className="h-4 w-4" /> Backup Now</button>
                <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50"><Database className="h-4 w-4" /> Restore from Backup</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
