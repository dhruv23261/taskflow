import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Layers, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function Login() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await apiClient.post('/auth/login', { email, password });
      login(response.data.user, response.data.token);
      toast.success('Successful authentication. Welcome back, agent.');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Invalid credentials provided.');
      } else {
        setError('An unexpected system error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,var(--clr-primary-50),transparent)]">
      <div className="w-full max-w-[480px] animate-fade">
        {/* Brand */}
        <div className="flex flex-col items-center mb-12">
          <div className="flex items-center justify-center w-20 h-20 mb-6 rounded-3xl bg-primary-600 text-white shadow-premium transform hover:rotate-6 transition-transform">
            <Layers size={40} strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight text-center">Login to TaskFlow</h1>
          <p className="text-slate-500 mt-3 font-medium text-center">Managed your projects and tasks effectively.</p>
        </div>

        {/* Card */}
        <div className="card p-10 sm:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary-600 to-accent"></div>
          
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-4 py-3 rounded-xl mb-8 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
              <input
                type="email"
                className="form-input w-full"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Password</label>
              <input
                type="password"
                className="form-input w-full"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn-primary h-14 w-full text-lg font-bold group shadow-premium"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                <span className="flex items-center gap-2">
                  Sign In <ArrowRight size={20} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-10 border-t border-slate-100 text-center">
            <p className="text-sm font-medium text-slate-500">
              New to the platform?{' '}
              <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700 tracking-tight">
                Create an account
              </Link>
            </p>
          </div>
        </div>
        
        <p className="mt-12 text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider opacity-50">
          Encrypted Task Management — © 2026 TaskFlow Systems
        </p>
      </div>
    </div>
  );
}
