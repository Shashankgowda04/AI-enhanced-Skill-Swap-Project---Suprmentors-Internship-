import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, CheckCircle, Clock, Check, X, ArrowRightLeft } from 'lucide-react';

const TradeHistory = ({ refreshTrigger, onUpdate }) => {
  const [requests, setRequests] = useState([]); 
  const [history, setHistory] = useState([]);   
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      const reqRes = await axios.get('http://localhost:5000/api/requests', { headers });
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
      
      setRequests(prev => prev.filter(r => r._id !== request._id));
      
      if (onUpdate) {
        onUpdate(); 
      }
      fetchData(); 
    } catch (err) {
      console.error("Action error:", err);
    }
  };

  if (loading) return <div className="text-center py-10 text-white italic font-medium opacity-50 uppercase text-xs tracking-widest">Synchronizing...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- INCOMING PROPOSALS --- */}
      <div className="p-6 bg-[#0A1128] rounded-[2rem] border border-blue-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex items-center mb-8">
          <div className="p-2.5 bg-blue-600 rounded-xl mr-4 shadow-lg shadow-blue-600/30">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Incoming Proposals</h2>
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="py-10 text-center border border-white/5 rounded-2xl bg-white/5">
               <p className="text-slate-500 italic text-[11px] uppercase font-black tracking-widest">Queue is empty</p>
            </div>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-blue-500/50 transition-all">
                <div>
                  <h3 className="text-white font-bold text-base leading-tight">
                    {/* UPDATED: Showing both the requested skill and the offered skill */}
                    <span className="text-blue-100 font-black">{req.sender}</span> wants your 
                    <span className="text-emerald-400"> "{req.skillTitle}"</span> and offers 
                    <span className="text-blue-400"> "{req.senderSkill}"</span>
                  </h3>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => handleAction(req, 'accepted')} className="p-3 bg-emerald-500 text-white rounded-xl hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20"><Check size={18} strokeWidth={4} /></button>
                  <button onClick={() => handleAction(req, 'rejected')} className="p-3 bg-red-500/10 text-red-500 border border-red-500/30 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X size={18} strokeWidth={4} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --- VERIFIED TRADES --- */}
      <div className="p-6 bg-[#FDFBF7] rounded-[2rem] shadow-2xl border border-orange-100/50 relative overflow-hidden">
        <div className="flex items-center mb-8">
          <div className="p-2.5 bg-slate-900 rounded-xl mr-4 shadow-xl">
            <History className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tighter uppercase italic">Verified Trades</h2>
        </div>

        <div className="space-y-6">
          {history.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-orange-100 rounded-[2rem]">
              <p className="text-slate-400 text-[11px] uppercase font-black italic">No trades yet</p>
            </div>
          ) : (
            history.map((swap) => {
              const currentUserName = localStorage.getItem('userName')?.toLowerCase();
              const isUserSender = swap.sender.toLowerCase() === currentUserName;
              const partnerName = isUserSender ? swap.receiver : swap.sender;

              return (
                <div 
                  key={swap._id} 
                  className="p-1 rounded-[1.5rem] bg-gradient-to-r from-blue-600 via-indigo-500 to-emerald-500 shadow-xl shadow-indigo-200/50 hover:scale-[1.02] transition-all duration-500"
                >
                  <div className="p-6 bg-white rounded-[1.25rem] flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.1em] mb-1">Gained Skill</span>
                           <span className="text-slate-900 font-black text-xl italic leading-none tracking-tight">
                             {isUserSender ? swap.skillTitle : swap.senderSkill}
                           </span>
                        </div>
                        
                        <div className="p-2 bg-slate-50 rounded-full text-slate-300">
                           <ArrowRightLeft size={20} strokeWidth={3} />
                        </div>

                        <div className="flex flex-col">
                           <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.1em] mb-1">Traded Skill</span>
                           <span className="text-slate-400 font-bold text-base italic leading-none">
                             {isUserSender ? swap.senderSkill : swap.skillTitle}
                           </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-[11px] text-white font-black shadow-sm">
                          {partnerName.charAt(0)}
                        </div>
                        <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                          Verified Partner: <span className="text-blue-600 font-black">{partnerName}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-4">
                      <div className="px-5 py-2 bg-emerald-500 text-white rounded-full shadow-lg shadow-emerald-500/40 flex items-center gap-2">
                        <CheckCircle size={14} strokeWidth={3} />
                        <span className="text-[12px] font-black uppercase italic tracking-tighter">Verified Swap</span>
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">
                        {new Date(swap.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
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