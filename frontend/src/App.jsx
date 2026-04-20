import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Search, Bell, X, Trash2, ArrowLeftRight, Check } from 'lucide-react';
import Auth from './components/Auth'; 
import TradeHistory from './components/TradeHistory'; 

function App() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [requests, setRequests] = useState([]); 
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [targetUserSkills, setTargetUserSkills] = useState([]);
  const [selectedReq, setSelectedReq] = useState(null);
  const [refreshHistory, setRefreshHistory] = useState(0); 

  const [formData, setFormData] = useState({ 
    title: "", 
    description: "", 
    type: "Offer", 
    category: "Programming" 
  });
  
  const categories = ["All", "Programming", "Marketing", "Design", "Finance", "Business", "Other"];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const skillsRes = await axios.get('http://localhost:5000/api/skills');
        setSkills(skillsRes.data);
        if (user) {
          localStorage.setItem('userName', user.name);
          const token = localStorage.getItem('token');
          // Fetch pending requests for the notification badge
          const reqRes = await axios.get('http://localhost:5000/api/requests/my-requests', {
            headers: { 'x-auth-token': token }
          });
          setRequests(reqRes.data);
        }
        setLoading(false);
      } catch (error) {
        console.error("Fetch error:", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  // --- CORE SWAP LOGIC ---

  const handleSwapRequest = async (skill) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:5000/api/requests', {
        receiver: skill.user,
        skillTitle: skill.title
      }, { headers: { 'x-auth-token': token } });
      alert("Swap request sent to " + skill.user);
    } catch (err) {
      alert(err.response?.data?.msg || "Error sending request");
    }
  };

  const handleRequestAction = async (req, status) => {
    try {
      const token = localStorage.getItem('token');
      if (status === 'rejected') {
        await axios.put(`http://localhost:5000/api/requests/${req._id}`, { status }, {
          headers: { 'x-auth-token': token }
        });
        setRequests(requests.filter(r => r._id !== req._id));
      } else {
        // If accepted, show modal to pick a skill from the sender to complete the swap
        const res = await axios.get(`http://localhost:5000/api/skills/user/${req.sender}`);
        setTargetUserSkills(res.data);
        setSelectedReq(req);
        setIsSwapModalOpen(true); 
      }
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  const handleFinalizeSwap = async (selectedSkillTitle) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/requests/${selectedReq._id}`, 
        { status: 'accepted', selectedSkillId: selectedSkillTitle }, 
        { headers: { 'x-auth-token': token } }
      );
      setIsSwapModalOpen(false);
      setRequests(requests.filter(r => r._id !== selectedReq._id));
      setRefreshHistory(prev => prev + 1); // Updates Trade History component
      alert("Swap successful!");
    } catch (err) {
      console.error("Finalize error:", err);
    }
  };

  // --- END SWAP LOGIC ---

  const handleDelete = async (skillId) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/skills/${skillId}`, {
          headers: { 'x-auth-token': token }
        });
        setSkills(prevSkills => prevSkills.filter(skill => skill._id !== skillId));
      } catch (error) {
        console.error("Delete error:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userName');
    setUser(null);
  };

  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || skill.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const skillData = { ...formData, user: user.name };

    try {
      const { data } = await axios.post('http://localhost:5000/api/skills', skillData, { 
        headers: { 'x-auth-token': token } 
      });
      setSkills(prevSkills => [data, ...prevSkills]); 
      setIsModalOpen(false);
      setFormData({ title: "", description: "", type: "Offer", category: "Programming" });
    } catch (error) { 
      console.error("Submission Error:", error);
    }
  };

  if (!user) return <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4"><Auth onLoginSuccess={(userData) => setUser(userData)} /></div>;

  return (
    <div className="min-h-screen bg-[#fcfdff] text-slate-900 font-sans pb-20">
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b-2 border-transparent bg-clip-border [border-image:linear-gradient(to_right,#3b82f6,#8b5cf6)_1] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-1.5 rounded-lg shadow-lg">
              <Share2 className="text-white" size={20} />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              AI SkillSwap
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative p-2 cursor-pointer hover:bg-slate-100 rounded-full transition">
              <Bell size={20} className="text-slate-600" />
              {requests.length > 0 && (
                <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {requests.length}
                </span>
              )}
            </div>

            <button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2 rounded-full font-bold text-sm">
              Post Skill
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-none">{user.name}</p>
                <button onClick={handleLogout} className="text-[10px] text-red-500 font-bold">Logout</button>
              </div>
              <div className="h-9 w-9 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full flex items-center justify-center font-black text-sm uppercase">
                {user.name?.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-6 py-8">
        {/* PENDING REQUESTS NOTIFICATION PANEL */}
        {requests.length > 0 && (
          <div className="mb-10 bg-white border-2 border-blue-100 rounded-[2rem] p-6 shadow-sm">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2">
              <Bell size={18} className="text-blue-600"/> Pending Swap Requests
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {requests.map(req => (
                <div key={req._id} className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-bold text-blue-600 mb-1">SWAP REQUEST</p>
                    <p className="text-sm font-medium"><b>{req.senderName}</b> wants <b>{req.skillTitle}</b></p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleRequestAction(req, 'accepted')} className="p-2 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 shadow-md transition"><Check size={16}/></button>
                    <button onClick={() => handleRequestAction(req, 'rejected')} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-md transition"><X size={16}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-8">
           {categories.map(cat => (
             <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${activeCategory === cat ? "bg-blue-600 text-white" : "bg-blue-50 text-blue-600"}`}>{cat}</button>
           ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {filteredSkills.map((skill) => (
            <div key={skill._id} className="bg-white p-7 rounded-[2rem] border border-slate-100 shadow-sm relative group">
              <div className={`absolute top-0 left-0 w-full h-1 ${skill.type === 'Offer' ? 'bg-emerald-400' : 'bg-orange-400'}`}></div>
              <h3 className="text-lg font-black">{skill.title}</h3>
              <p className="text-slate-500 text-sm my-4 line-clamp-3">{skill.description}</p>
              
              <div className="flex justify-between items-center mt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase">{skill.user}</span>
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2 py-1 rounded font-bold uppercase">{skill.category}</span>
              </div>

              {/* REQUEST SWAP BUTTON (Visible for other users' skills) */}
              <div className="mt-6 flex gap-2">
                {skill.user !== user.name ? (
                  <button 
                    onClick={() => handleSwapRequest(skill)}
                    className="flex-1 py-3 bg-blue-50 text-blue-600 rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                  >
                    <ArrowLeftRight size={14}/> Request Swap
                  </button>
                ) : (
                  <div className="flex-1 py-3 bg-slate-50 text-slate-400 rounded-xl text-xs font-bold text-center italic border border-slate-100">
                    Your Skill
                  </div>
                )}
              </div>

              {skill.user === user.name && (
                <button onClick={() => handleDelete(skill._id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16}/>
                </button>
              )}
            </div>
          ))}
        </div>

        <TradeHistory key={refreshHistory} />
      </section>

      {/* MODAL: SELECTING YOUR OWN SKILL TO COMPLETE THE TRADE */}
      <AnimatePresence>
        {isSwapModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[70] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] p-10 max-w-md w-full relative shadow-2xl">
              <h2 className="text-xl font-black mb-2">Finalize Swap</h2>
              <p className="text-sm text-slate-500 mb-6">Choose one of <b>{selectedReq?.senderName}'s</b> skills to receive in return:</p>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {targetUserSkills.length > 0 ? targetUserSkills.map(s => (
                  <button key={s._id} onClick={() => handleFinalizeSwap(s.title)} className="w-full text-left p-4 hover:bg-blue-50 rounded-2xl border border-slate-100 transition-all font-bold text-sm">
                    {s.title}
                  </button>
                )) : (
                  <p className="text-center text-slate-400 py-4 italic">User has no other skills to offer.</p>
                )}
              </div>
              <button onClick={() => setIsSwapModalOpen(false)} className="mt-6 w-full py-3 text-slate-400 font-bold hover:text-slate-600">Cancel</button>
            </motion.div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white rounded-[2rem] p-10 max-w-md w-full relative shadow-2xl border-t-8 border-blue-600">
              <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400"><X size={26} /></button>
              <h2 className="text-2xl font-black mb-6">Post a Skill</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input placeholder="Skill Name" required className="w-full p-4 bg-slate-50 border rounded-2xl outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                <textarea placeholder="Description" required className="w-full p-4 bg-slate-50 border rounded-2xl h-24 outline-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                <div className="grid grid-cols-2 gap-4">
                  <select className="p-4 bg-slate-50 border rounded-2xl font-bold text-sm" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}>
                    <option value="Offer">Offering</option>
                    <option value="Request">Requesting</option>
                  </select>
                  <select className="p-4 bg-slate-50 border rounded-2xl font-bold text-sm" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                    {categories.filter(c => c !== "All").map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg">Publish Now</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;