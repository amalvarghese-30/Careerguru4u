"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, Filter, MoreVertical, Mail, Phone, Calendar,
  Shield, CheckCircle, XCircle, Trash2, UserPlus, Download, X,
} from "lucide-react";

interface User {
  _id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  board: string;
  class: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ fullName: "", email: "", password: "", phone: "", role: "student" });

  const getToken = () => document.cookie.match(/cg-auth-token=([^;]+)/)?.[1] || "";

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);
      const res = await fetch(`/api/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      if (data.users) setUsers(data.users);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (id: string, action: string, role?: string) => {
    try {
      const body: Record<string, string> = {};
      if (action === "suspend") body.status = "suspended";
      if (action === "activate") body.status = "active";
      if (role) body.role = role;

      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify({ id, ...body }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(action === "delete" ? "User deleted" : "User updated successfully");
        fetchUsers();
        setSelectedUser(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    try {
      const res = await fetch(`/api/admin/users?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setMessage("User deleted successfully");
        fetchUsers();
        setSelectedUser(null);
      } else {
        setMessage(data.error || "Delete failed");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("User created successfully");
        setShowAddModal(false);
        setAddForm({ fullName: "", email: "", password: "", phone: "", role: "student" });
        fetchUsers();
      } else {
        setMessage(data.error || "Failed to create user");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    const headers = ["Full Name", "Email", "Phone", "Role", "Board", "Class", "Status", "Joined"];
    const rows = users.map((u) => [
      u.fullName || "", u.email || "", u.phone || "", u.role || "",
      u.board || "", u.class || "", u.status || "active",
      new Date(u.createdAt).toLocaleDateString("en-IN"),
    ]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `users-export-${new Date().toISOString().slice(0, 10)}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const roleColors: Record<string, string> = {
    admin: "bg-red-100 text-red-700", super_admin: "bg-red-100 text-red-700",
    counsellor: "bg-blue-100 text-blue-700", student: "bg-slate-100 text-slate-700",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Users</h1>
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Users</h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} users from database</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button onClick={() => setShowAddModal(true)} className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2">
            <UserPlus className="h-4 w-4" /> Add User
          </button>
        </div>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`text-sm p-3 rounded-xl text-center ${message.includes("fail") || message.includes("error") ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {message}
        </motion.div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text" placeholder="Search users..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 text-sm"
            />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
            className="py-2.5 px-4 rounded-xl border border-slate-200 text-sm bg-white">
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="counsellor">Counsellors</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase">User</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase">Board/Class</th>
                <th className="text-left py-3 px-3 text-xs font-semibold text-slate-400 uppercase">Joined</th>
                <th className="text-right py-3 px-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={5} className="py-12 text-center text-slate-400">No users found</td></tr>
              ) : users.map((user) => (
                <tr key={user._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-brand-bg flex items-center justify-center text-xs font-bold text-brand-royal">
                        {user.fullName?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-700">{user.fullName}</p>
                        <p className="text-xs text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${roleColors[user.role] || "bg-slate-100 text-slate-600"}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-sm text-slate-600">{user.board || "N/A"} / {user.class || "N/A"}</td>
                  <td className="py-3 px-3 text-sm text-slate-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => setSelectedUser(user)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-brand-royal">
                        <Filter className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedUser(null)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200"
              onClick={(e) => e.stopPropagation()}>
              <h3 className="font-bold text-slate-800 mb-4">{selectedUser.fullName}</h3>
              <div className="space-y-2 text-sm text-slate-600 mb-6">
                <p><Mail className="inline h-4 w-4 mr-2" />{selectedUser.email}</p>
                <p><Phone className="inline h-4 w-4 mr-2" />{selectedUser.phone}</p>
                <p><Calendar className="inline h-4 w-4 mr-2" />Joined {new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                <p><Shield className="inline h-4 w-4 mr-2" />Role: {selectedUser.role}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleAction(selectedUser._id, "activate")}
                  className="px-4 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-medium hover:bg-emerald-200 flex items-center gap-1">
                  <CheckCircle className="h-3.5 w-3.5" /> Activate
                </button>
                <button onClick={() => handleAction(selectedUser._id, "suspend")}
                  className="px-4 py-2 rounded-xl bg-amber-100 text-amber-700 text-sm font-medium hover:bg-amber-200 flex items-center gap-1">
                  <XCircle className="h-3.5 w-3.5" /> Suspend
                </button>
                <button onClick={() => handleAction(selectedUser._id, "changeRole", selectedUser.role === "admin" ? "student" : "admin")}
                  className="px-4 py-2 rounded-xl bg-blue-100 text-blue-700 text-sm font-medium hover:bg-blue-200 flex items-center gap-1">
                  <UserPlus className="h-3.5 w-3.5" /> Toggle Admin
                </button>
                <button onClick={() => handleDelete(selectedUser._id)}
                  className="px-4 py-2 rounded-xl bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 flex items-center gap-1">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              </div>
              <button onClick={() => setSelectedUser(null)}
                className="mt-4 w-full py-2 text-sm text-slate-400 hover:text-slate-600">
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border border-slate-200"
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-slate-800">Add New User</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <form onSubmit={handleAddUser} className="space-y-4">
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Full Name</label><input required value={addForm.fullName} onChange={(e) => setAddForm({ ...addForm, fullName: e.target.value })} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Email</label><input required type="email" value={addForm.email} onChange={(e) => setAddForm({ ...addForm, email: e.target.value })} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Password</label><input required type="password" minLength={6} value={addForm.password} onChange={(e) => setAddForm({ ...addForm, password: e.target.value })} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Phone</label><input value={addForm.phone} onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Role</label><select value={addForm.role} onChange={(e) => setAddForm({ ...addForm, role: e.target.value })} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option value="student">Student</option><option value="counsellor">Counsellor</option><option value="admin">Admin</option></select></div>
                <button type="submit" className="w-full py-2.5 rounded-xl bg-brand-gradient-static text-white text-sm font-bold hover:shadow-brand-btn transition-shadow">Create User</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
