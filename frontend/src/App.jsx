import React, { useEffect, useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Trash2, GraduationCap, 
  Upload, Clock, CheckCircle, Layers, Star, LogOut, BookOpen,
  Sparkles, Wand2, Image as ImageIcon, ExternalLink
} from 'lucide-react';
import Auth from './components/Auth'; 
import TradeHistory from './components/TradeHistory'; 

function App() {
  const [skills, setSkills] = useState([]);
  const [requests, setRequests] = useState([]); 
  const [unlockedCourses, setUnlockedCourses] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [pendingTargetSkill, setPendingTargetSkill] = useState(null);

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRoadmap, setAiRoadmap] = useState(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({ 
    title: "", description: "", syllabusText: "", duration: "", category: "Programming", photo: ""
  });
  const [syllabusFile, setSyllabusFile] = useState(null);
  const [pdfPreview, setPdfPreview] = useState(null); 

  const categories = ["All", "Programming", "Marketing", "Design", "Finance", "Business", "Other"];

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSkills([]);
    setRequests([]);
  }, []);

  const getCategoryStyles = (category) => {
    const styles = {
      Programming: "bg-gradient-to-br from-blue-600 to-indigo-800 border-blue-400 text-white shadow-lg shadow-blue-200/50",
      Marketing: "bg-gradient-to-br from-purple-600 to-fuchsia-800 border-purple-400 text-white shadow-lg shadow-purple-200/50",
      Design: "bg-gradient-to-br from-pink-500 to-rose-700 border-pink-400 text-white shadow-lg shadow-pink-200/50",
      Finance: "bg-gradient-to-br from-emerald-500 to-teal-800 border-emerald-400 text-white shadow-lg shadow-emerald-200/50",
      Business: "bg-gradient-to-br from-amber-500 to-orange-700 border-amber-400 text-white shadow-lg shadow-amber-200/50",
      Other: "bg-gradient-to-br from-slate-600 to-slate-800 border-slate-400 text-white shadow-lg shadow-slate-200/50"
    };
    return styles[category] || styles.Other;
  };

  const getCourseImage = (skill) => {
    if (skill.photo && skill.photo.startsWith('http')) return skill.photo;
    if (skill.syllabusFile) {
      return `http://localhost:5000/uploads/${skill.syllabusFile}`;
    }
    return `https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&sig=${skill._id || "default"}`;
  };

  const getDynamicRating = (id) => {
    const seed = id ? id.charCodeAt(id.length - 1) : 5;
    return { rating: (4 + (seed % 10) / 10).toFixed(1), reviews: (seed * 9) + 30 };
  };

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!user || !token) return;
    try {
      const config = { headers: { 'x-auth-token': token } };
      const [skillsRes, reqsRes] = await Promise.all([
        axios.get('http://localhost:5000/api/skills'),
        axios.get('http://localhost:5000/api/requests/history', config)
      ]);
      setSkills(skillsRes.data || []);
      setRequests(reqsRes.data || []);
    } catch (error) { 
      console.error("Fetch error:", error);
      if (error.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [user, handleLogout]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshHistory]);

  useEffect(() => {
    if (skills.length > 0 && requests.length > 0 && user) {
      const acceptedSwaps = requests.filter(req => req.status === 'accepted');
      const accessibleTitles = acceptedSwaps.map(req => {
        const isSender = req.sender?.toLowerCase() === user.name?.toLowerCase();
        const isReceiver = req.receiver?.toLowerCase() === user.name?.toLowerCase();
        if (isSender) return req.skillTitle;
        if (isReceiver) return req.senderSkill;
        return null;
      }).filter(Boolean);

      const myUnlocked = skills.filter(s => accessibleTitles.includes(s.title));
      setUnlockedCourses(myUnlocked);
    }
  }, [skills, requests, user]);

  const handleGenerateRoadmap = async (course) => {
    setAiLoading(true);
    setIsAiModalOpen(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ai/generate-roadmap', {
        title: course.title,
        syllabusText: course.syllabusText || course.description
      });
      setAiRoadmap(response.data.roadmap);
    } catch (error) {
      setAiRoadmap("Error generating roadmap.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleEnhanceDescription = async () => {
    if (!formData.description && !formData.title) {
      return alert("Please enter a Title or a rough Description first!");
    }

    setAiLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/api/ai/enhance-description', {
        title: formData.title,
        category: formData.category,
        description: formData.description,
        syllabusText: formData.syllabusText 
      });
      
      setFormData({ ...formData, description: response.data.enhancedText });
    } catch (error) {
      console.error("AI Enhancement Error:", error);
      alert("Failed to enhance description.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSwapRequest = async (targetSkill, selectedMySkillTitle = null) => {
    if (targetSkill.user === user.name) return alert("You cannot swap with yourself!");
    try {
      const token = localStorage.getItem('token');
      const mySkills = skills.filter(s => s.user === user.name);
      if (mySkills.length === 0) return alert("Please post a skill first!");
      if (mySkills.length > 1 && !selectedMySkillTitle) {
        setPendingTargetSkill(targetSkill);
        setIsSkillModalOpen(true);
        return;
      }
      const skillToOffer = selectedMySkillTitle || mySkills[0].title;
      await axios.post('http://localhost:5000/api/requests', {
        receiver: targetSkill.user, 
        skillTitle: targetSkill.title,
        senderSkill: skillToOffer,
        receiverId: targetSkill.userId || targetSkill._id
      }, { headers: { 'x-auth-token': token } });

      alert(`Proposal sent to ${targetSkill.user}`);
      setIsSkillModalOpen(false); 
      setRefreshHistory(prev => prev + 1);
    } catch (err) { alert("Error sending proposal"); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this course?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/skills/${id}`, { headers: { 'x-auth-token': token } });
      setSkills(skills.filter(s => s._id !== id));
    } catch (error) { console.error(error); }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setSyllabusFile(file);
      const url = URL.createObjectURL(file);
      setPdfPreview(url);
    } else {
      alert("Please select a PDF file");
    }
  };

  const handleRemovePdf = (e) => {
    e.stopPropagation(); 
    if (pdfPreview) {
      URL.revokeObjectURL(pdfPreview); 
    }
    setSyllabusFile(null);
    setPdfPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('user', user.name);
    data.append('userId', user._id || user.id); 
    
    if (syllabusFile) {
        data.append('syllabusFile', syllabusFile);
    }

    try {
      await axios.post('http://localhost:5000/api/skills', data, { 
        headers: { 
            'x-auth-token': token, 
            'Content-Type': 'multipart/form-data' 
        } 
      });
      setIsModalOpen(false);
      if (pdfPreview) URL.revokeObjectURL(pdfPreview);
      setFormData({ title: "", description: "", syllabusText: "", duration: "", category: "Programming", photo: "" });
      setSyllabusFile(null);
      setPdfPreview(null);
      fetchData();
    } catch (error) { 
        console.error(error);
        alert("Error posting course"); 
    }
  };

  const formatAiText = (text) => {
    if (!text) return "";
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**')) return <h4 key={i} className="font-black text-blue-800 mt-4 mb-2 uppercase">{line.replace(/\*\*/g, '')}</h4>;
      if (line.startsWith('*')) return <p key={i} className="ml-4 mb-1 flex items-start gap-2"><CheckCircle size={14} className="mt-1 text-blue-500 flex-shrink-0" /> {line.replace(/\*/g, '')}</p>;
      return <p key={i} className="mb-2">{line}</p>;
    });
  };

  if (!user) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Auth onLoginSuccess={setUser} /></div>;

  const filteredSkills = skills.filter(s => 
    (activeCategory === "All" || s.category === activeCategory) && 
    (s.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    // THE CHANGE: Switched bg-white to bg-[#FFF8F0] for the entire app body
    <div className="min-h-screen bg-[#FFF8F0] text-slate-900 font-sans">
      <nav className="bg-[#020617] text-white sticky top-0 z-50 h-20 border-b border-white/5 flex items-center px-6">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl"><GraduationCap size={28} /></div>
            <span className="text-2xl font-black italic">EduSwap<span className="text-blue-400">AI</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase italic hover:bg-blue-400 transition-all">POST COURSE</button>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="flex flex-col text-right">
                <span className="text-[10px] font-black uppercase text-slate-400">{user.name}</span>
                <button onClick={handleLogout} className="text-red-500 text-[9px] font-black uppercase flex items-center gap-1"><LogOut size={10} /> Logout</button>
              </div>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center font-black">{user.name?.charAt(0).toUpperCase()}</div>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-[#020617] py-20 text-white px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-6xl font-black mb-6 italic leading-tight">Your Knowledge <br/>Is <span className="text-blue-400">Pure Gold.</span></h1>
            <div className="relative max-w-lg">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
              <input className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl text-slate-900 font-black shadow-xl" placeholder="Search for skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </motion.div>
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" className="rounded-3xl hidden lg:block border-8 border-white/5 shadow-2xl" alt="Learning" />
        </div>
      </header>

      {/* Main content wrapper now also uses the Cream background to ensure no white patches */}
      <main className="max-w-7xl mx-auto px-6 py-12 bg-[#FFF8F0]">
        {unlockedCourses.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 italic uppercase"><BookOpen className="text-blue-600"/> My Learning Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {unlockedCourses.map(course => (
                <div key={course._id} className="bg-white border border-slate-200 p-6 rounded-3xl flex flex-col justify-between shadow-sm">
                  <div className="flex gap-4 mb-4">
                    <img src={getCourseImage(course)} className="w-24 h-24 rounded-2xl object-cover border border-slate-100 shadow-md" alt={course.title} />
                    <div>
                      <h3 className="font-black text-lg uppercase italic mb-1"> {course.title}</h3>
                      <p className="text-slate-600 text-sm line-clamp-2">{course.description}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                        className="flex-1 py-3 bg-black text-white rounded-xl font-black text-xs uppercase italic flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                        onClick={() => {
                            if (course.syllabusFile) {
                                window.open(`http://localhost:5000/uploads/${course.syllabusFile}`, '_blank');
                            }
                        }}
                    >
                        <Layers size={14}/> {course.syllabusFile ? "View Syllabus" : "Start Course"}
                    </button>
                    <button onClick={() => handleGenerateRoadmap(course)} className="px-4 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-xl font-black text-xs uppercase italic flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all">
                      {aiLoading ? "..." : <><Sparkles size={14}/> Roadmap</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-2xl font-black mb-6 italic uppercase">Explore Skills</h2>
          <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest transition-all ${activeCategory === cat ? "bg-black text-white" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-200"}`}>{cat}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredSkills.map((skill) => {
              const { rating } = getDynamicRating(skill._id);
              return (
                <motion.div layout key={skill._id} className={`${getCategoryStyles(skill.category)} rounded-3xl overflow-hidden border shadow-sm flex flex-col h-full transition-transform hover:-translate-y-2`}>
                  <div className="h-44 relative overflow-hidden">
                    <img src={getCourseImage(skill)} className="w-full h-full object-cover transition-transform duration-500 hover:scale-110" alt={skill.title} />
                    {skill.user === user.name && (
                      <button onClick={() => handleDelete(skill._id)} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 shadow-lg"><Trash2 size={14} /></button>
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="font-black text-md mb-1 uppercase italic truncate text-white">{skill.title}</h3>
                    <p className="text-[10px] font-bold text-white/80 mb-4 uppercase">By {skill.user}</p>
                    <div className="mt-auto flex justify-between items-center pt-3 border-t border-white/20">
                      <div className="flex items-center gap-1 font-black text-xs text-white">{rating} <Star size={12} className="text-yellow-400" fill="currentColor"/></div>
                      {skill.user !== user.name && (
                        <button onClick={() => handleSwapRequest(skill)} className="px-4 py-2 bg-white text-black rounded-xl font-black text-[10px] uppercase italic hover:bg-blue-400 hover:text-white transition-all shadow-md">Swap</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isAiModalOpen && (
          <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-[2.5rem] max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col relative">
              <button onClick={() => {setIsAiModalOpen(false); setAiRoadmap(null);}} className="absolute right-6 top-6 text-slate-400 hover:text-black z-10"><X size={28}/></button>
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-600 p-2 rounded-xl text-white"><Sparkles size={24} /></div>
                <h2 className="text-2xl font-black uppercase italic">AI Learning Roadmap</h2>
              </div>
              <div className="overflow-y-auto pr-4 custom-scrollbar flex-grow">
                {aiLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                      <Wand2 size={48} className="text-blue-600" />
                    </motion.div>
                    <p className="font-black uppercase italic animate-pulse text-blue-600">Gemini is Crafting your plan...</p>
                  </div>
                ) : (
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 font-medium text-slate-700 leading-relaxed">
                    {formatAiText(aiRoadmap)}
                  </div>
                )}
              </div>
              {!aiLoading && <button onClick={() => setIsAiModalOpen(false)} className="mt-6 w-full py-4 bg-black text-white font-black rounded-2xl uppercase italic hover:bg-blue-600 transition-all">Got it!</button>}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <section className="bg-[#020617] py-20 text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-12 italic uppercase">Activity Hub</h2>
          <div className="bg-slate-900/50 p-8 rounded-[2.5rem] border border-white/5">
            <TradeHistory refreshTrigger={refreshHistory} onUpdate={() => setRefreshHistory(prev => prev + 1)} />
          </div>
        </div>
      </section>

      {/* Modals remain with white background for readability on top of the cream background */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-8 rounded-3xl max-w-lg w-full relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-black"><X size={24}/></button>
              <h2 className="text-2xl font-black mb-6 uppercase italic">Publish Course</h2>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                <input placeholder="TITLE" required className="w-full p-4 bg-slate-100 rounded-xl font-bold text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                
                <div className="relative">
                  <ImageIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input placeholder="IMAGE URL" className="w-full p-4 pl-12 bg-slate-100 rounded-xl font-bold text-sm border-2 border-blue-50 focus:border-blue-500 transition-all" value={formData.photo} onChange={(e) => setFormData({...formData, photo: e.target.value})} />
                </div>

                <select className="w-full p-4 bg-slate-100 rounded-xl font-bold text-sm" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  {categories.filter(c => c !== "All").map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>

                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-black uppercase text-slate-400">Description</span>
                  <button type="button" onClick={handleEnhanceDescription} disabled={aiLoading} className="text-[9px] bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded-lg font-black uppercase italic transition-all flex items-center gap-1">
                    {aiLoading ? "Wait..." : "✨ Magic Edit"}
                  </button>
                </div>
                <textarea placeholder="ROUGH DESCRIPTION" className="w-full p-4 bg-slate-100 rounded-xl text-sm min-h-[80px]" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

                <input placeholder="DURATION (e.g., 4 Weeks)" className="w-full p-4 bg-slate-100 rounded-xl font-bold text-sm" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                
                <textarea placeholder="SYLLABUS" className="w-full p-4 bg-slate-100 rounded-xl text-sm border-2 border-dashed border-slate-200" rows="4" value={formData.syllabusText} onChange={(e) => setFormData({...formData, syllabusText: e.target.value})} />

                <div className="space-y-2">
                    <div className="flex gap-2">
                        <label 
                            className={`flex-1 flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all border-2 ${pdfPreview ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'}`}
                            onClick={() => pdfPreview && window.open(pdfPreview, '_blank')}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <Upload size={20} className={pdfPreview ? 'text-white' : 'text-blue-600'} />
                                <span className="text-xs font-black uppercase truncate">
                                    {syllabusFile ? syllabusFile.name : "Upload Syllabus PDF"}
                                </span>
                            </div>
                            {pdfPreview && <ExternalLink size={14} className="flex-shrink-0" />}
                            <input type="file" accept=".pdf" className="hidden" onChange={handleFileChange} onClick={(e) => e.stopPropagation()} />
                        </label>

                        {pdfPreview && (
                            <button 
                                type="button"
                                onClick={handleRemovePdf}
                                className="px-4 bg-red-100 text-red-600 border-2 border-red-200 rounded-xl hover:bg-red-600 hover:text-white transition-all flex items-center justify-center"
                                title="Remove PDF"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                    </div>
                </div>

                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase italic hover:bg-blue-700 shadow-lg shadow-blue-200">Launch</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isSkillModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl max-sm w-full text-center">
              <h2 className="text-xl font-black mb-4 uppercase italic">Offer which skill?</h2>
              <div className="space-y-3">
                {skills.filter(s => s.user === user.name).map(mySkill => (
                  <button key={mySkill._id} onClick={() => handleSwapRequest(pendingTargetSkill, mySkill.title)} className="w-full py-4 bg-slate-100 hover:bg-blue-600 hover:text-white rounded-2xl font-black text-xs uppercase italic transition-all">{mySkill.title}</button>
                ))}
                <button onClick={() => setIsSkillModalOpen(false)} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;