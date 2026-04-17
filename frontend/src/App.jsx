import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Search, User, PlusCircle, BookOpen, Code, Palette, Clock, X, Trash2, Filter } from 'lucide-react';

function App() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [showOnlyMine, setShowOnlyMine] = useState(false); // New Toggle State
  
  const categories = ["All", "Programming", "Design", "Marketing", "Business"];
  const currentUser = "Shashank"; // Matches your project identity

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "Offer",
    category: "Programming"
  });

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/skills');
        setSkills(data);
        setLoading(false);
      } catch (error) {
        console.error("Error connecting to backend:", error);
        setLoading(false);
      }
    };
    fetchSkills();
  }, []);

  // 🛠️ Master Filtering Logic: Search + Category + User Toggle
  const filteredSkills = skills.filter(skill => {
    const matchesSearch = skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          skill.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || skill.category === activeCategory;
    const matchesUser = !showOnlyMine || skill.user === currentUser;
    
    return matchesSearch && matchesCategory && matchesUser;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newSkill = { ...formData, user: currentUser };
      const { data } = await axios.post('http://localhost:5000/api/skills', newSkill);
      setSkills([...skills, data]); 
      setIsModalOpen(false);
      setFormData({ title: "", description: "", type: "Offer", category: "Programming" });
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const deleteSkill = async (id) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        await axios.delete(`http://localhost:5000/api/skills/${id}`);
        setSkills(skills.filter(skill => skill._id !== id));
      } catch (error) {
        console.error("Delete failed:", error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Navbar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg shadow-lg shadow-blue-100">
              <Share2 className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-800">AI SkillSwap</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-full hover:bg-blue-700 transition shadow-md shadow-blue-200"
            >
              <PlusCircle size={18} /> <span className="text-sm font-bold">Post a Skill</span>
            </button>
            <div className="h-9 w-9 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200 transition">
              <User size={18} className="text-slate-600" />
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-6 py-16 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
          className="text-6xl font-black mb-6 tracking-tight leading-tight"
        >
          Exchange Skills. <br /><span className="text-blue-600 underline decoration-blue-100 underline-offset-8">Build the Future.</span>
        </motion.h1>
        
        <div className="max-w-2xl mx-auto relative group mt-12">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-blue-600' : 'text-slate-400'}`} size={22} />
          <input 
            type="text" placeholder="Search by title or description..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-5 bg-white border border-slate-200 rounded-[2rem] shadow-2xl shadow-slate-200/50 outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
          />
        </div>
      </header>

      {/* Filter Toolbar */}
      <section className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                  activeCategory === cat 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* User Toggle */}
          <button
            onClick={() => setShowOnlyMine(!showOnlyMine)}
            className={`flex items-center gap-2 px-5 py-2 rounded-2xl text-sm font-bold transition-all border ${
              showOnlyMine 
                ? "bg-slate-900 text-white border-slate-900 shadow-lg" 
                : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"
            }`}
          >
            <Filter size={16} />
            {showOnlyMine ? "Showing My Posts" : "Show Only My Posts"}
          </button>
        </div>

        {/* Skills Grid */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 animate-pulse font-medium">Syncing with database...</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimatePresence mode='popLayout'>
              {filteredSkills.map((skill) => (
                <motion.div 
                  key={skill._id} layout
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  whileHover={{ y: -8 }}
                  className="bg-white p-7 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl transition-all group flex flex-col h-full"
                >
                  <div className="flex justify-between items-start mb-5">
                    <span className={`text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-lg ${skill.type === 'Offer' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {skill.type}
                    </span>
                    <div className="flex gap-4">
                      <button onClick={() => deleteSkill(skill._id)} className="text-slate-200 hover:text-red-500 transition-colors" title="Delete Post">
                        <Trash2 size={19} />
                      </button>
                      <div className="text-blue-500 opacity-60 group-hover:opacity-100 transition-opacity">
                        {skill.category === 'Design' && <Palette size={22} />}
                        {skill.category === 'Programming' && <Code size={22} />}
                        {skill.category === 'Marketing' && <Share2 size={22} />}
                        {skill.category === 'Business' && <BookOpen size={22} />}
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors leading-tight">{skill.title}</h3>
                  <p className="text-slate-500 text-sm mb-8 leading-relaxed line-clamp-2">{skill.description}</p>
                  
                  <div className="pt-6 border-t border-slate-50 mt-auto flex flex-col gap-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center font-bold text-[11px] text-blue-600">
                          {skill.user?.charAt(0) || 'U'}
                        </div>
                        <span className="text-xs font-bold text-slate-700">{skill.user || 'User'}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-400 text-[10px] font-medium">
                        <Clock size={12} /> <span>Active Now</span>
                      </div>
                    </div>
                    <button className="w-full py-3.5 bg-slate-900 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all transform active:scale-[0.98]">
                      Request Swap
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty Search/Filter State */}
        {!loading && filteredSkills.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100"
          >
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
               <Search className="text-slate-300" size={32} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">No results found</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Try adjusting your category or search terms to find more skills.</p>
            <button 
              onClick={() => {setActiveCategory("All"); setSearchTerm(""); setShowOnlyMine(false);}} 
              className="px-8 py-3 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all"
            >
              Reset All Filters
            </button>
          </motion.div>
        )}
      </section>

      {/* Skill Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl relative border border-white"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute right-8 top-8 text-slate-400 hover:text-slate-600 transition">
                <X size={26} />
              </button>
              <h2 className="text-3xl font-black mb-2">Post a Skill</h2>
              <p className="text-slate-500 text-sm mb-8 font-medium">Join the community and trade your craft.</p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Skill Name</label>
                  <input 
                    placeholder="e.g. Mastering Tailwind CSS" required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium"
                    value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Description</label>
                  <textarea 
                    placeholder="What can you teach or what are you looking for?" required
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 h-28 resize-none font-medium leading-relaxed"
                    value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Type</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none cursor-pointer font-bold text-slate-700"
                      value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Offer">Offering</option>
                      <option value="Request">Requesting</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase tracking-wider text-slate-400 ml-1">Category</label>
                    <select 
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none cursor-pointer font-bold text-slate-700"
                      value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      {categories.filter(c => c !== "All").map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 mt-4">
                  Publish Now
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;