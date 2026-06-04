"use client";

import { useState, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Filter, ZoomIn, ZoomOut, Maximize2, X, TrendingUp, IndianRupee, GraduationCap, Briefcase, ArrowRight, ChevronRight, Sparkles } from "lucide-react";

interface CareerNode {
  id: string;
  name: string;
  description: string;
  salary?: string;
  growth?: string;
  level: number;
  parentId?: string;
  color: string;
}

const careerTree: CareerNode[] = [
  { id: "10th", name: "10th Pass", description: "Starting point for all career paths", level: 0, color: "from-brand-navy to-brand-royal" },
  // Science
  { id: "science", name: "Science Stream", description: "For future engineers, doctors, researchers", level: 1, parentId: "10th", color: "from-blue-600 to-blue-400" },
  { id: "pcm", name: "PCM (Physics, Chemistry, Math)", description: "Core engineering mathematics track", level: 2, parentId: "science", color: "from-blue-500 to-cyan-500" },
  { id: "pcb", name: "PCB (Physics, Chemistry, Biology)", description: "Medical and life sciences track", level: 2, parentId: "science", color: "from-teal-500 to-emerald-500" },
  { id: "software-engineer", name: "Software Engineer", description: "Build and develop software applications", salary: "₹8L - ₹40L+", growth: "Very High", level: 3, parentId: "pcm", color: "from-brand-royal to-brand-electric" },
  { id: "data-scientist", name: "Data Scientist", description: "Extract insights from complex data", salary: "₹6L - ₹60L+", growth: "Very High", level: 3, parentId: "pcm", color: "from-brand-royal to-brand-electric" },
  { id: "mechanical-engineer", name: "Mechanical Engineer", description: "Design and manufacture mechanical systems", salary: "₹4L - ₹20L+", growth: "High", level: 3, parentId: "pcm", color: "from-brand-royal to-brand-electric" },
  { id: "civil-engineer", name: "Civil Engineer", description: "Plan and construct infrastructure projects", salary: "₹4L - ₹18L+", growth: "Moderate", level: 3, parentId: "pcm", color: "from-brand-royal to-brand-electric" },
  { id: "doctor", name: "Doctor (MBBS)", description: "Diagnose and treat medical conditions", salary: "₹6L - ₹1Cr+", growth: "Very High", level: 3, parentId: "pcb", color: "from-brand-royal to-brand-electric" },
  { id: "pharmacist", name: "Pharmacist", description: "Prepare and dispense medications", salary: "₹3L - ₹15L+", growth: "Moderate", level: 3, parentId: "pcb", color: "from-brand-royal to-brand-electric" },
  { id: "biotechnologist", name: "Biotechnologist", description: "Advance healthcare and agriculture through biology", salary: "₹4L - ₹25L+", growth: "High", level: 3, parentId: "pcb", color: "from-brand-royal to-brand-electric" },
  // Commerce
  { id: "commerce", name: "Commerce Stream", description: "For future business leaders, finance experts", level: 1, parentId: "10th", color: "from-indigo-600 to-indigo-400" },
  { id: "ca", name: "Chartered Accountant", description: "Audit, tax, and financial advisory expert", salary: "₹6L - ₹50L+", growth: "High", level: 2, parentId: "commerce", color: "from-brand-royal to-brand-electric" },
  { id: "investment-banker", name: "Investment Banker", description: "Facilitate capital raising and M&A deals", salary: "₹10L - ₹1Cr+", growth: "Very High", level: 2, parentId: "commerce", color: "from-brand-royal to-brand-electric" },
  { id: "mba", name: "MBA Professional", description: "Lead organizations across industries", salary: "₹8L - ₹40L+", growth: "High", level: 2, parentId: "commerce", color: "from-brand-royal to-brand-electric" },
  { id: "economist", name: "Economist", description: "Analyze economic trends and policies", salary: "₹5L - ₹35L+", growth: "High", level: 2, parentId: "commerce", color: "from-brand-royal to-brand-electric" },
  // Arts
  { id: "arts", name: "Arts/Humanities", description: "For creative thinkers, change makers", level: 1, parentId: "10th", color: "from-purple-600 to-purple-400" },
  { id: "lawyer", name: "Lawyer (LLB)", description: "Advocate for justice and legal rights", salary: "₹4L - ₹30L+", growth: "High", level: 2, parentId: "arts", color: "from-brand-royal to-brand-electric" },
  { id: "civil-servant", name: "Civil Servant (IAS/IPS)", description: "Serve the nation through governance", salary: "₹6L - ₹25L+", growth: "Stable", level: 2, parentId: "arts", color: "from-brand-royal to-brand-electric" },
  { id: "designer", name: "Designer", description: "Create visual and functional experiences", salary: "₹4L - ₹30L+", growth: "High", level: 2, parentId: "arts", color: "from-brand-royal to-brand-electric" },
  { id: "psychologist", name: "Psychologist", description: "Understand and improve mental well-being", salary: "₹4L - ₹20L+", growth: "High", level: 2, parentId: "arts", color: "from-brand-royal to-brand-electric" },
  // Vocational
  { id: "vocational", name: "Vocational/Skills", description: "For hands-on practical professionals", level: 1, parentId: "10th", color: "from-amber-500 to-orange-400" },
  { id: "iti-technician", name: "ITI Technician", description: "Specialized industrial and technical work", salary: "₹2L - ₹10L+", growth: "Stable", level: 2, parentId: "vocational", color: "from-brand-royal to-brand-electric" },
  { id: "polytechnic", name: "Polytechnic Engineer", description: "Hands-on engineering and technology", salary: "₹3L - ₹15L+", growth: "Moderate", level: 2, parentId: "vocational", color: "from-brand-royal to-brand-electric" },
  { id: "nurse", name: "Nurse", description: "Provide essential healthcare services", salary: "₹3L - ₹12L+", growth: "High", level: 2, parentId: "vocational", color: "from-brand-royal to-brand-electric" },
];

const streams = ["All", "Science", "Commerce", "Arts/Humanities", "Vocational"];
const categories = ["All", "Government", "Private", "Professional", "Emerging"];

export default function FlowchartPage() {
  const [search, setSearch] = useState("");
  const [selectedStream, setSelectedStream] = useState("All");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [zoom, setZoom] = useState(1);
  const [selectedNode, setSelectedNode] = useState<CareerNode | null>(null);
  const [savedCareers, setSavedCareers] = useState<string[]>([]);

  const filteredNodes = useMemo(() => {
    let nodes = careerTree;
    if (selectedStream !== "All") {
      const streamMap: Record<string, string[]> = {
        Science: ["science", "pcm", "pcb", "software-engineer", "data-scientist", "mechanical-engineer", "civil-engineer", "doctor", "pharmacist", "biotechnologist"],
        Commerce: ["commerce", "ca", "investment-banker", "mba", "economist"],
        "Arts/Humanities": ["arts", "lawyer", "civil-servant", "designer", "psychologist"],
        Vocational: ["vocational", "iti-technician", "polytechnic", "nurse"],
      };
      nodes = nodes.filter((n) => streamMap[selectedStream]?.includes(n.id) || n.id === "10th");
    }
    if (search) {
      nodes = nodes.filter((n) => n.name.toLowerCase().includes(search.toLowerCase()));
    }
    return nodes;
  }, [search, selectedStream]);

  const toggleSave = (id: string) => {
    setSavedCareers((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);
  };

  const getNodesByLevel = (level: number) => filteredNodes.filter((n) => n.level === level);

  return (
    <div className="min-h-screen bg-brand-bg pt-16">
      {/* Header */}
      <div className="bg-white border-b border-neutral-lightGray/50">
        <div className="container-custom py-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-1">
              <h1 className="heading-section text-2xl md:text-3xl">Interactive Career Flowchart</h1>
              <p className="text-sm text-neutral-mediumGray">Explore all career paths after 10th — click any career to see details</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))} className="p-2.5 rounded-xl bg-brand-bg hover:bg-neutral-lightGray transition-colors">
                <ZoomOut className="h-5 w-5 text-neutral-darkGray" />
              </button>
              <span className="text-sm font-medium text-neutral-darkGray min-w-[60px] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={() => setZoom((z) => Math.min(2, z + 0.25))} className="p-2.5 rounded-xl bg-brand-bg hover:bg-neutral-lightGray transition-colors">
                <ZoomIn className="h-5 w-5 text-neutral-darkGray" />
              </button>
              <button onClick={() => setZoom(1)} className="p-2.5 rounded-xl bg-brand-bg hover:bg-neutral-lightGray transition-colors">
                <Maximize2 className="h-5 w-5 text-neutral-darkGray" />
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-mediumGray" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search careers..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-neutral-lightGray focus:border-brand-royal focus:outline-none focus:ring-2 focus:ring-brand-royal/10 text-sm"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {streams.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedStream(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selectedStream === s ? "bg-brand-gradient-static text-white shadow-brand-btn" : "bg-white text-neutral-darkGray hover:bg-brand-bg border border-neutral-lightGray"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Flowchart Area */}
      <div className="container-custom py-8">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Flowchart */}
          <div className="flex-1" style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}>
            <div className="space-y-6">
              {/* Level 0: 10th Pass */}
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="relative"
                >
                  <div className={`w-56 p-4 rounded-2xl bg-gradient-to-br from-brand-navy to-brand-royal text-white text-center shadow-2xl shadow-brand-royal/30 cursor-pointer transition-all hover:scale-105 ${selectedNode?.id === "10th" ? "ring-4 ring-brand-sky" : ""}`}
                    onClick={() => setSelectedNode(careerTree.find((n) => n.id === "10th") || null)}
                  >
                    <GraduationCap className="h-6 w-6 mx-auto mb-2 text-brand-sky" />
                    <p className="font-bold text-lg">10th Pass</p>
                    <p className="text-xs text-white/60 mt-1">Starting Point</p>
                  </div>
                  {/* Connector Lines */}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-brand-royal to-brand-electric" />
                </motion.div>
              </div>

              {/* Level 1: Streams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8">
                {getNodesByLevel(1).map((node) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative"
                  >
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-br ${node.color} text-white text-center shadow-lg cursor-pointer transition-all hover:scale-105 hover:shadow-xl ${selectedNode?.id === node.id ? "ring-4 ring-brand-sky" : ""}`}
                      onClick={() => setSelectedNode(node)}
                    >
                      <p className="font-bold">{node.name}</p>
                      <p className="text-xs text-white/70 mt-1">{node.description}</p>
                    </div>
                    {/* Connector dots */}
                    <div className="flex justify-center mt-2">
                      <div className="h-2 w-2 rounded-full bg-brand-electric" />
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Level 2: Sub-streams */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {getNodesByLevel(2).map((node) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="relative"
                  >
                    <div
                      className={`p-4 rounded-xl bg-white border-2 border-neutral-lightGray hover:border-brand-electric cursor-pointer transition-all hover:shadow-brand-hover ${selectedNode?.id === node.id ? "border-brand-sky ring-2 ring-brand-sky/20" : ""}`}
                      onClick={() => setSelectedNode(node)}
                    >
                      <p className="font-semibold text-neutral-nearBlack text-sm">{node.name}</p>
                      <p className="text-xs text-neutral-mediumGray mt-1">{node.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Level 3: Career Nodes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
                {getNodesByLevel(3).map((node) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative"
                  >
                    <div
                      className={`p-4 rounded-xl glass-card cursor-pointer group transition-all hover:shadow-brand-hover ${selectedNode?.id === node.id ? "ring-2 ring-brand-sky" : ""}`}
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-semibold text-neutral-nearBlack group-hover:text-brand-royal transition-colors">{node.name}</p>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleSave(node.id); }}
                          className={`text-lg transition-colors ${savedCareers.includes(node.id) ? "text-red-500" : "text-neutral-lightGray hover:text-red-400"}`}
                        >
                          {savedCareers.includes(node.id) ? "♥" : "♡"}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        {node.salary && (
                          <span className="flex items-center gap-1 text-green-600 font-medium">
                            <IndianRupee className="h-3 w-3" /> {node.salary}
                          </span>
                        )}
                        {node.growth && (
                          <span className={`px-2 py-0.5 rounded-full font-medium ${
                            node.growth === "Very High" ? "bg-emerald-100 text-emerald-700" :
                            node.growth === "High" ? "bg-green-100 text-green-700" :
                            "bg-blue-100 text-blue-700"
                          }`}>
                            {node.growth}
                          </span>
                        )}
                      </div>
                      <Link
                        href={`/careers/${node.id}`}
                        className="inline-flex items-center gap-1 text-brand-royal text-xs font-medium mt-2 hover:underline"
                      >
                        Explore <ChevronRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar: Node Details */}
          <div className="lg:w-96 flex-shrink-0">
            <div className="glass-card p-6 sticky top-24">
              {selectedNode ? (
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <span className="text-xs font-semibold text-brand-royal uppercase tracking-wider">Level {selectedNode.level}</span>
                      <h3 className="heading-card text-xl mt-1">{selectedNode.name}</h3>
                    </div>
                    <button
                      onClick={() => toggleSave(selectedNode.id)}
                      className={`p-2 rounded-xl transition-colors ${savedCareers.includes(selectedNode.id) ? "bg-red-50 text-red-500" : "bg-brand-bg text-neutral-mediumGray hover:text-red-400"}`}
                    >
                      {savedCareers.includes(selectedNode.id) ? "♥ Saved" : "♡ Save"}
                    </button>
                  </div>
                  <p className="text-neutral-mediumGray text-sm mb-4">{selectedNode.description}</p>
                  {selectedNode.salary && (
                    <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-green-50">
                      <IndianRupee className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Salary Range</p>
                        <p className="font-semibold text-green-800">{selectedNode.salary}</p>
                      </div>
                    </div>
                  )}
                  {selectedNode.growth && (
                    <div className="flex items-center gap-2 mb-3 p-3 rounded-xl bg-blue-50">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Growth Outlook</p>
                        <p className="font-semibold text-blue-800">{selectedNode.growth}</p>
                      </div>
                    </div>
                  )}
                  {selectedNode.level >= 2 && (
                    <Link
                      href={`/careers/${selectedNode.id}`}
                      className="btn-primary w-full inline-flex items-center justify-center gap-2 mt-4"
                    >
                      View Full Career Profile <ArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                  {selectedNode.level < 2 && (
                    <p className="text-xs text-neutral-mediumGray text-center mt-4">
                      Click sub-nodes to explore career paths in this stream
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Sparkles className="h-10 w-10 text-brand-electric mx-auto mb-3" />
                  <p className="font-semibold text-neutral-darkGray mb-1">Explore Careers</p>
                  <p className="text-sm text-neutral-mediumGray">Click on any career node to see detailed information, salary data, and growth projections.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
