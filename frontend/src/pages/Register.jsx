import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Layers, Loader2, UserPlus, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/client';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      login(response.data.user, response.data.token);
      toast.success('Registration complete. Welcome to TaskFlow.');
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.status === 400 && err.response?.data?.fields) {
        setErrors(err.response.data.fields);
      } else {
        setErrors({ general: 'Validation failed or email already exists.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-[450px]">
        <div className="bg-white rounded-[32px] shadow-premium p-10 border border-white">
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-primary-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <Layers size={24} />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">TaskFlow</span>
            </Link>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Create an account</h1>
            <p className="text-slate-500 font-medium text-sm mt-2">Join the next-gen task management platform</p>
          </div>

          {errors.general && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-4 py-3 rounded-xl mb-8 text-center uppercase tracking-tighter">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Full Name</label>
              <input
                type="text"
                className="form-input w-full"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              {errors.name && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.name}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Email Address</label>
              <input
                type="email"
                className="form-input w-full"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              {errors.email && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.email}</p>}
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
              {errors.password && <p className="text-[10px] font-bold text-red-500 mt-1">{errors.password}</p>}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary h-14 w-full text-lg font-bold group shadow-premium mt-4"
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
                <span className="flex items-center gap-2">
                  Create Account <UserPlus size={20} />
                </span>
              )}
            </button>
          </form>

          <div className="mt-10 pt-8 border-t border-slate-100 flex items-center justify-center gap-2">
            <ShieldCheck size={16} className="text-primary-500" />
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">
              Secure Registration SSL Encrypted
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm font-medium text-slate-500">
            Already verified?{' '}
            <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700 tracking-tight">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
