import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Plus,
  ChevronLeft,
  Trash2,
  Clock,
  Edit2,
  X,
  Loader2,
  Settings,
  Target,
  Users,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import apiClient from '../api/client';
import { useAuth } from '../context/AuthContext';

const STATUSES = [
  { id: 'todo', label: 'To Do', color: 'slate' },
  { id: 'in_progress', label: 'In Progress', color: 'amber' },
  { id: 'done', label: 'Completed', color: 'emerald' }
];

export default function ProjectDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [isSavingTask, setIsSavingTask] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee_id: '',
    due_date: ''
  });

  const fetchProjectDetail = async () => {
    try {
      const { data } = await apiClient.get(`/projects/${id}`);
      // The backend returns { project: { ... } } or just the project object
      // Based on previous views, it seems to be { project: ... }
      setProject(data.project || data);
    } catch (error) {
      toast.error('Sector access denied or project not found');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data } = await apiClient.get('/users');
      setUsers(data.users || data || []);
    } catch (error) {
      console.error('Failed to sync with HQ personnel:', error);
    }
  };

  useEffect(() => {
    fetchProjectDetail();
    fetchUsers();
  }, [id]);

  const openNewTaskModal = (status = 'todo') => {
    setEditingTask(null);
    setTaskForm({
      title: '',
      description: '',
      status: status,
      priority: 'medium',
      assignee_id: '',
      due_date: new Date().toISOString().split('T')[0]
    });
    setIsTaskModalOpen(true);
  };

  const openEditTaskModal = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority || 'medium',
      assignee_id: task.assigneeId || '',
      due_date: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setIsSavingTask(true);

    try {
      const payload = {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        priority: taskForm.priority,
        assignee_id: taskForm.assignee_id || null,
        due_date: taskForm.due_date ? new Date(taskForm.due_date).toISOString() : null
      };

      if (editingTask) {
        await apiClient.patch(`/tasks/${editingTask.id}`, payload);
        toast.success('Objective parameters recalibrated');
      } else {
        await apiClient.post(`/projects/${id}/tasks`, payload);
        toast.success('New tactical asset deployed');
      }

      fetchProjectDetail();
      setIsTaskModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Execution failed');
    } finally {
      setIsSavingTask(false);
    }
  };

  const handleStatusChange = async (task, newStatus) => {
    if (task.status === newStatus) return;

    try {
      // Optimistic UI update
      const updatedTasks = project.tasks.map(t =>
        t.id === task.id ? { ...t, status: newStatus } : t
      );
      setProject({ ...project, tasks: updatedTasks });

      if (newStatus === 'done') {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8b5cf6', '#06b6d4', '#10b981']
        });
      }

      await apiClient.patch(`/tasks/${task.id}`, { status: newStatus });
    } catch (error) {
      toast.error('Sync failure — reverting state');
      fetchProjectDetail();
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Terminate this asset permanently?')) return;

    try {
      await apiClient.delete(`/tasks/${taskId}`);
      toast.success('Asset eliminated');
      fetchProjectDetail();
    } catch (error) {
      toast.error('Termination sequence failed');
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('CRITICAL: Wipe entire sector workspace and all assets?')) return;

    try {
      await apiClient.delete(`/projects/${id}`);
      toast.success('Sector data purged');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Purge sequence failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 min-h-[60vh]">
        <div className="w-12 h-12 bg-primary-600 rounded-2xl shadow-lg" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Project...</p>
      </div>
    );
  }

  if (!project) return null;

  const isOwner = project.ownerId === user?.id;

  return (
    <div className="flex flex-col flex-1 w-full max-w-[1400px] mx-auto p-4 sm:p-6 lg:p-10">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-10">
        <Link to="/dashboard" className="inline-flex items-center text-[11px] font-bold text-slate-400 hover:text-primary-600 transition-colors uppercase tracking-wider group">
          <ChevronLeft size={14} className="mr-1 mt-0" />
          Back to Projects
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 leading-none">{project.name}</h1>
            <div className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg font-bold text-[10px] border border-slate-200 shadow-sm">
              {project.tasks.length} {project.tasks.length === 1 ? 'task' : 'tasks'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="btn btn-primary h-11 px-5 text-sm font-bold shadow-md"
              onClick={() => openNewTaskModal('todo')}
            >
              <Plus size={16} strokeWidth={2.5} />
              Add Task
            </button>

            {isOwner && (
              <button
                onClick={handleDeleteProject}
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 transition-all shadow-sm"
                title="Delete Project"
              >
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-slate-500 max-w-2xl font-medium leading-relaxed">{project.description}</p>
        )}
      </div>

      {/* Kanban Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
        {STATUSES.map(statusColumn => {
          const columnTasks = project.tasks.filter(t => t.status === statusColumn.id);

          return (
            <div key={statusColumn.id} className="flex flex-col h-full min-h-[400px]">
              <div className="flex items-center justify-between mb-6 px-2">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full bg-${statusColumn.color === 'slate' ? 'slate-400' : statusColumn.color === 'amber' ? 'amber-500' : 'emerald-500'} shadow-sm`}></div>
                  <h3 className="font-bold text-[11px] uppercase tracking-wider text-slate-400">{statusColumn.label}</h3>
                  <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                    {columnTasks.length}
                  </span>
                </div>
              </div>

              <div className="flex-1 flex flex-col gap-4 p-4 rounded-[32px] bg-slate-100/40 border border-slate-100/60 overflow-y-auto">
                {columnTasks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed border-slate-200/50 rounded-[28px]">
                    <Target size={20} className="text-slate-200 mb-2" />
                    <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">No tasks yet</p>
                  </div>
                ) : (
                  columnTasks.map((task) => (
                    <div
                      key={task.id}
                      className="card p-5 group cursor-pointer relative overflow-hidden"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`badge badge-${task.priority} py-0.5 px-2 text-[9px]`}>
                          {task.priority}
                        </span>

                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all">
                          {isOwner && (
                            <button onClick={(e) => { e.preventDefault(); handleDeleteTask(task.id); }} className="p-1.5 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-lg border border-slate-100">
                              <Trash2 size={14} />
                            </button>
                          )}
                          <button onClick={(e) => { e.preventDefault(); openEditTaskModal(task); }} className="p-1.5 text-slate-300 hover:text-primary-600 transition-colors bg-white rounded-lg border border-slate-100">
                            <Edit2 size={14} />
                          </button>
                        </div>
                      </div>

                      <h4 className="font-bold text-lg text-slate-900 mb-2 tracking-tight group-hover:text-primary-600 transition-all">{task.title}</h4>

                      {task.description && (
                        <p className="text-slate-400 font-medium text-xs line-clamp-2 mb-6 leading-relaxed">{task.description}</p>
                      )}

                      <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {task.dueDate && (
                            <div className={`flex items-center text-[9px] font-bold px-2 py-1 rounded-lg gap-1.5 ${new Date(task.dueDate) < new Date() && task.status !== 'done' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-400'}`}>
                              <Calendar size={12} />
                              {format(new Date(task.dueDate), 'MMM d')}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            className="text-[9px] font-bold bg-slate-50 border-none rounded-lg py-1 px-2 text-slate-400 hover:text-slate-900 outline-none"
                            value={task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleStatusChange(task, e.target.value)}
                          >
                            <option value="todo">To Do</option>
                            <option value="in_progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>

                          {task.assignee && (
                            <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center text-[9px] font-bold text-primary-700 shadow-sm" title={task.assignee.name}>
                              {task.assignee.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Form Modal */}
      {isTaskModalOpen && (
        <div className="modal-overlay flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md z-[1000] fixed inset-0">
          <div
            className="modal shadow-2xl w-full max-w-[500px] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
              <div>
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
                <p className="text-slate-500 font-medium text-xs mt-1">Set task details and requirements.</p>
              </div>
              <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-all" onClick={() => setIsTaskModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTask}>
              <div className="p-8 flex flex-col gap-6 max-h-[60vh] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="task-title">Title</label>
                  <input
                    id="task-title"
                    type="text"
                    className="form-input text-lg font-bold h-12 w-full !bg-slate-50 border-none focus:!bg-white focus:ring-4 focus:ring-primary-100 rounded-xl"
                    placeholder="e.g. Design homepage"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    required autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="task-desc">Description</label>
                  <textarea
                    id="task-desc"
                    className="form-textarea w-full !bg-slate-50 border-none focus:!bg-white focus:ring-4 focus:ring-primary-100 min-h-[100px] text-sm font-medium rounded-xl p-4"
                    placeholder="Task requirements..."
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="task-status">Status</label>
                    <select id="task-status" className="form-select w-full h-11 !bg-slate-50 border-none font-bold text-xs rounded-xl px-4" value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}>
                      <option value="todo">To Do</option>
                      <option value="in_progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="task-priority">Priority</label>
                    <select id="task-priority" className="form-select w-full h-11 !bg-slate-50 border-none font-bold text-xs rounded-xl px-4" value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="task-assignee">Assignee</label>
                    <select id="task-assignee" className="form-select w-full h-11 !bg-slate-50 border-none font-bold text-xs rounded-xl px-4" value={taskForm.assignee_id} onChange={(e) => setTaskForm({ ...taskForm, assignee_id: e.target.value })}>
                      <option value="">Unassigned</option>
                      {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400" htmlFor="task-due">Due Date</label>
                    <input id="task-due" type="date" className="form-input w-full h-11 !bg-slate-50 border-none font-bold text-xs rounded-xl px-4" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
                  </div>
                </div>
              </div>

              <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 items-center">
                <button type="button" className="text-slate-400 font-bold uppercase tracking-widest text-[10px] hover:text-slate-900 transition-all" onClick={() => setIsTaskModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary h-11 px-6 text-sm font-bold shadow-md" disabled={isSavingTask || !taskForm.title.trim()}>
                  {isSavingTask ? <Loader2 className="animate-spin" size={18} /> : (editingTask ? 'Update Task' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
