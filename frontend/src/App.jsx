import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Search, Bell, Check, X, ArrowLeftRight } from 'lucide-react';
import Auth from './components/Auth'; 

function App() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [requests, setRequests] = useState([]); 
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  
  // Modal & Swap States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [targetUserSkills, setTargetUserSkills] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);

  const [formData, setFormData] = useState({ title: "", description: "", type: "Offer", category: "Programming" });
  const categories = ["All", "Programming", "Design", "Marketing", "Business"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsRes = await axios.get('http://localhost:5000/api/skills');
        setSkills(skillsRes.data);
        if (user) {
          const token = localStorage.getItem('token');
          const reqRes = await axios.get('http://localhost:5000/api/requests/my-requests', {
            headers: { 'x-auth-token': token }
          });
          setRequests(reqRes.data);
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const handleRequestAction = async (req, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/requests/${req._id}`, { status }, {
        headers: { 'x-auth-token': token }
      });
      
      if (status === 'accepted') {
        const res = await axios.get(`http://localhost:5000/api/skills/user/${req.sender}`);
        setTargetUserSkills(res.data);
        setSelectedReq(req);
        setIsSwapModalOpen(true); 
      }
      setRequests(requests.filter(r => r._id !== req._id));
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  // 🛡️ NEW: Function to finalize the mutual swap
  const handleFinalizeSwap = async (selectedSkillTitle) => {
    alert(`Swap Confirmed! You traded "${selectedReq.skillTitle}" for "${selectedSkillTitle}"`);
    setIsSwapModalOpen(false);
    // Optional: Add an axios.post here to save the completed swap in a "History" collection
  };

  const filteredSkills = skills.filter(skill => 
    skill.title?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (activeCategory === "All" || skill.category === activeCategory)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const { data } = await axios.post('http://localhost:5000/api/skills', 
        { ...formData, user: user.name }, 
        { headers: { 'x-auth-token': token } }
      );
      setSkills([data, ...skills]); 
      setIsModalOpen(false);
      setFormData({ title: "", description: "", type: "Offer", category: "Programming" });
    } catch (error) { 
      alert("Error posting skill.");
    }
  };

  if (!user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><Auth onLoginSuccess={(userData) => setUser(userData)} /></div>;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg"><Share2 className="text-white" size={20} /></div>
            <span className="text-xl font-bold tracking-tight text-slate-800">AI SkillSwap</span>
          </div>
          
          <div className="hidden md:flex items-center bg-slate-100 px-4 py-2 rounded-full w-1/3">
            <Search size={16} className="text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search skills..." 
              className="bg-transparent outline-none text-sm w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="relative p-2">
              <Bell size={20} className="text-slate-600" />
              {requests.length > 0 && <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-md">{requests.length}</span>}
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-blue-700 transition">Post Skill</button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
               <div className="text-right hidden sm:block">
                 <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                 <button onClick={handleLogout} className="text-[10px] text-red-500 hover:underline">Logout</button>
               </div>
               <div className="h-9 w-9 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-black text-sm uppercase shadow-inner">{user.name?.charAt(0)}</div>
            </div>
          </div>
        </div>
      </nav>

      {/* Dark Swap Requests Section */}
      {requests.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-10 opacity-10"><Bell size={120} className="text-white" /></div>
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Bell size={18} className="text-blue-400" /> Swap Requests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requests.map(req => (
                <div key={req._id} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl flex justify-between items-center border border-white/20">
                  <div>
                    <p className="text-sm font-bold text-white leading-snug">{req.sender} wants to swap for <br/><span className="text-blue-400">"{req.skillTitle}"</span></p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRequestAction(req, 'accepted')} className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 shadow-lg transition"><Check size={20} /></button>
                    <button onClick={() => handleRequestAction(req, 'rejected')} className="p-3 bg-white/10 text-white rounded-xl hover:bg-red-500 transition"><X size={20} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Feed Section */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
           {categories.map(cat => (
             <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all ${activeCategory === cat ? "bg-blue-600 text-white shadow-xl scale-105" : "bg-white text-slate-500 border border-slate-200 hover:border-blue-300"}`}>{cat}</button>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredSkills.map((skill) => (
            <div key={skill._id} className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col hover:shadow-2xl transition-all duration-300 group">
              <div className="flex justify-between items-start mb-5">
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg ${skill.type === 'Offer' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>{skill.type}</span>
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-800 group-hover:text-blue-600 transition-colors">{skill.title}</h3>
              <p className="text-slate-500 text-sm mb-8 line-clamp-3 leading-relaxed">{skill.description}</p>
              <div className="pt-6 border-t border-slate-50 mt-auto flex flex-col gap-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center font-bold text-[12px] text-blue-600 uppercase">{skill.user?.charAt(0)}</div>
                  <span className="text-xs font-bold text-slate-700">{skill.user}</span>
                </div>
                {skill.user !== user.name && (
                  <button onClick={() => {
                    const token = localStorage.getItem('token');
                    axios.post('http://localhost:5000/api/requests', { receiver: skill.user, skillTitle: skill.title }, { headers: { 'x-auth-token': token } });
                    alert("Request Sent!");
                  }} className="w-full py-4 bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 shadow-md transition-all">Request Swap</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Swap Selection Modal */}
      <AnimatePresence>
        {isSwapModalOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-white rounded-[3rem] p-10 max-w-2xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
              <button onClick={() => setIsSwapModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600"><X size={28} /></button>
              
              <div className="mb-8">
                <h2 className="text-3xl font-black text-slate-900 leading-tight">Pick a skill from <br/><span className="text-blue-600">{selectedReq?.sender}</span></h2>
                <p className="text-slate-500 mt-2 font-medium">In exchange for your "{selectedReq?.skillTitle}"</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {targetUserSkills.length > 0 ? targetUserSkills.map(s => (
                  <div key={s._id} 
                    onClick={() => handleFinalizeSwap(s.title)} 
                    className="p-5 border-2 border-slate-100 rounded-[2rem] hover:border-blue-500 cursor-pointer transition-all bg-slate-50 hover:bg-blue-50 group">
                    <p className="font-bold text-slate-800 group-hover:text-blue-700">{s.title}</p>
                    <p className="text-[10px] text-blue-500 font-bold uppercase mt-1 tracking-wider">{s.category}</p>
                    <div className="mt-4 text-[10px] font-black text-slate-400 group-hover:text-blue-600 flex items-center gap-1">SELECT THIS SKILL <ArrowLeftRight size={10}/></div>
                  </div>
                )) : (
                  <div className="col-span-2 text-center py-10">
                    <p className="text-slate-400 font-bold italic text-lg">This user has no skills to swap back!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Skill Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] p-10 max-w-md w-full relative shadow-2xl">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400"><X size={26} /></button>
              <h2 className="text-3xl font-black mb-6">Post a Skill</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <input placeholder="Skill Name" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                <textarea placeholder="Description" required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-28 outline-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}><option value="Offer">Offering</option><option value="Request">Requesting</option></select>
                  <select className="p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>{categories.filter(c => c !== "All").map(cat => <option key={cat} value={cat}>{cat}</option>)}</select>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl">Publish Now</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;