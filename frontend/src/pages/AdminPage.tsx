import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  ShieldAlert, Users, Trash2, Edit3, Shield, CheckCircle2,
  XCircle, AlertTriangle, RefreshCw
} from 'lucide-react';
import { getAdminUsers, updateAdminUserRole, toggleAdminUserVerify, deleteAdminUser } from '../services/api';
import { User } from '../types';
import { TableRowSkeleton } from '../components/ui/Skeleton';
import { RoleBadge } from '../components/ui/Badge';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [editingRole, setEditingRole] = useState<{ id: string, role: string } | null>(null);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin-users'],
    queryFn: getAdminUsers,
  });

  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: string, role: string }) => updateAdminUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast('User role updated', 'success');
      setEditingRole(null);
    },
  });

  const verifyMut = useMutation({
    mutationFn: (id: string) => toggleAdminUserVerify(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast('User verification toggled', 'success');
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteAdminUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      showToast('User deleted', 'success');
    },
  });

  const users = data?.users || [];

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertTriangle className="text-rose-400" size={40} />
        <p className="text-slate-400">Failed to load system users. Are you an admin?</p>
        <button onClick={() => refetch()} className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white text-sm rounded-lg transition-colors cursor-pointer"><RefreshCw size={14} /> Retry</button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-rose-500 tracking-tight flex items-center gap-2">
            <ShieldAlert size={22} /> Admin Control Panel
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage system users, roles, and permissions across the platform.</p>
        </div>
      </motion.div>

      {/* Users List */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-slate-800/50 flex items-center justify-between bg-slate-900/30">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-slate-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">Registered Users</h2>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2.5 py-1 rounded-full">{data?.count || 0} Total</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left bg-slate-950/20">
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-2xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={4} />) :
               users.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-xs text-slate-500">No users found.</td></tr>
              ) : users.map((u: User) => {
                const isSelf = currentUser?.id === u.id || (currentUser as any)?._id === u.id;
                return (
                  <tr key={u.id} className="border-b border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'} alt={u.name} className="w-8 h-8 rounded-full border border-slate-800 object-cover" />
                        <div>
                          <p className="text-xs font-semibold text-white flex items-center gap-2">
                            {u.name}
                            {isSelf && <span className="text-[9px] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-widest">You</span>}
                          </p>
                          <p className="text-2xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {editingRole?.id === u.id && !isSelf ? (
                        <div className="flex items-center gap-2">
                          <select 
                            value={editingRole.role}
                            onChange={(e) => setEditingRole({ id: u.id, role: e.target.value })}
                            className="glass-input py-1 px-2 text-xs cursor-pointer"
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="rep">Rep</option>
                            <option value="employee">Employee</option>
                          </select>
                          <button onClick={() => roleMut.mutate(editingRole)} className="text-emerald-400 hover:text-emerald-300"><CheckCircle2 size={16} /></button>
                          <button onClick={() => setEditingRole(null)} className="text-rose-400 hover:text-rose-300"><XCircle size={16} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <RoleBadge role={u.role} />
                          {!isSelf && (
                            <button onClick={() => setEditingRole({ id: u.id, role: u.role })} className="p-1 text-slate-500 hover:text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Edit3 size={12} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => { if (!isSelf) verifyMut.mutate(u.id); }}
                        disabled={isSelf}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-bold transition-colors ${
                          u.isVerified 
                            ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50' 
                            : 'bg-amber-950/50 text-amber-400 border border-amber-900/50'
                        } ${!isSelf ? 'hover:bg-slate-800 cursor-pointer' : 'cursor-not-allowed opacity-70'}`}
                      >
                        {u.isVerified ? <Shield size={10} /> : <AlertTriangle size={10} />}
                        {u.isVerified ? 'Verified' : 'Pending'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => { if (confirm(`Delete user ${u.name}? This action cannot be undone.`)) deleteMut.mutate(u.id); }}
                        disabled={isSelf}
                        className={`p-1.5 rounded-lg transition-all ${
                          isSelf 
                            ? 'text-slate-700 cursor-not-allowed' 
                            : 'text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 cursor-pointer'
                        }`}
                        title={isSelf ? "Cannot delete yourself" : "Delete User"}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
