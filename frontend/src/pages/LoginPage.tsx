import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('researcher@ieee.org');
  const [password, setPassword] = useState('research123');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Redirect to dashboard
    navigate('/');
  };

  const handleDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setTimeout(() => {
      navigate('/');
    }, 200);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        {/* Logo */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
            <Car className="h-7 w-7" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">RoadAccident AI</h1>
          <p className="text-xs text-slate-500">
            Road Accident Severity Prediction & Explainable AI Platform
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 font-semibold text-white shadow-xs hover:bg-blue-700 transition-colors"
          >
            <span>Sign In to Platform</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Demo Quick Logins */}
        <div className="border-t border-slate-100 pt-4 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase text-center tracking-wider">
            Quick Demonstration Credentials
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleDemoLogin('researcher@ieee.org', 'research123')}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100 transition-colors"
            >
              <p className="font-bold text-slate-800">Lead Researcher</p>
              <p className="text-[10px] text-slate-400">Dr. Alan Turing</p>
            </button>
            <button
              onClick={() => handleDemoLogin('admin@roadsafety.ai', 'admin123')}
              className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-left hover:bg-slate-100 transition-colors"
            >
              <p className="font-bold text-slate-800">Safety Analyst</p>
              <p className="text-[10px] text-slate-400">Lead Admin</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
