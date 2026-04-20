import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { History, CheckCircle } from 'lucide-react';

const TradeHistory = ({ refreshTrigger }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      // FIXED: Using x-auth-token to match your backend middleware
      const res = await axios.get('http://localhost:5000/api/requests/history', {
        headers: { 'x-auth-token': token }
      });
      setHistory(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching history:", err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [refreshTrigger]); // Reloads when a new swap is confirmed

  if (loading) return <div className="text-center py-10">Loading history...</div>;

  return (
    <div className="mt-10 p-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <div className="flex items-center mb-6">
        <div className="p-2 bg-green-100 rounded-lg mr-3">
          <History className="w-6 h-6 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Trade History</h2>
      </div>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-100 rounded-xl">
            <p className="text-gray-400 italic">No completed swaps yet. Go trade some skills!</p>
          </div>
        ) : (
          history.map((swap) => (
            <div key={swap._id} className="group p-4 border rounded-xl bg-gradient-to-r from-white to-green-50 hover:shadow-md transition-all border-green-100 flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <p className="text-xs font-semibold text-green-600 uppercase tracking-wider">Successful Swap</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-lg font-bold text-gray-800">{swap.skillTitle}</span>
                  <span className="text-blue-500 font-bold">↔</span>
                  <span className="text-lg font-bold text-gray-800">{swap.selectedSkillTitle || "Skill Received"}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Traded with: <span className="font-medium text-gray-700">
                    {/* Automatically shows the OTHER person's name */}
                    {swap.sender.toLowerCase() === localStorage.getItem('userName')?.toLowerCase() ? swap.receiver : swap.sender}
                  </span>
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono text-gray-400 bg-white px-2 py-1 rounded border">
                  {new Date(swap.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TradeHistory;