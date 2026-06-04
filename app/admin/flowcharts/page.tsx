"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, X, CheckCircle, Link2 } from "lucide-react";

interface FlowchartNode {
  _id?: string; id?: string;
  name: string; description: string;
  level: number; parentId: string | null; color: string;
  salary?: string; growth?: string;
}

export default function FlowchartsPage() {
  const [nodes, setNodes] = useState<FlowchartNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editingNode, setEditingNode] = useState<FlowchartNode | null>(null);
  const [message, setMessage] = useState("");

  const getToken = () => document.cookie.match(/cg-auth-token=([^;]+)/)?.[1] || "";

  const fetchNodes = useCallback(async () => {
    try {
      const params = selectedLevel !== null ? `?level=${selectedLevel}` : "";
      const res = await fetch(`/api/admin/flowcharts${params}`, {
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      setNodes(data.nodes || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [selectedLevel]);

  useEffect(() => { fetchNodes(); }, [fetchNodes]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const fd = new FormData(form);
    const body: Record<string, unknown> = {
      name: fd.get("name"),
      description: fd.get("description"),
      level: Number(fd.get("level")),
      parentId: fd.get("parentId") || null,
      color: fd.get("color"),
      salary: fd.get("salary"),
      growth: fd.get("growth"),
    };

    try {
      const url = "/api/admin/flowcharts";
      const method = editingNode ? "PUT" : "POST";
      if (editingNode) body.id = editingNode._id || editingNode.id;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        credentials: "include",
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingNode ? "Node updated" : "Node created");
        fetchNodes();
        setShowEditor(false);
        setEditingNode(null);
      }
    } catch (e) { console.error(e); }
  };

  const handleDelete = async (node: FlowchartNode) => {
    if (!confirm(`Delete "${node.name}"?`)) return;
    try {
      const id = node._id || node.id;
      const res = await fetch(`/api/admin/flowcharts?id=${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) { setMessage("Node deleted"); fetchNodes(); }
    } catch (e) { console.error(e); }
  };

  const levels = [0, 1, 2, 3];

  const parentOptions = nodes.filter((n) => n.level < 3);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-slate-800">Flowcharts</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 animate-pulse">
              <div className="h-10 w-10 bg-slate-100 rounded-xl mb-3" />
              <div className="h-4 w-32 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-full bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Flowcharts</h1>
          <p className="text-sm text-slate-500 mt-1">{nodes.length} nodes from database</p>
        </div>
        <button
          onClick={() => { setEditingNode(null); setShowEditor(true); }}
          className="btn-primary py-2.5 px-4 text-sm flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Node
        </button>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 text-emerald-700 text-sm p-3 rounded-xl text-center">
          {message}
        </motion.div>
      )}

      <div className="flex items-center gap-2">
        <button onClick={() => setSelectedLevel(null)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedLevel === null ? "bg-brand-gradient-static text-white shadow-brand-btn" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>All Levels</button>
        {levels.map((lvl) => (
          <button key={lvl} onClick={() => setSelectedLevel(lvl)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${selectedLevel === lvl ? "bg-brand-gradient-static text-white shadow-brand-btn" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"}`}>Level {lvl}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {nodes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">No nodes found. Add your first flowchart node.</div>
        ) : nodes.map((node) => (
          <div key={node._id || node.id} className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-2">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${node.color || "from-brand-royal to-brand-electric"} flex items-center justify-center text-white text-xs font-bold`}>L{node.level}</div>
              <div className="flex items-center gap-1">
                <button onClick={() => { setEditingNode(node); setShowEditor(true); }} className="p-2 rounded-lg hover:bg-slate-100"><Edit className="h-4 w-4 text-slate-400" /></button>
                <button onClick={() => handleDelete(node)} className="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            <h3 className="font-bold text-slate-800 text-sm">{node.name}</h3>
            <p className="text-xs text-slate-500 mt-1">{node.description}</p>
            <div className="flex items-center gap-3 mt-3 text-[11px]">
              {node.parentId && (
                <span className="flex items-center gap-1 text-slate-400"><Link2 className="h-3 w-3" /> Parent: {node.parentId}</span>
              )}
              {node.salary && <span className="text-emerald-600 font-medium">{node.salary}</span>}
              {node.growth && <span className={`font-medium ${node.growth === "Very High" ? "text-emerald-600" : "text-blue-600"}`}>{node.growth}</span>}
            </div>
          </div>
        ))}
      </div>

      {showEditor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowEditor(false)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <form onSubmit={handleSave} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800">{editingNode ? `Edit: ${editingNode.name}` : "Add New Node"}</h2>
                <button type="button" onClick={() => setShowEditor(false)} className="p-2 rounded-lg hover:bg-slate-100"><X className="h-5 w-5 text-slate-400" /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">ID (slug)</label><input name="id" defaultValue={editingNode?._id || editingNode?.id || ""} disabled={!!editingNode} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm text-slate-400" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Name</label><input name="name" defaultValue={editingNode?.name || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                </div>
                <div><label className="block text-xs font-semibold text-slate-500 mb-1">Description</label><input name="description" defaultValue={editingNode?.description || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:border-brand-royal" /></div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Level</label>
                    <select name="level" defaultValue={editingNode?.level ?? 1} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                      <option value={0}>0 - Start</option><option value={1}>1 - Stream</option><option value={2}>2 - Sub-stream</option><option value={3}>3 - Career</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Parent</label>
                    <select name="parentId" defaultValue={editingNode?.parentId || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                      <option value="">None</option>
                      {parentOptions.map((n) => <option key={n._id || n.id} value={n._id || n.id}>{n.name} (L{n.level})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Color</label>
                    <select name="color" defaultValue={editingNode?.color || "from-brand-royal to-brand-electric"} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                      <option>from-brand-navy to-brand-royal</option>
                      <option>from-blue-600 to-blue-400</option>
                      <option>from-indigo-600 to-indigo-400</option>
                      <option>from-purple-600 to-purple-400</option>
                      <option>from-amber-500 to-orange-400</option>
                      <option>from-brand-royal to-brand-electric</option>
                      <option>from-teal-500 to-emerald-500</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Salary</label><input name="salary" defaultValue={editingNode?.salary || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm" /></div>
                  <div><label className="block text-xs font-semibold text-slate-500 mb-1">Growth</label><select name="growth" defaultValue={editingNode?.growth || ""} className="w-full p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-sm"><option value="">None</option><option>Very High</option><option>High</option><option>Moderate</option><option>Stable</option></select></div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowEditor(false)} className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-medium text-sm hover:bg-slate-50">Cancel</button>
                <button type="submit" className="btn-primary py-2.5 px-6 text-sm flex items-center gap-2"><CheckCircle className="h-4 w-4" /> {editingNode ? "Save Changes" : "Create Node"}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
