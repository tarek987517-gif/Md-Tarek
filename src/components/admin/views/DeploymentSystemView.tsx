import React, { useState, useEffect } from 'react';
import {
  Rocket,
  History,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Terminal,
  Server,
  ShieldCheck,
  RefreshCw,
  GitBranch,
  Cpu
} from 'lucide-react';
import { DeploymentRecord, User } from '../../../types';
import { api } from '../../../lib/api';

interface DeploymentSystemViewProps {
  currentUser: User;
}

export const DeploymentSystemView: React.FC<DeploymentSystemViewProps> = ({ currentUser }) => {
  const [data, setData] = useState<{
    currentVersion: string;
    lastDeployment: string;
    status: string;
    productionUrl: string;
    lastUpdatedBy: string;
    history: DeploymentRecord[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [commitMessage, setCommitMessage] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [rollingBackId, setRollingBackId] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [statusMsg, setStatusMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchDeployments = async () => {
    try {
      setLoading(true);
      const res = await api.getDeployments();
      setData(res);
      if (res.history?.[0]?.logs) {
        setTerminalLogs(res.history[0].logs);
      }
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'ডেপ্লয়মেন্ট ডাটা আনতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeployments();
  }, []);

  const handleTriggerDeploy = async () => {
    try {
      setIsDeploying(true);
      setStatusMsg(null);
      setTerminalLogs([
        `[${new Date().toLocaleTimeString()}] Initializing Netlify Production Build...`,
        `[${new Date().toLocaleTimeString()}] Running 'npm run build' with Vite & Tailwind CSS...`,
        `[${new Date().toLocaleTimeString()}] Optimizing assets and generating Edge bundles...`,
        `[${new Date().toLocaleTimeString()}] Transferring assets to Netlify High-Performance CDN...`
      ]);

      const res = await api.triggerDeployment(commitMessage || 'প্রোডাকশন কন্টেন্ট ও সিস্টেম আপডেট');
      setTerminalLogs(res.deployment.logs || [
        `[${new Date().toLocaleTimeString()}] Deployment completed successfully!`,
        `[${new Date().toLocaleTimeString()}] Live URL: https://haortvhd.netlify.app`
      ]);

      setStatusMsg({ text: `সফলভাবে ডেপ্লয় সম্পন্ন হয়েছে! সংস্করণ: ${res.currentVersion}`, type: 'success' });
      setCommitMessage('');
      await fetchDeployments();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'ডেপ্লয় করতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleRollback = async (id: string, version: string) => {
    if (!window.confirm(`আপনি কি নিশ্চিতভাবে সংস্করণ ${version}-এ রোলব্যাক করতে চান?`)) return;

    try {
      setRollingBackId(id);
      setStatusMsg(null);
      const res = await api.rollbackDeployment(id);
      setStatusMsg({ text: `সফলভাবে সংস্করণ ${res.currentVersion}-এ রোলব্যাক করা হয়েছে!`, type: 'success' });
      await fetchDeployments();
    } catch (err: any) {
      setStatusMsg({ text: err.message || 'রোলব্যাক করতে ব্যর্থ হয়েছে।', type: 'error' });
    } finally {
      setRollingBackId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Notification */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            statusMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Main Status Hero */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-6 border border-slate-700/60 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>প্রোডাকশন লাইভ</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">Netlify Edge Network</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            বর্তমান সংস্করণ: <span className="text-red-400 font-mono">{data?.currentVersion || 'v2.5.0'}</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300">
            সর্বশেষ ডেপ্লয়:{' '}
            <span className="text-white font-medium">
              {data?.lastDeployment ? new Date(data.lastDeployment).toLocaleString('bn-BD') : 'সম্প্রতি'}
            </span>{' '}
            • অপারেটর: <span className="text-white font-medium">{data?.lastUpdatedBy || 'তারেক রহমান'}</span>
          </p>

          <div className="pt-1">
            <a
              href="https://haortvhd.netlify.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium hover:underline"
            >
              <span>লাইভ সাইট ভিজিট করুন: https://haortvhd.netlify.app</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Trigger Deployment Box */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 w-full md:w-80 space-y-3 shrink-0">
          <h4 className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <Rocket className="w-3.5 h-3.5 text-red-400" />
            <span>এক ক্লিকে নতুন ডেপ্লয়</span>
          </h4>

          <input
            type="text"
            value={commitMessage}
            onChange={e => setCommitMessage(e.target.value)}
            placeholder="রিলিজ নোট (যেমন: নতুন সংবাদ প্রকাশ)"
            className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
          />

          <button
            onClick={handleTriggerDeploy}
            disabled={isDeploying}
            className="w-full py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow transition-colors flex items-center justify-center gap-2"
          >
            {isDeploying ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>বিল্ড ও ডেপ্লয় হচ্ছে...</span>
              </>
            ) : (
              <>
                <Rocket className="w-3.5 h-3.5" />
                <span>Netlify-তে ডেপ্লয় করুন</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Terminal & System Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Terminal Simulation (2 Cols) */}
        <div className="lg:col-span-2 bg-slate-950 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col font-mono text-xs">
          <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-red-400" />
              <span className="font-semibold text-slate-300">Netlify Build & Deploy Terminal</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
            </div>
          </div>

          <div className="p-4 space-y-1 text-emerald-400 min-h-[160px] max-h-56 overflow-y-auto custom-scrollbar">
            {terminalLogs.map((log, idx) => (
              <p key={idx} className="leading-relaxed">
                {log}
              </p>
            ))}
          </div>
        </div>

        {/* Security & Infrastructure Info Card (1 Col) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-3 text-xs">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>নিরাপত্তা ও এনভায়রনমেন্ট গাইড</span>
          </h3>

          <p className="text-slate-600 leading-relaxed">
            হাওর টিভি HD-এর আর্কিটেকচার কঠোর নিরাপত্তা মানদণ্ড অনুসরণ করে। কোনো গোপন পাসওয়ার্ড বা Netlify সিক্রেট টোকেন ফ্রন্টএন্ড সোর্সে থাকে না।
          </p>

          <div className="space-y-2 pt-1">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600">পাসওয়ার্ড হ্যাশিং:</span>
              <span className="font-mono font-bold text-slate-800">PBKDF2 (10,000 Iter)</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600">ক্যাশ ইনভ্যালিডেশন:</span>
              <span className="font-mono font-bold text-slate-800">Edge CDN Purge</span>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
              <span className="text-slate-600">ব্যাকএন্ড সার্ভিস:</span>
              <span className="font-mono font-bold text-slate-800">Node / Express</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deployment History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <span>ডেপ্লয়মেন্ট ও ভার্সন রোলব্যাক হিস্ট্রি</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">সংস্করণ</th>
                <th className="py-3 px-4">অপারেটর</th>
                <th className="py-3 px-4">কমিট মেসেজ / বিবরণ</th>
                <th className="py-3 px-4">সময়</th>
                <th className="py-3 px-4 text-center">স্ট্যাটাস</th>
                <th className="py-3 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data?.history?.map(dep => {
                const isCurrent = dep.version === data.currentVersion;
                return (
                  <tr key={dep.id} className={`hover:bg-slate-50/60 ${isCurrent ? 'bg-red-50/20' : ''}`}>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">{dep.version}</span>
                      {isCurrent && (
                        <span className="ml-2 px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[10px] font-semibold">
                          বর্তমান
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-700">{dep.triggeredByName}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">{dep.commitMessage}</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(dep.createdAt).toLocaleString('bn-BD')}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {dep.status === 'published' ? 'পাবলিশ্ড' : dep.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {!isCurrent && (
                        <button
                          onClick={() => handleRollback(dep.id, dep.version)}
                          disabled={rollingBackId === dep.id}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 ml-auto"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>{rollingBackId === dep.id ? 'রোলব্যাক হচ্ছে...' : 'রোলব্যাক'}</span>
                        </button>
                      )}
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
