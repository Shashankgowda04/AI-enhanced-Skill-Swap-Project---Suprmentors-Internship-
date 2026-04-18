import React, { useState } from 'react';
import axios from 'axios';

const Auth = ({ onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 🛡️ Ensure the URL matches index.js: /api/auth/login or /api/auth/register
    const endpoint = isLogin ? 'login' : 'register';
    
    try {
      const { data } = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, formData);
      
      // Save to localStorage so App.jsx can see it
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      // Tell App.jsx we are logged in
      onLoginSuccess(data.user);
      alert(isLogin ? "Welcome Back!" : "Account Created!");
    } catch (err) {
      console.error("Auth Error Details:", err.response?.data);
      alert(err.response?.data?.msg || "Login Failed. Try bob@test.com / 123456");
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2rem] shadow-2xl w-full max-w-md border border-slate-100">
      <h2 className="text-3xl font-black mb-6 text-slate-800">{isLogin ? 'Login' : 'Join Us'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <input 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
            placeholder="Name" 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            required 
          />
        )}
        <input 
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Email (use bob@test.com)" 
          type="email"
          onChange={(e) => setFormData({...formData, email: e.target.value})} 
          required 
        />
        <input 
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500" 
          placeholder="Password (use 123456)" 
          type="password"
          onChange={(e) => setFormData({...formData, password: e.target.value})} 
          required 
        />
        <button type="submit" className="w-full py-4 bg-blue-600 text-white font-black rounded-2xl shadow-lg hover:bg-blue-700 transition-all">
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-6 text-sm font-bold text-slate-400 hover:text-blue-600">
        {isLogin ? "Need an account? Register" : "Already have an account? Login"}
      </button>
    </div>
  );
};

export default Auth;