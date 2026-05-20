import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Loader2, Users, Search, Filter, ShieldCheck, Mail, Building2, User } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  role: 'super_admin' | 'election_creator' | 'voter';
  organization: string | null;
  created_at: string;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, role, organization, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data as UserProfile[]);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, currentRole: string, newRole: 'super_admin' | 'election_creator' | 'voter') => {
    setUpdatingUserId(userId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);

      if (error) throw error;

      // Update state locally
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));

      // Log the admin override action in the audit logs
      await supabase.from('audit_logs').insert([
        {
          action: 'role_override',
          details: {
            target_user_id: userId,
            previous_role: currentRole,
            new_role: newRole,
            performed_by: 'super_admin_override'
          }
        }
      ]);
    } catch (err) {
      console.error('Failed to change role', err);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (u.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (u.organization?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="animate-spin text-primary h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold leading-7 text-slate-900 dark:text-white sm:truncate sm:text-3xl sm:tracking-tight">
          User Management
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Manage system users, assign roles, and audit permissions.
        </p>
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col md:flex-row gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email or org..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Role Filter */}
          <div className="relative">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-48 pl-3 pr-8 py-2 border border-slate-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 text-sm text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
            >
              <option value="all">All Roles</option>
              <option value="voter">Voters</option>
              <option value="election_creator">Election Creators</option>
              <option value="super_admin">Super Admins</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-400">
              <Filter className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Users List Table */}
      <div className="bg-white dark:bg-slate-800 shadow rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Date Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">System Role</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-sm text-slate-500">No users found matching filters.</td>
                </tr>
              ) : filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  {/* User details */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-200 font-bold uppercase">
                        {u.name?.slice(0, 2) || <User className="h-5 w-5" />}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{u.name || 'Anonymous User'}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {u.email || 'No Email'}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Organization */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900 dark:text-slate-300 flex items-center gap-1">
                      <Building2 className="h-4 w-4 text-slate-400" />
                      {u.organization || 'Independent'}
                    </div>
                  </td>

                  {/* Date Joined */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(u.created_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </td>

                  {/* System Role Selection */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <select
                        value={u.role}
                        disabled={updatingUserId === u.id}
                        onChange={(e) => handleRoleChange(u.id, u.role, e.target.value as any)}
                        className={`rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary capitalize
                          ${u.role === 'super_admin' ? 'text-rose-600 dark:text-rose-400 font-bold' : 
                            u.role === 'election_creator' ? 'text-amber-600 dark:text-amber-400' : 
                            'text-slate-700 dark:text-slate-300'}`}
                      >
                        <option value="voter">Voter</option>
                        <option value="election_creator">Election Creator</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                      {updatingUserId === u.id && (
                        <Loader2 className="animate-spin text-primary h-4 w-4" />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
