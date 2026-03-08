import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Calendar,
  CircleDollarSign,
  ExternalLink,
  Heart,
  Sparkles,
  ArrowRight,
  Globe,
  Github,
  Linkedin,
  Instagram,
} from "lucide-react";

// --- ANIMATED TECHNICAL LOGO COMPONENT ---
const NexusLogo = ({ isLoading }) => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 40 40"
    fill="none"
    className="shrink-0 border border-slate-900 shadow-[2px_2px_0px_0px_rgba(15,23,42,1)]"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="40" height="40" fill="#0f172a" />
    {isLoading && (
      <path d="M0 10H40M0 20H40M0 30H40M10 0V40M20 0V40M30 0V40" stroke="#1e293b" strokeWidth="0.5" />
    )}
    <path
      className={isLoading ? "animate-nexus-trace" : ""}
      d="M10 30V10L16 10V22L24 10H30V30H24V18L16 30H10Z"
      fill="white"
      style={{
        strokeDasharray: isLoading ? "100" : "0",
        stroke: isLoading ? "#2563eb" : "none",
        strokeWidth: isLoading ? "1px" : "0",
      }}
    />
    <rect x="24" y="24" width="6" height="6" fill="#2563eb" className={isLoading ? "animate-pulse" : ""} />
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes nexus-trace {
        0% { fill-opacity: 0.3; stroke-dashoffset: 100; }
        50% { fill-opacity: 1; stroke-dashoffset: 0; }
        100% { fill-opacity: 0.3; stroke-dashoffset: -100; }
      }
      .animate-nexus-trace { animation: nexus-trace 2s infinite ease-in-out; }
    `}} />
  </svg>
);

function App() {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [jobs, setJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalResults, setTotalResults] = useState(0);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("nexus_saved_jobs");
    if (saved) setSavedJobs(JSON.parse(saved));
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    localStorage.setItem("nexus_saved_jobs", JSON.stringify(savedJobs));
  }, [savedJobs]);

  const searchJobs = async (targetPage = 1) => {
    try {
      setLoading(true);
      setError("");
      setShowSaved(false);
      const url = `http://127.0.0.1:8000/jobs?title=${encodeURIComponent(title)}&location=${encodeURIComponent(location)}&page=${targetPage}&limit=${limit}`;
      const response = await fetch(url);
      const data = await response.json();
      setJobs(data.jobs || []);
      setPage(data.page || targetPage);
      setTotalResults(data.total_results || 0);
    } catch (err) {
      setError("SERVER_CONNECTION_ERROR: Please verify backend status.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSaveJob = (job) => {
    const isSaved = savedJobs.some((s) => s.apply_link === job.apply_link);
    if (isSaved) {
      setSavedJobs(savedJobs.filter((s) => s.apply_link !== job.apply_link));
    } else {
      setSavedJobs([...savedJobs, job]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchJobs(1);
  };

  const displayJobs = useMemo(() => {
    const baseList = showSaved ? savedJobs : jobs;
    if (sourceFilter === "all") return baseList;
    return baseList.filter((job) => job.source?.toLowerCase() === sourceFilter.toLowerCase());
  }, [jobs, savedJobs, showSaved, sourceFilter]);

  const totalPages = Math.max(1, Math.ceil(totalResults / limit));

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      {/* GRID BACKGROUND */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* NAV */}
        <nav className="border-b border-slate-900 bg-white sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <NexusLogo isLoading={loading} />
              <span className="font-mono font-black text-lg sm:text-xl tracking-tighter uppercase whitespace-nowrap">
                Nexus.sys
              </span>
            </div>

            <button
              onClick={() => setShowSaved(!showSaved)}
              className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-mono font-bold border-2 transition-all ${showSaved ? "bg-blue-600 border-blue-600 text-white" : "border-slate-900 hover:bg-slate-100"}`}
            >
              <Heart size={12} className="sm:size-3.5" fill={showSaved ? "white" : "none"} />
              <span className="hidden xs:inline">SAVED_DATA</span> ({savedJobs.length})
            </button>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12 w-full flex-1">
          {/* SEARCH SECTION */}
          <section className="max-w-4xl mx-auto mb-10 sm:mb-16">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tighter mb-6 sm:mb-8 leading-none">
              {showSaved ? "Database: Saved" : "Search_Future"}
            </h1>

            {!showSaved && (
              <div className="border-[3px] sm:border-4 border-slate-900 bg-white p-1.5 sm:p-2 flex flex-col md:flex-row gap-2 shadow-[4px_4px_0px_0px_rgba(15,23,42,1)] sm:shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                <div className="flex-1 flex items-center px-3 sm:px-4 py-3 gap-3 border-b-2 md:border-b-0 md:border-r-2 border-slate-100">
                  <Search size={18} className="text-slate-400 shrink-0" />
                  <input className="bg-transparent w-full text-xs sm:text-sm font-mono focus:outline-none font-bold uppercase" placeholder="QUERY_TITLE..." value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                <div className="flex-1 flex items-center px-3 sm:px-4 py-3 gap-3">
                  <MapPin size={18} className="text-slate-400 shrink-0" />
                  <input className="bg-transparent w-full text-xs sm:text-sm font-mono focus:outline-none font-bold uppercase" placeholder="LOC_PARAMETER..." value={location} onChange={(e) => setLocation(e.target.value)} onKeyDown={handleKeyDown} />
                </div>
                <button onClick={() => searchJobs(1)} className="bg-blue-600 text-white px-6 sm:px-10 py-3 sm:py-4 font-mono font-black text-xs sm:text-sm hover:bg-slate-900 transition-colors uppercase flex items-center justify-center gap-2 active:translate-x-1 active:translate-y-1">
                  {loading ? "PROCESSING..." : "EXECUTE"} <ArrowRight size={16} />
                </button>
              </div>
            )}
            {error && <p className="mt-6 text-[10px] sm:text-xs font-mono font-bold text-red-600 bg-red-50 p-3 border border-red-200">{error}</p>}
          </section>

          {/* FILTER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-2 border-b-2 border-slate-900 gap-4">
            <span className="text-[10px] sm:text-xs font-mono font-black text-slate-500 uppercase">
              // {displayJobs.length} NODES_FOUND
            </span>
            <div className="flex items-center gap-2">
              <Globe size={14} className="shrink-0" />
              <select className="bg-transparent text-[10px] sm:text-xs font-mono font-bold focus:outline-none uppercase cursor-pointer" value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
                <option value="all">SRC: ALL_PLATFORMS</option>
                <option value="indeed">SRC: INDEED</option>
                <option value="internshala">SRC: INTERNSHALA</option>
              </select>
            </div>
          </div>

          {/* JOB GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {displayJobs.map((job, index) => {
              const isSaved = savedJobs.some((s) => s.apply_link === job.apply_link);
              return (
                <div key={job.apply_link || index} className="group relative flex flex-col p-5 sm:p-6 border-2 border-slate-900 bg-white hover:bg-slate-50 transition-all duration-200 hover:shadow-[4px_4px_0px_0px_rgba(15,23,42,1)]">
                  <div className="flex justify-between items-start mb-4 sm:mb-6 gap-3">
                    <span className="text-[9px] sm:text-[10px] font-mono font-black px-2 py-0.5 sm:py-1 bg-slate-900 text-white uppercase shrink-0">{job.source}</span>
                    <button onClick={() => toggleSaveJob(job)} className={`p-2 border border-slate-200 transition-all ${isSaved ? "bg-blue-600 border-blue-600 text-white" : "hover:border-slate-900 bg-white"}`}>
                      <Heart size={16} fill={isSaved ? "currentColor" : "none"} />
                    </button>
                  </div>
                  <h3 className="text-base sm:text-lg font-black leading-tight mb-1 uppercase tracking-tighter line-clamp-2">{job.title}</h3>
                  <p className="text-[11px] sm:text-xs font-mono font-bold text-blue-600 mb-6 sm:mb-8 truncate">{job.company}</p>
                  <div className="space-y-3 mb-8 sm:mb-10 font-mono">
                    <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-bold uppercase"><MapPin size={14} className="text-slate-400 shrink-0" /><span className="truncate">{job.location}</span></div>
                    <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-bold uppercase"><CircleDollarSign size={14} className="text-slate-400 shrink-0" /><span className="truncate">{job.salary || "NEGOTIABLE"}</span></div>
                    <div className="flex items-center gap-3 text-[10px] sm:text-[11px] font-bold opacity-50 uppercase"><Calendar size={14} className="shrink-0" /><span className="truncate">POSTED: {job.date_posted}</span></div>
                  </div>
                  <a href={job.apply_link} target="_blank" rel="noreferrer" className="mt-auto flex items-center justify-center gap-2 w-full py-3 sm:py-4 bg-white border-2 border-slate-900 text-slate-900 font-mono font-black text-[10px] sm:text-xs uppercase hover:bg-slate-900 hover:text-white transition-all active:translate-x-0.5 active:translate-y-0.5">
                    ACCESS_URL <ExternalLink size={14} />
                  </a>
                </div>
              );
            })}
          </div>

          {/* PAGINATION */}
          {!showSaved && totalResults > 0 && (
            <div className="mt-12 sm:mt-16 pt-8 border-t-2 border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6 font-mono">
              <button onClick={() => searchJobs(page - 1)} disabled={page <= 1 || loading} className="w-full md:w-auto px-8 py-3 border-2 border-slate-900 font-black text-xs uppercase hover:bg-slate-100 disabled:opacity-20 transition-all">{"< PREV_PAGE"}</button>
              <span className="font-black text-xs sm:text-sm bg-slate-100 px-4 py-2 border border-slate-900">[ INDEX: {page} / {totalPages} ]</span>
              <button onClick={() => searchJobs(page + 1)} disabled={page >= totalPages || loading} className="w-full md:w-auto px-8 py-3 border-2 border-slate-900 font-black text-xs uppercase hover:bg-slate-100 disabled:opacity-20 transition-all">{"NEXT_PAGE >"}</button>
            </div>
          )}

          {displayJobs.length === 0 && !loading && (
            <div className="text-center py-24 sm:py-32 border-2 border-dashed border-slate-300">
              <p className="font-mono font-black text-slate-300 uppercase tracking-[0.2em] sm:tracking-[0.5em] text-sm sm:text-base px-4">System.Empty_Result_Set</p>
            </div>
          )}
        </main>

        <footer className="border-t-2 border-slate-900 py-8 bg-white">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 font-mono uppercase">
            <div className="flex flex-col items-center md:items-start gap-1">
              <span className="text-[10px] font-black opacity-50">© 2024 Nexus.System</span>
              <span className="text-xs font-black tracking-widest text-blue-600">SOUMYA</span>
            </div>
            
            <div className="flex gap-8 text-slate-900">
              <a href="https://github.com/SoumyaranjanDS/" className="hover:text-blue-600 transition-colors" target="_blank" rel="noreferrer"><Github size={20} /></a>
              <a href="https://www.linkedin.com/in/soumyaranjanlink/" className="hover:text-blue-600 transition-colors" target="_blank" rel="noreferrer"><Linkedin size={20} /></a>
              <a href="https://www.instagram.com/_.soumya_28?igsh=MW51OTV2bnc3aHdxaQ==" className="hover:text-blue-600 transition-colors" target="_blank" rel="noreferrer"><Instagram size={20} /></a>
            </div>

            <div className="flex flex-col items-center md:items-end gap-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-400 animate-pulse' : 'bg-emerald-500'}`} />
                <span className="text-[10px] font-black opacity-50">Status: {loading ? 'Processing' : 'Online'}</span>
              </div>
              <span className="text-[10px] font-black opacity-50">{totalResults} Nodes Syncing</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;