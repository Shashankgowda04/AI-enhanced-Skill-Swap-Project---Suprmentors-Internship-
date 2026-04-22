import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, CheckCircle, Clock, Check, X, ArrowRightLeft } from 'lucide-react';

const TradeHistory = ({ refreshTrigger }) => {
  const [requests, setRequests] = useState([]); 
  const [history, setHistory] = useState([]);   
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      const reqRes = await axios.get('http://localhost:5000/api/requests', { headers });
      // 🟢 FIX: Only show 'pending' requests in the Incoming box
      const pendingRequests = reqRes.data.filter(r => r.status === 'pending');
      setRequests(pendingRequests);

      const histRes = await axios.get('http://localhost:5000/api/requests/history', { headers });
      setHistory(histRes.data);

      setLoading(false);
    } catch (err) {
      console.error("Error fetching data:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshTrigger]);

  const handleAction = async (request, status) => {
    try {
      const token = localStorage.getItem('token');
      const selectedSkillId = status === 'accepted' ? request.senderSkill : null;

      await axios.put(`http://localhost:5000/api/requests/${request._id}`, 
        { status, selectedSkillId }, 
        { headers: { 'x-auth-token': token } }
      );
      
      // 🟢 OPTIMIZATION: Manually filter local state immediately for instant UI response
      setRequests(prev => prev.filter(r => r._id !== request._id));
      
      alert(`Proposal ${status}!`);
      fetchData(); 
    } catch (err) {
      console.error("Action error:", err);
      alert("Error updating proposal");
    }
  };

  if (loading) return <div className="text-center py-10 text-white italic font-medium opacity-50 uppercase text-xs tracking-widest">Synchronizing...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- SECTION 1: INCOMING PROPOSALS --- */}
      <div className="p-6 bg-[#0A1128] rounded-3xl border border-blue-500/20 shadow-2xl">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg mr-3 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
            <Clock className="w-5 h-5 text-blue-400" />
          </div>
          <h2 className="text-lg font-black text-white uppercase italic tracking-tighter">Incoming Proposals</h2>
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-slate-500 italic text-[10px] uppercase font-bold text-center py-4 tracking-widest">No pending requests</p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-blue-500/50 transition-all duration-300">
                <div>
                  <p className="text-blue-400 text-[9px] font-black uppercase mb-1 tracking-widest">Trade Offer</p>
                  <h3 className="text-white font-bold text-sm leading-tight max-w-[250px]">
                    <span className="text-blue-200">{req.sender}</span> wants to swap <span className="italic text-slate-300">"{req.senderSkill}"</span> for your <span className="italic text-slate-300">"{req.skillTitle}"</span>
                  </h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction(req, 'accepted')} className="p-3 bg-emerald-500 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"><Check size={18} strokeWidth={3} /></button>
                  <button onClick={() => handleAction(req, 'rejected')} className="p-3 bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={18} strokeWidth={3} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- SECTION 2: COMPLETED HISTORY --- */}
      <div className="p-6 bg-white rounded-3xl shadow-xl border border-slate-100">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-green-100 rounded-lg mr-3">
            <History className="w-5 h-5 text-green-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900 tracking-tight uppercase italic">Verified Trades</h2>
        </div>

        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-slate-400 text-[10px] uppercase font-bold italic">History Empty</p>
            </div>
          ) : (
            history.map((swap) => {
              const currentUserName = localStorage.getItem('userName')?.toLowerCase();
              const isUserSender = swap.sender.toLowerCase() === currentUserName;
              const partnerName = isUserSender ? swap.receiver : swap.sender;

              return (
                <div key={swap._id} className="p-4 border border-slate-100 rounded-2xl bg-slate-50/50 hover:bg-white transition-all shadow-sm group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                         {/* Clear visual of what was swapped for what */}
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-blue-600 uppercase italic">You received</span>
                           <span className="text-slate-900 font-bold text-sm italic">{isUserSender ? swap.skillTitle : swap.senderSkill}</span>
                        </div>
                        <ArrowRightLeft size={14} className="text-slate-300 mt-4" />
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-400 uppercase italic">You gave</span>
                           <span className="text-slate-900 font-bold text-sm italic opacity-60">{isUserSender ? swap.senderSkill : swap.skillTitle}</span>
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest group-hover:text-slate-600 transition-colors">
                        Partner: {partnerName}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="bg-emerald-500 text-white p-1 rounded-full"><CheckCircle size={12} /></div>
                      <span className="text-[9px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                        {new Date(swap.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeHistory;