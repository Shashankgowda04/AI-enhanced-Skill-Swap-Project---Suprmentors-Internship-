import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, CheckCircle, Clock, Check, X } from 'lucide-react';

const TradeHistory = ({ refreshTrigger }) => {
  const [requests, setRequests] = useState([]); 
  const [history, setHistory] = useState([]);   
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      const reqRes = await axios.get('http://localhost:5000/api/requests', { headers });
      setRequests(reqRes.data);

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
      
      // 🟢 AUTOMATIC LOGIC: No more prompt!
      // If accepting, we use the senderSkill already stored in the request
      const selectedSkillId = status === 'accepted' ? request.senderSkill : null;

      await axios.put(`http://localhost:5000/api/requests/${request._id}`, 
        { status, selectedSkillId }, 
        { headers: { 'x-auth-token': token } }
      );
      
      alert(`Proposal ${status}!`);
      fetchData(); 
    } catch (err) {
      console.error("Action error:", err);
      alert("Error updating proposal");
    }
  };

  if (loading) return <div className="text-center py-10 text-white italic font-medium">Loading Skill Hub...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* --- SECTION 1: INCOMING PROPOSALS --- */}
      <div className="p-6 bg-[#0A1128] rounded-3xl border border-blue-500/20 shadow-2xl">
        <div className="flex items-center mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg mr-3 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Clock className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-xl font-black text-white uppercase italic tracking-tighter">Incoming Proposals</h2>
        </div>

        <div className="space-y-4">
          {requests.length === 0 ? (
            <p className="text-slate-500 italic text-sm text-center py-4">No new requests at the moment.</p>
          ) : (
            requests.map((req) => (
              <div key={req._id} className="p-5 bg-white/5 border border-white/10 rounded-2xl flex justify-between items-center group hover:border-blue-500/50 transition-all duration-300">
                <div>
                  <p className="text-blue-400 text-[10px] font-black uppercase mb-1 tracking-widest">New Swap Request</p>
                  <h3 className="text-white font-bold text-lg leading-tight">
                    {req.sender} <span className="text-slate-400 font-medium italic">offering</span> {req.senderSkill || "a skill"} <span className="text-slate-400 font-medium italic">for your</span> {req.skillTitle}
                  </h3>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => handleAction(req, 'accepted')}
                    className="p-3 bg-emerald-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"
                    title="Accept Swap"
                  >
                    <Check size={20} strokeWidth={3} />
                  </button>
                  <button 
                    onClick={() => handleAction(req, 'rejected')}
                    className="p-3 bg-red-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg shadow-red-500/20"
                    title="Reject Swap"
                  >
                    <X size={20} strokeWidth={3} />
                  </button>
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
            <History className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">Verified Trade History</h2>
        </div>

        <div className="space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
              <p className="text-slate-400 text-sm italic">No completed swaps recorded yet.</p>
            </div>
          ) : (
            history.map((swap) => (
              <div key={swap._id} className="p-4 border border-slate-100 rounded-2xl flex justify-between items-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="bg-emerald-100 p-2 rounded-full shadow-inner">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-slate-900 font-bold">{swap.skillTitle}</p>
                      <span className="text-blue-500 font-black">↔</span>
                      <p className="text-slate-900 font-bold">{swap.selectedSkillTitle || "Skill Received"}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mt-1">
                      Partner: {swap.sender.toLowerCase() === localStorage.getItem('userName')?.toLowerCase() ? swap.receiver : swap.sender}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">
                    {new Date(swap.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeHistory;