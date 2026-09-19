import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Edit2,
  Trash2,
  Lock,
  Check,
  X,
  AlertCircle,
  KeyRound,
  MapPin,
  Phone,
  Mail,
  CheckCircle2
} from 'lucide-react';
import { User, UserRole, UserPermissions } from '../../../types';
import { api } from '../../../lib/api';
import { toBengaliNumber } from '../../../lib/utils';

interface UserManagementViewProps {
  currentUser: User;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser }) => {
  const isSuperAdmin = currentUser.role === 'super_admin';

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('reporter');
  const [formPhone, setFormPhone] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formStatus, setFormStatus] = useState<'active' | 'suspended' | 'disabled'>('active');

  // Permissions state
  const defaultPermissions: UserPermissions = {
    createNews: true,
    editOwnNews: true,
    deleteOwnNews: false,
    uploadImage: true,
    uploadThumbnail: true,
    viewOwnNews: true,
    publishNews: false,
    submitForReview: true
  };

  const [permissions, setPermissions] = useState<UserPermissions>(defaultPermissions);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.getUsers();
      setUsers(res.users);
    } catch (err: any) {
      setErrorMsg(err.message || 'ইউজার তালিকা লোড করতে ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('reporter');
    setFormPhone('');
    setFormBio('সংবাদদাতা, বিশ্বম্ভরপুর, সুনামগঞ্জ');
    setFormStatus('active');
    setPermissions(defaultPermissions);
    setShowAddModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword('');
    setFormRole(user.role);
    setFormPhone(user.phone || '');
    setFormBio(user.bio || '');
    setFormStatus(user.status || 'active');
    setPermissions(user.permissions || defaultPermissions);
    setShowAddModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formName.trim() || !formEmail.trim()) {
      setErrorMsg('নাম ও ইমেইল অবশ্যই পূরণ করতে হবে।');
      return;
    }

    if (!editingUser && !formPassword.trim()) {
      setErrorMsg('নতুন ইউজারের পাসওয়ার্ড প্রদান করুন।');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingUser) {
        const payload: any = {
          name: formName,
          role: formRole,
          phone: formPhone,
          bio: formBio,
          status: formStatus,
          permissions
        };
        if (formPassword.trim()) {
          payload.password = formPassword.trim();
        }
        await api.updateUser(editingUser.id, payload);
        setSuccessMsg('ইউজারের তথ্য সফলভাবে আপডেট করা হয়েছে।');
      } else {
        await api.createUser({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
          phone: formPhone,
          bio: formBio,
          status: formStatus,
          permissions
        });
        setSuccessMsg('নতুন ইউজার সফলভাবে তৈরি করা হয়েছে।');
      }

      setShowAddModal(false);
      await fetchUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (id === currentUser.id) {
      alert('আপনি নিজের অ্যাকাউন্ট মুছে ফেলতে পারবেন না!');
      return;
    }
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে "${name}"-কে মুছে ফেলতে চান?`)) return;

    try {
      await api.deleteUser(id);
      setSuccessMsg('ইউজার মুছে ফেলা হয়েছে।');
      await fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || 'মুছে ফেলতে ব্যর্থ হয়েছে।');
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return { label: 'সুপার অ্যাডমিন', color: 'bg-red-100 text-red-700 border-red-200' };
      case 'admin':
        return { label: 'অ্যাডমিন', color: 'bg-purple-100 text-purple-700 border-purple-200' };
      case 'editor':
        return { label: 'সম্পাদক', color: 'bg-blue-100 text-blue-700 border-blue-200' };
      default:
        return { label: 'রিপোর্টার', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            <span>সাংবাদিক ও ইউজার কন্ট্রোল প্যানেল</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            মোট {toBengaliNumber(users.length)} জন নিবন্ধিত ইউজার ও প্রতিনিধি
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>নতুন রিপোর্টার / অ্যাডমিন যোগ</span>
        </button>
      </div>

      {/* Users List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">ব্যবহারকারী</th>
                <th className="py-3 px-4">পদবী ও ভূমিকা</th>
                <th className="py-3 px-4 hidden sm:table-cell">যোগাযোগ</th>
                <th className="py-3 px-4 hidden md:table-cell">অনুমতিসমূহ</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    লোড হচ্ছে...
                  </td>
                </tr>
              ) : (
                users.map(u => {
                  const roleBadge = getRoleLabel(u.role);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold border ${roleBadge.color}`}>
                          {roleBadge.label}
                        </span>
                        {u.bio && <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{u.bio}</p>}
                      </td>

                      <td className="py-3 px-4 hidden sm:table-cell text-slate-600">
                        {u.phone && (
                          <p className="flex items-center gap-1 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400" /> {u.phone}
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.permissions?.publishNews && (
                            <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 text-[10px] font-medium border border-emerald-200">
                              সরাসরি প্রকাশ
                            </span>
                          )}
                          {u.permissions?.createNews && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px]">সংবাদ রচনা</span>
                          )}
                          {u.permissions?.uploadImage && (
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 text-[10px]">ছবি আপলোড</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-red-50 text-red-700 border border-red-200'
                          }`}
                        >
                          {u.status === 'active' ? 'সক্রিয়' : 'স্থগিত'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(u)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg"
                            title="সম্পাদনা ও অনুমতি"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {u.id !== currentUser.id && u.role !== 'super_admin' && (
                            <button
                              onClick={() => handleDeleteUser(u.id, u.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                              title="ইউজার মুছুন"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                {editingUser ? 'ইউজার ও অনুমতি সম্পাদনা' : 'নতুন রিপোর্টার বা কর্মী যোগ'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">পূর্ণ নাম *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={e => setFormName(e.target.value)}
                    placeholder="যেমন: তারেক রহমান"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ইমেইল ঠিকানা *</label>
                  <input
                    type="email"
                    required
                    disabled={Boolean(editingUser)}
                    value={formEmail}
                    onChange={e => setFormEmail(e.target.value)}
                    placeholder="admin@haortv.com"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 disabled:bg-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {editingUser ? 'নতুন পাসওয়ার্ড (পরিবর্তন না চাইলে খালি রাখুন)' : 'পাসওয়ার্ড *'}
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder="নূন্যতম ৬ অক্ষর"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ভূমিকা (Role) *</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="reporter">রিপোর্টার (Reporter)</option>
                    <option value="editor">সম্পাদক (Editor)</option>
                    <option value="admin">অ্যাডমিন (Admin)</option>
                    {isSuperAdmin && <option value="super_admin">সুপার অ্যাডমিন (Super Admin)</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ফোন নম্বর</label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={e => setFormPhone(e.target.value)}
                    placeholder="01624541284"
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">স্ট্যাটাস</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 bg-white"
                  >
                    <option value="active">সক্রিয় (Active)</option>
                    <option value="suspended">স্থগিত (Suspended)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">পদবী ও বায়ো</label>
                <input
                  type="text"
                  value={formBio}
                  onChange={e => setFormBio(e.target.value)}
                  placeholder="যেমন: বিশ্বম্ভরপুর উপজেলা প্রতিনিধি"
                  className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Granular Permissions Section */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <Shield className="w-3.5 h-3.5 text-red-600" />
                  <span>অনুমতি ও এক্সেস নিয়ন্ত্রণ (Permissions)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.createNews}
                      onChange={e => setPermissions({ ...permissions, createNews: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>সংবাদ রচনা (Create News)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.publishNews}
                      onChange={e => setPermissions({ ...permissions, publishNews: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span className="font-semibold text-emerald-700">সরাসরি প্রকাশ (Direct Publish)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.editOwnNews}
                      onChange={e => setPermissions({ ...permissions, editOwnNews: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>নিজস্ব সংবাদ সম্পাদনা</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.deleteOwnNews}
                      onChange={e => setPermissions({ ...permissions, deleteOwnNews: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>নিজস্ব সংবাদ ডিলিট</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.uploadImage}
                      onChange={e => setPermissions({ ...permissions, uploadImage: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>ছবি আপলোড (Upload Photos)</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={permissions.submitForReview}
                      onChange={e => setPermissions({ ...permissions, submitForReview: e.target.checked })}
                      className="w-4 h-4 text-red-600 rounded"
                    />
                    <span>রিভিউতে জমা দিন</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
