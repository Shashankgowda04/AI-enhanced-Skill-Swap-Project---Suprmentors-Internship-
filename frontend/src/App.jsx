import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Trash2, GraduationCap, Bell, User, 
  Upload, Clock, CheckCircle, History, Layers, Star, LogOut 
} from 'lucide-react';
import Auth from './components/Auth'; 
import TradeHistory from './components/TradeHistory'; 

function App() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0);

  const [formData, setFormData] = useState({ 
    title: "", description: "", syllabusText: "", duration: "", category: "Programming"
  });
  const [syllabusFile, setSyllabusFile] = useState(null);

  const categories = ["All", "Programming", "Marketing", "Design", "Finance", "Business", "Other"];

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const getCategoryStyles = (category) => {
    const styles = {
      Programming: "bg-blue-100 border-blue-400 text-blue-900 shadow-blue-100",
      Marketing: "bg-purple-100 border-purple-400 text-purple-900 shadow-purple-100",
      Design: "bg-pink-100 border-pink-400 text-pink-900 shadow-pink-100",
      Finance: "bg-emerald-100 border-emerald-400 text-emerald-900 shadow-emerald-100",
      Business: "bg-amber-100 border-amber-400 text-amber-900 shadow-amber-100",
      Other: "bg-slate-200 border-slate-400 text-slate-900 shadow-slate-300/50"
    };
    return styles[category] || styles.Other;
  };

  const getCourseImage = (title, category) => {
    const t = title.toLowerCase();
    if (t.includes('cook')) return "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500";
    if (t.includes('react') || t.includes('web')) return "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=500";
    if (t.includes('market')) return "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500";
    if (t.includes('java')) return "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500";
    if (t.includes('tally')) return "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=500";
    if (t.includes('ai') || t.includes('machine')) return "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=500";
    return `https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500`;
  };

  const getDynamicRating = (id) => {
    const seed = id ? id.charCodeAt(id.length - 1) : 5;
    return { rating: (4 + (seed % 10) / 10).toFixed(1), reviews: (seed * 9) + 30 };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const res = await axios.get('http://localhost:5000/api/skills');
        setSkills(res.data);
        setLoading(false);
      } catch (error) { setLoading(false); }
    };
    fetchData();
  }, [user]);

  // --- AUTOMATED SWAP REQUEST LOGIC ---
  const handleSwapRequest = async (targetSkill) => {
    try {
      const token = localStorage.getItem('token');
      
      // Find the first skill the logged-in user has posted to offer in return
      const mySkill = skills.find(s => s.user === user.name);
      const offeredSkillTitle = mySkill ? mySkill.title : "Knowledge Exchange";

      await axios.post('http://localhost:5000/api/requests', {
        receiver: targetSkill.user, 
        skillTitle: targetSkill.title,
        senderSkill: offeredSkillTitle // 🟢 Automatically attaching your skill!
      }, { headers: { 'x-auth-token': token } });
      
      alert(`Success! You offered "${offeredSkillTitle}" for "${targetSkill.title}"`);
      setRefreshHistory(prev => prev + 1);
    } catch (err) { 
      alert("Error sending swap proposal"); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this course?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/skills/${id}`, {
        headers: { 'x-auth-token': token }
      });
      setSkills(skills.filter(s => s._id !== id));
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('category', formData.category);
    data.append('syllabusText', formData.syllabusText);
    data.append('duration', formData.duration);
    data.append('user', user.name);
    data.append('userId', user._id || user.id); 
    data.append('type', 'Offer');

    if (syllabusFile) {
      data.append('syllabusFile', syllabusFile);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/skills', data, { 
        headers: { 
          'x-auth-token': token,
          'Content-Type': 'multipart/form-data' 
        } 
      });
      setSkills([res.data, ...skills]);
      setIsModalOpen(false);
      alert("🚀 Success! Your course is now live.");
      
      setSyllabusFile(null);
      setFormData({ title: "", description: "", syllabusText: "", duration: "", category: "Programming" });
    } catch (error) { 
      const errorMsg = error.response?.data?.message || "Internal Server Error";
      alert("Failed to post: " + errorMsg); 
    }
  };

  if (!user) return <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4"><Auth onLoginSuccess={setUser} /></div>;

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-blue-100">
      <nav className="bg-[#020617] text-white sticky top-0 z-50 h-20 border-b border-white/5 backdrop-blur-xl bg-opacity-95">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <GraduationCap size={28} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter uppercase italic text-white">EduSwap<span className="text-blue-400">AI</span></span>
          </div>
          <div className="flex items-center gap-6">
            <Bell size={22} className="text-slate-400 cursor-pointer hover:text-white transition-colors" />
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-6 py-2.5 rounded-full font-black text-sm transition-all hover:scale-105 shadow-xl uppercase italic">
                 POST COURSE
            </button>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4">
              <div className="flex flex-col items-end mr-1">
                <span className="text-[10px] font-black uppercase text-slate-400 hidden sm:block">{user.name}</span>
                <button onClick={handleLogout} className="text-red-500 hover:text-red-400 text-[9px] font-black uppercase tracking-tighter transition-colors flex items-center gap-1">
                  <LogOut size={10} /> Logout
                </button>
              </div>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center font-black shadow-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <header className="relative bg-[#020617] py-24 overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
                <h1 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight tracking-tight italic">
                    Your Knowledge <br/>Is <span className="text-blue-400">Pure Gold.</span>
                </h1>
                <p className="text-slate-400 text-lg mb-10 max-w-lg font-bold uppercase tracking-[0.2em]">Swap Skills. Build The Future.</p>
                <div className="relative max-w-lg">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={24}/>
                    <input className="w-full pl-16 pr-6 py-6 bg-white rounded-2xl outline-none text-slate-900 font-black text-lg shadow-2xl" placeholder="Search for skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
            </motion.div>
            <div className="hidden lg:block">
                <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" className="rounded-[2.5rem] shadow-2xl border-8 border-white/5 rotate-2" alt="Hero" />
            </div>
         </div>
      </header>

      <div className="bg-slate-50/50 pb-24 pt-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12 flex items-center gap-3 overflow-x-auto pb-4 no-scrollbar">
            {categories.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-8 py-2.5 rounded-full font-black text-xs uppercase tracking-widest transition-all ${activeCategory === cat ? "bg-black text-white shadow-xl scale-105" : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-50"}`}>{cat}</button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {skills.filter(s => (activeCategory === "All" || s.category === activeCategory) && s.title.toLowerCase().includes(searchTerm.toLowerCase())).map((skill) => {
                const { rating, reviews } = getDynamicRating(skill._id);
                const cardStyle = getCategoryStyles(skill.category);
                return (
                <motion.div whileHover={{ y: -12 }} key={skill._id} className={`${cardStyle} rounded-[2rem] overflow-hidden border-2 shadow-lg transition-all group`}>
                    <div className="h-48 w-full relative">
                        <img src={getCourseImage(skill.title, skill.category)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={skill.title} />
                        <div className="absolute top-4 left-4 bg-black/80 px-3 py-1 rounded-full text-[10px] font-black uppercase text-white tracking-widest">{skill.category}</div>
                        {skill.user === user.name && (
                            <button onClick={() => handleDelete(skill._id)} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg hover:scale-110 transition-transform"><Trash2 size={16} /></button>
                        )}
                    </div>
                    <div className="p-6">
                        <h3 className="font-black text-xl text-slate-900 mb-2 uppercase italic leading-tight">{skill.title}</h3>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-8 w-8 bg-white rounded-full flex items-center justify-center text-[10px] font-black border border-black/5 shadow-sm">{skill.user?.charAt(0)}</div>
                            <span className="text-slate-700 text-[11px] font-black uppercase">Instructor: {skill.user}</span>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-black/5">
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-black">{rating}</span>
                                <Star size={14} className="text-amber-500" fill="currentColor"/>
                            </div>
                            {skill.user !== user.name && (
                              <button onClick={() => handleSwapRequest(skill)} className="px-4 py-2 bg-black text-white rounded-xl font-black text-[10px] uppercase italic tracking-widest hover:bg-blue-600 transition-colors">
                                Propose Swap
                              </button>
                            )}
                        </div>
                    </div>
                </motion.div>
                );
            })}
          </div>
        </div>
      </div>

      <section className="bg-[#020617] py-28">
        <div className="max-w-5xl mx-auto px-6">
            <h2 className="text-4xl font-black text-white text-center mb-16 italic uppercase tracking-tighter">Swap Activity Hub</h2>
            <div className="bg-[#050B18] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 to-emerald-500"></div>
                <div className="mb-8 flex items-center justify-between rounded-3xl bg-[#061a12] border-2 border-emerald-500/40 p-6 shadow-xl">
                    <div className="flex items-center gap-5">
                       <div className="bg-emerald-500 p-2.5 rounded-full text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]">
                          <CheckCircle size={24} strokeWidth={3} />
                       </div>
                       <div className="text-left text-white">
                          <p className="text-[10px] font-black uppercase text-emerald-400 mb-1">Status: Success</p>
                          <p className="text-lg font-black italic tracking-tight uppercase">Verified Skill Exchange Completed</p>
                       </div>
                    </div>
                </div>
                <TradeHistory key={refreshHistory} refreshTrigger={refreshHistory} />
            </div>
        </div>
      </section>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-[#020617]/95 backdrop-blur-2xl z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-10 rounded-[3rem] max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 p-2 text-slate-400 hover:text-red-500 transition-all"><X size={28}/></button>
              <h2 className="text-4xl font-black text-slate-900 mb-8 uppercase italic tracking-tighter">Publish Course</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <input placeholder="COURSE TITLE..." required className="p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:border-blue-600" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                    <select className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-sm outline-none focus:border-blue-600" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        {categories.filter(c => c !== "All").map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                </div>
                <textarea placeholder="DESCRIPTION..." required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-sm h-24 focus:border-blue-600" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <textarea placeholder="DETAILED SYLLABUS..." required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-medium text-sm h-32 focus:border-blue-600" value={formData.syllabusText} onChange={(e) => setFormData({...formData, syllabusText: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                   <div className="relative">
                        <Clock className="absolute left-4 top-4 text-slate-400" size={18}/>
                        <input placeholder="DURATION (e.g. 4 Weeks)" required className="w-full pl-12 p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-sm focus:border-blue-600" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                   </div>
                   <div className="relative">
                        <Upload className="absolute left-4 top-4 text-slate-400" size={18}/>
                        <input type="file" accept=".pdf" className="w-full pl-12 p-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-[10px] cursor-pointer" onChange={(e) => setSyllabusFile(e.target.files[0])} />
                   </div>
                </div>
                <button type="submit" className="w-full py-6 bg-blue-600 text-white font-black rounded-[2rem] hover:bg-slate-900 transition-all uppercase italic tracking-[0.2em] text-lg">Launch Course</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;