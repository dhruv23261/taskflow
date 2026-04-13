import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Layers, Layout, Bell, Search, Command } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name 
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <nav className="navbar flex items-center justify-between px-6 sm:px-10 backdrop-blur-md bg-white/70 sticky top-0 z-[100] border-b border-slate-100 h-16">
      {/* Brand */}
      <Link to="/dashboard" className="flex items-center gap-3 group">
        <motion.div 
          whileHover={{ rotate: 15.15, scale: 1.1 }}
          className="flex items-center justify-center bg-slate-900 text-white rounded-xl p-2 shadow-lg group-hover:bg-primary-600 transition-colors"
        >
          <Command size={18} strokeWidth={2.5} />
        </motion.div>
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">TaskFlow</span>
        </div>
      </Link>

      {/* Center Search - Premium Visual */}
      <div className="hidden lg:flex items-center bg-slate-100/50 rounded-xl px-4 py-1.5 w-[350px] border border-transparent focus-within:border-primary-200 focus-within:bg-white transition-all shadow-inner group">
        <Search size={14} className="text-slate-400 mr-2 group-focus-within:text-primary-500 transition-colors" />
        <input type="text" placeholder="Search tasks..." className="bg-transparent border-none text-xs outline-none w-full font-bold text-slate-600 placeholder:text-slate-400" />
        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-white rounded-md border border-slate-200 text-[9px] font-black text-slate-400">
          <span className="opacity-50">CTRL</span> K
        </div>
      </div>

      {/* User Actions */}
      {user && (
      <div className="flex items-center gap-6">
        <button 
          className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all relative"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary-500 rounded-full border-2 border-white"></span>
        </button>

        <div className="h-8 w-px bg-slate-100"></div>

        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-xs font-bold text-slate-900 leading-none">{user.name}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Account Member</span>
          </div>
          <div 
            className="avatar w-9 h-9 shadow-md border-2 border-white group-hover:border-primary-100 transition-all ring-1 ring-slate-100"
          >
            {initials}
          </div>
        </div>
        
        <button 
          onClick={handleLogout} 
          className="flex items-center justify-center w-9 h-9 text-slate-300 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
          title="Logout"
        >
          <LogOut size={18} />
        </button>
      </div>
      )}
    </nav>
  );
}
