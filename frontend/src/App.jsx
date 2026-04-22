import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Trash2, GraduationCap, Bell, 
  Upload, Clock, CheckCircle, Layers, Star, LogOut, BookOpen,
  ArrowRightLeft
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

  const [formData, setFormData] = useState({ 
    title: "", description: "", syllabusText: "", duration: "", category: "Programming"
  });
  const [syllabusFile, setSyllabusFile] = useState(null);

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
      Programming: "bg-blue-100 border-blue-400 text-blue-900 shadow-blue-100",
      Marketing: "bg-purple-100 border-purple-400 text-purple-900 shadow-purple-100",
      Design: "bg-pink-100 border-pink-400 text-pink-900 shadow-pink-100",
      Finance: "bg-emerald-100 border-emerald-400 text-emerald-900 shadow-emerald-100",
      Business: "bg-amber-100 border-amber-400 text-amber-900 shadow-amber-100",
      Other: "bg-slate-200 border-slate-400 text-slate-900 shadow-slate-300/50"
    };
    return styles[category] || styles.Other;
  };

  const getCourseImage = (title) => {
    const t = title ? title.toLowerCase() : "";
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
      const token = localStorage.getItem('token');
      if (!user || !token) return;
      try {
        const config = { headers: { 'x-auth-token': token } };
        const [skillsRes, reqsRes] = await Promise.all([
          axios.get('http://localhost:5000/api/skills'),
          axios.get('http://localhost:5000/api/requests/history', config) // Fetch history to see accepted swaps
        ]);
        setSkills(skillsRes.data || []);
        setRequests(reqsRes.data || []);
      } catch (error) { 
        console.error("Fetch error:", error);
        if (error.response?.status === 401) handleLogout();
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, refreshHistory, handleLogout]);

  // CRITICAL UPDATE: Both parties now unlock their respective skills
  useEffect(() => {
    if (skills.length > 0 && requests.length > 0 && user) {
      const acceptedSwaps = requests.filter(req => req.status === 'accepted');
      
      const accessibleTitles = acceptedSwaps.map(req => {
        const isSender = req.sender?.toLowerCase() === user.name?.toLowerCase();
        const isReceiver = req.receiver?.toLowerCase() === user.name?.toLowerCase();

        if (isSender) return req.skillTitle; // Sender gets the receiver's skill
        if (isReceiver) return req.senderSkill; // Receiver gets the sender's skill
        return null;
      }).filter(Boolean);

      const myUnlocked = skills.filter(s => accessibleTitles.includes(s.title));
      setUnlockedCourses(myUnlocked);
    }
  }, [skills, requests, user]);

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
    } catch (err) { 
        alert("Error sending swap proposal"); 
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this course?")) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:5000/api/skills/${id}`, { headers: { 'x-auth-token': token } });
      setSkills(skills.filter(s => s._id !== id));
    } catch (error) { console.error(error); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    data.append('user', user.name);
    data.append('userId', user._id || user.id); 
    if (syllabusFile) data.append('syllabusFile', syllabusFile);

    try {
      const res = await axios.post('http://localhost:5000/api/skills', data, { 
        headers: { 'x-auth-token': token, 'Content-Type': 'multipart/form-data' } 
      });
      setSkills(prev => [res.data, ...prev]);
      setIsModalOpen(false);
      setFormData({ title: "", description: "", syllabusText: "", duration: "", category: "Programming" });
      setSyllabusFile(null);
    } catch (error) { alert("Error posting course"); }
  };

  if (!user) return <div className="min-h-screen bg-[#020617] flex items-center justify-center"><Auth onLoginSuccess={setUser} /></div>;

  const filteredSkills = skills.filter(s => 
    (activeCategory === "All" || s.category === activeCategory) && 
    (s.title?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <nav className="bg-[#020617] text-white sticky top-0 z-50 h-20 border-b border-white/5 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl"><GraduationCap size={28} /></div>
            <span className="text-2xl font-black italic">EduSwap<span className="text-blue-400">AI</span></span>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setIsModalOpen(true)} className="bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase italic">POST COURSE</button>
            <div className="flex items-center gap-3 border-l border-white/10 pl-4 text-right">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-slate-400">{user.name}</span>
                <button onClick={handleLogout} className="text-red-500 text-[9px] font-black uppercase flex items-center gap-1 hover:opacity-80"><LogOut size={10} /> Logout</button>
              </div>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center font-black">{user.name?.charAt(0).toUpperCase()}</div>
            </div>
          </div>
        </div>
      </nav>

      <header className="bg-[#020617] py-20 text-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="text-6xl font-black mb-6 italic leading-tight">Your Knowledge <br/>Is <span className="text-blue-400">Pure Gold.</span></h1>
            <div className="relative max-w-lg">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
              <input className="w-full pl-14 pr-6 py-5 bg-white rounded-2xl text-slate-900 font-black shadow-xl" placeholder="Search for skills..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
          </motion.div>
          <img src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800" className="rounded-3xl hidden lg:block border-8 border-white/5 shadow-2xl" alt="Hero" />
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {unlockedCourses.length > 0 && (
          <section className="mb-16">
            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 italic uppercase"><BookOpen className="text-blue-600"/> My Learning Library</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {unlockedCourses.map(course => (
                <div key={`unlocked-${course._id}`} className="bg-blue-50 border-2 border-blue-200 p-6 rounded-3xl flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-black text-lg uppercase italic">{course.title}</h3>
                      <span className="bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded-full uppercase">Unlocked</span>
                    </div>
                    <p className="text-slate-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  </div>
                  <button className="w-full py-3 bg-black text-white rounded-xl font-black text-xs uppercase italic flex items-center justify-center gap-2">
                    <Layers size={14}/> Start Course
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="explore-skills">
          <h2 className="text-2xl font-black mb-6 italic uppercase">Explore Skills</h2>
          <div className="flex gap-3 mb-8 overflow-x-auto no-scrollbar py-2">
            {categories.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full font-black text-[10px] uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? "bg-black text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"}`}>{cat}</button>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredSkills.length > 0 ? (
              filteredSkills.map((skill) => {
                const { rating } = getDynamicRating(skill._id);
                return (
                  <motion.div layout key={skill._id} className={`${getCategoryStyles(skill.category)} rounded-3xl overflow-hidden border shadow-sm flex flex-col h-full`}>
                    <div className="h-40 relative">
                      <img src={getCourseImage(skill.title)} className="w-full h-full object-cover" alt={skill.title} />
                      {skill.user === user.name && (
                        <button onClick={() => handleDelete(skill._id)} className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"><Trash2 size={14} /></button>
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-black text-md mb-1 uppercase italic leading-tight truncate">{skill.title}</h3>
                      <p className="text-[10px] font-bold text-slate-500 mb-4 uppercase">Instructor: {skill.user}</p>
                      <div className="mt-auto flex justify-between items-center pt-3 border-t border-black/5">
                        <div className="flex items-center gap-1 font-black text-xs">{rating} <Star size={12} className="text-amber-500" fill="currentColor"/></div>
                        {skill.user !== user.name && (
                          <button onClick={() => handleSwapRequest(skill)} className="px-4 py-2 bg-black text-white rounded-xl font-black text-[10px] uppercase italic hover:bg-blue-600 transition-colors">Swap</button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-slate-400 border-2 border-dashed border-slate-100 rounded-3xl">
                <Layers size={48} className="mb-4 opacity-20" />
                <p className="font-black uppercase italic">No courses found</p>
              </div>
            )}
          </div>
        </section>
      </main>

      <section className="bg-slate-900 py-20 text-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-black text-center mb-12 italic uppercase">Activity Hub</h2>
          <div className="bg-slate-800 p-8 rounded-[2.5rem] border border-white/5">
            <TradeHistory key={refreshHistory} refreshTrigger={refreshHistory} onUpdate={() => setRefreshHistory(prev => prev + 1)} />
          </div>
        </div>
      </section>

      <AnimatePresence>
        {isSkillModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white p-8 rounded-3xl max-w-sm w-full text-center">
              <h2 className="text-xl font-black mb-2 uppercase italic text-slate-900">Choose your skill</h2>
              <p className="text-xs text-slate-500 mb-6 font-bold uppercase tracking-tight">Which skill do you want to offer to {pendingTargetSkill?.user}?</p>
              <div className="space-y-3">
                {skills.filter(s => s.user === user.name).map(mySkill => (
                  <button 
                    key={mySkill._id}
                    onClick={() => handleSwapRequest(pendingTargetSkill, mySkill.title)}
                    className="w-full py-4 bg-slate-100 hover:bg-blue-600 hover:text-white transition-all rounded-2xl font-black text-xs uppercase italic text-slate-900"
                  >
                    {mySkill.title}
                  </button>
                ))}
                <button onClick={() => setIsSkillModalOpen(false)} className="w-full py-2 text-slate-400 font-bold text-[10px] uppercase mt-2">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white p-8 rounded-3xl max-w-lg w-full relative">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-6 top-6 text-slate-400 hover:text-black"><X size={24}/></button>
              <h2 className="text-2xl font-black mb-6 uppercase italic">Publish Course</h2>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                <input placeholder="TITLE" required className="w-full p-4 bg-slate-100 rounded-xl font-bold text-sm" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                <select className="w-full p-4 bg-slate-100 rounded-xl font-bold text-sm" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                  {categories.filter(c => c !== "All").map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <textarea placeholder="DESCRIPTION" className="w-full p-4 bg-slate-100 rounded-xl text-sm" rows="2" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <input placeholder="DURATION" className="w-full p-4 bg-slate-100 rounded-xl font-bold text-sm" value={formData.duration} onChange={(e) => setFormData({...formData, duration: e.target.value})} />
                
                <textarea 
                  placeholder="COURSE SYLLABUS (Detailed Modules)" 
                  className="w-full p-4 bg-slate-100 rounded-xl text-sm border-2 border-dashed border-slate-200" 
                  rows="4" 
                  value={formData.syllabusText} 
                  onChange={(e) => setFormData({...formData, syllabusText: e.target.value})} 
                />

                <div className="relative">
                  <label className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl cursor-pointer hover:bg-blue-100 transition-colors">
                    <Upload size={20} className="text-blue-600" />
                    <span className="text-xs font-black uppercase text-blue-700">
                      {syllabusFile ? syllabusFile.name : "Upload Syllabus PDF"}
                    </span>
                    <input type="file" accept=".pdf" className="hidden" onChange={(e) => setSyllabusFile(e.target.files[0])} />
                  </label>
                </div>

                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-xl uppercase italic hover:bg-blue-700">Launch</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;