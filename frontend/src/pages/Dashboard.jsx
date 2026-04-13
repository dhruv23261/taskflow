import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, FolderKanban, X, Loader2, Calendar, Target, Users, TrendingUp, CheckCircle2, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '' });
  const [isCreating, setIsCreating] = useState(false);

  const { user } = useAuth();

  const fetchProjects = async () => {
    try {
      const { data } = await apiClient.get('/projects');
      setProjects(data.projects);
    } catch (error) {
      toast.error('Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    setIsCreating(true);
    
    try {
      const { data } = await apiClient.post('/projects', newProject);
      setProjects([data, ...projects]);
      setIsModalOpen(false);
      setNewProject({ name: '', description: '' });
      toast.success('Project created');
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setIsCreating(false);
    }
  };

  const totalTasks = projects.reduce((acc, p) => acc + (p._count?.tasks || 0), 0);

  return (
    <div className="flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-12">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-primary-600 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
            <Target size={14} /> Overview
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            Welcome back,{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent">
              {user?.name.split(' ')[0]}
            </span> 
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            You have {projects.length} active projects.
          </p>
        </div>
        
        <button 
          className="btn btn-primary h-11 px-6 text-sm font-bold shadow-md whitespace-nowrap" 
          onClick={() => setIsModalOpen(true)}
        >
          <Plus size={18} strokeWidth={2.5} />
          Create Project
        </button>
      </div>

      {/* Stats Quick Glance */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          { label: 'TOTAL PROJECTS', val: projects.length, icon: Target, color: 'primary' },
          { label: 'ACTIVE TASKS', val: totalTasks, icon: CheckCircle2, color: 'emerald' },
          { label: 'COMPLETED', val: projects.reduce((acc, p) => acc + (p._count?.completed || 0), 0), icon: TrendingUp, color: 'amber' },
          { label: 'TEAM MEMBERS', val: Math.max(1, projects.length > 0 ? 2 : 0), icon: Users, color: 'indigo' }
        ].map((stat, i) => (
          <div key={i} className="bg-white/50 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm flex items-center gap-4 group hover:bg-white transition-all">
            <div className={`w-10 h-10 rounded-xl bg-${stat.color}-50 flex items-center justify-center text-${stat.color}-600`}>
              <stat.icon size={18} />
            </div>
            <div>
              <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wide leading-none mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-slate-900 leading-none">{stat.val}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Your Projects</h2>
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-400 shadow-sm cursor-pointer hover:bg-slate-50">
               <FolderKanban size={14} />
             </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <Loader2 className="animate-spin text-primary-500" size={32} />
             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id}>
                <Link to={`/projects/${project.id}`}>
                  <div className="card p-8 h-full flex flex-col group transition-all">
                    <div className="flex justify-between items-start mb-10">
                      <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-all">
                        <Target size={24} />
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest leading-none mb-1">Status</span>
                        <span className="badge badge-medium py-0.5 px-2 text-[8px]">In Sync</span>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-bold text-slate-900 mb-2 truncate group-hover:text-primary-600 transition-colors">{project.name}</h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-8 flex-1">{project.description || 'No description available.'}</p>
                    
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                      <div className="flex -space-x-2">
                        {[1, 2].map((_, i) => (
                           <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center shadow-sm">
                              <Users size={12} className="text-slate-400" />
                           </div>
                        ))}
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-[8px] font-bold text-slate-300 uppercase tracking-wide leading-none mb-1">Created</span>
                        <div className="flex items-center gap-1 text-xs font-bold text-slate-900">
                          <Calendar size={12} className="text-primary-500" />
                          {format(new Date(project.createdAt), 'MMM yyyy')}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
            
            {/* Quick Add Card */}
            <button 
              onClick={() => setIsModalOpen(true)}
              className="group h-full min-h-[250px] border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-primary-400 hover:bg-primary-50/30 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-300 group-hover:bg-primary-500 group-hover:text-white flex items-center justify-center transition-all">
                <Plus size={24} />
              </div>
              <span className="font-bold text-slate-400 group-hover:text-primary-600 uppercase tracking-wide text-[9px]">Add Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Project Creation Modal */}
      {isModalOpen && (
        <div className="modal-overlay flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md z-50 fixed inset-0">
          <div className="modal w-full max-w-[500px] shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900">Initialize New Project</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <Plus className="rotate-45" size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Project Name</label>
                  <input 
                    type="text" 
                    required
                    className="form-input w-full"
                    placeholder="Enter project name..."
                    value={newProject.name}
                    onChange={(e) => setNewProject({...newProject, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</label>
                  <textarea 
                    className="form-textarea w-full min-h-[100px]"
                    placeholder="Project mission details..."
                    value={newProject.description}
                    onChange={(e) => setNewProject({...newProject, description: e.target.value})}
                  />
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-6 py-2.5 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors uppercase tracking-widest"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={isCreating}
                    className="btn btn-primary px-8 h-11 text-xs font-bold shadow-lg uppercase tracking-widest"
                  >
                    {isCreating ? <Loader2 className="animate-spin" size={18} /> : 'Create Project'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
