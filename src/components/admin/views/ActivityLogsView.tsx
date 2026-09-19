import React, { useState, useEffect } from 'react';
import { History, Search, RefreshCw, Filter, Shield, Clock, UserCheck } from 'lucide-react';
import { ActivityLog, User } from '../../../types';
import { api } from '../../../lib/api';
import { toBengaliNumber } from '../../../lib/utils';

interface ActivityLogsViewProps {
  currentUser: User;
}

export const ActivityLogsView: React.FC<ActivityLogsViewProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.getActivityLogs();
      setLogs(res.logs);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    if (selectedRole !== 'ALL' && log.userRole !== selectedRole) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.description.toLowerCase().includes(q) ||
      (log.ip && log.ip.includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <History className="w-5 h-5 text-teal-600" />
            <span>অ্যাক্টিভিটি ও নিরাপত্তা অডিট লগ</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            সিস্টেমে ব্যবহারকারীদের দ্বারা সম্পাদিত সকল কর্মকাণ্ডের অপরিবর্তনীয় অডিট ট্রেইল
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>রিফ্রেশ</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="অপারেটর, অ্যাকশন বা বিবরণ খুঁজুন..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <select
          value={selectedRole}
          onChange={e => setSelectedRole(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white text-slate-700 shrink-0"
        >
          <option value="ALL">সকল ভূমিকা (All Roles)</option>
          <option value="super_admin">সুপার অ্যাডমিন</option>
          <option value="admin">অ্যাডমিন</option>
          <option value="editor">সম্পাদক</option>
          <option value="reporter">রিপোর্টার</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">সময়</th>
                <th className="py-3 px-4">অপারেটর</th>
                <th className="py-3 px-4">ভূমিকা</th>
                <th className="py-3 px-4">অ্যাকশন</th>
                <th className="py-3 px-4">বিস্তারিত তথ্য</th>
                <th className="py-3 px-4 text-right font-mono">আইপি (IP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    কোনো লগ এন্ট্রি পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('bn-BD')}
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{log.userName}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{log.action}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-sm">{log.description}</td>
                    <td className="py-3 px-4 text-right font-mono text-slate-400 text-[11px]">{log.ip || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
