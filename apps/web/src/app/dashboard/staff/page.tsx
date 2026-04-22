'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Users, UserPlus, Mail, Shield, Trash2, ShieldCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { apiClient } from '@/lib/api-client';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export default function StaffManagement() {
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({ name: '', email: '', password: 'Password@123', roleId: '', pin: '' });


  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await apiClient.get('/auth/staff');
      setStaff(res.data);
    } catch (error) {
      console.error('Error fetching staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async () => {
    try {
      await apiClient.post('/auth/staff', newMember);
      fetchStaff();
      setNewMember({ name: '', email: '', password: 'Password@123', roleId: '', pin: '' });

    } catch (error) {
      console.error('Error adding staff:', error);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Staff Management</h1>
          <p className="text-slate-500 mt-1">Manage your team members and their access permissions.</p>
        </div>

        <Dialog>
          <DialogTrigger className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2 bg-indigo-600 text-primary-foreground hover:bg-indigo-700">
              <UserPlus className="mr-2 h-4 w-4" /> Add Team Member
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  placeholder="e.g. Sarah Miller" 
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>4-Digit PIN Code</Label>
                  <Input 
                    type="text" 
                    maxLength={4}
                    placeholder="e.g. 1234" 
                    value={newMember.pin}
                    onChange={(e) => setNewMember({ ...newMember, pin: e.target.value.replace(/\D/g, '') })}
                  />
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">For POS Fast Login</p>
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <Input 
                    type="email" 
                    placeholder="sarah@example.com" 
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">

                  <Label>Temporary Password</Label>
                  <Input 
                    type="password" 
                    value={newMember.password}
                    onChange={(e) => setNewMember({ ...newMember, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select 
                    className="flex h-9 w-full rounded-md border border-slate-200 px-3 py-2 text-sm"
                    value={newMember.roleId}
                    onChange={(e) => setNewMember({ ...newMember, roleId: e.target.value })}
                  >
                    <option value="">Admin</option>
                    <option value="">Manager</option>
                    <option value="">POS User</option>
                    <option value="">Chef</option>
                  </select>
                </div>
              </div>
              <Button onClick={handleAddStaff} className="w-full bg-indigo-600">Create Account</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="border-b bg-slate-50/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-500" />
            Active Team Members
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-slate-50/30 text-slate-500 text-sm font-medium">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {staff.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-indigo-100 bg-white shadow-sm">
                          <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-bold uppercase">
                            {member.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-semibold text-slate-900">{member.name}</div>
                          <div className="text-xs text-slate-400">Joined {new Date(member.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {member.email}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                         member.role ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
                       }`}>
                         <Shield className="h-3 w-3" />
                         {member.role ? member.role.name : 'Operations'}
                       </span>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col gap-1">
                          {member.shifts && member.shifts[0]?.status === 'ACTIVE' ? (
                            <span className="flex w-fit items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                              Clocked In
                            </span>
                          ) : (
                            <span className="flex w-fit items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-sm">
                              <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                              Offline
                            </span>
                          )}
                          {member.pin && (
                             <span className="text-[10px] text-slate-400 font-bold tracking-widest">PIN: {member.pin}</span>
                          )}
                       </div>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-indigo-600">
                            <ShieldCheck className="h-4 w-4" />
                         </Button>
                         <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                         </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {staff.length === 0 && !loading && (
              <div className="py-20 text-center text-slate-400">No staff members found.</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
