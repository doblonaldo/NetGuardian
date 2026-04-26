import React from 'react';
import { Activity, Server, AlertTriangle, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const stats = [
  { label: 'Total Devices', value: '1,284', change: '+12', trend: 'up', icon: Server, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  { label: 'Active Audits', value: '12', change: 'Running', trend: 'neutral', icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  { label: 'Critical Alerts', value: '3', change: '-2', trend: 'down', icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
  { label: 'Compliant Nodes', value: '98.5%', change: '+0.2%', trend: 'up', icon: CheckCircle, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
];

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Network Overview</h1>
          <p className="text-slate-400 text-sm mt-1">Real-time status of your infrastructure and recent alerts.</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Run Full Audit
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className={`bg-slate-800/40 backdrop-blur-sm border ${stat.border} p-5 rounded-xl hover:bg-slate-800/60 transition-all group shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1 text-xs font-medium">
                  {stat.trend === 'up' && <ArrowUpRight className="w-3 h-3 text-emerald-400" />}
                  {stat.trend === 'down' && <ArrowDownRight className="w-3 h-3 text-emerald-400" />}
                  <span className={stat.trend === 'up' || stat.trend === 'down' ? 'text-emerald-400' : 'text-slate-400'}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-3xl font-bold text-white tracking-tight">{stat.value}</p>
                <p className="text-sm font-medium text-slate-400 mt-1">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart Area */}
        <div className="lg:col-span-2 bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 min-h-[400px] flex flex-col shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Traffic Telemetry</h3>
            <select className="bg-slate-900 border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 outline-none focus:border-blue-500">
              <option>Last 24 Hours</option>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="flex-1 border border-slate-700/50 rounded-lg bg-slate-900/30 flex items-center justify-center relative overflow-hidden group">
            {/* Abstract Background Chart Elements */}
            <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <path d="M0,100 C20,80 30,90 50,60 C70,30 80,40 100,10 L100,100 Z" fill="url(#gradient)" />
                <path d="M0,100 C20,80 30,90 50,60 C70,30 80,40 100,10" fill="none" stroke="#3b82f6" strokeWidth="1" />
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            
            <div className="text-center z-10">
              <Activity className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-pulse" />
              <p className="text-slate-400 text-sm font-medium">Collecting live metrics...</p>
            </div>
          </div>
        </div>

        {/* Recent Alerts Area */}
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white">Recent Alerts</h3>
            <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View All</a>
          </div>
          <div className="space-y-4">
            {[
              { title: 'BGP Peer Down', host: 'router-core-01.nyc', time: '2 mins ago', severity: 'critical' },
              { title: 'High CPU Usage', host: 'fw-edge-02.lon', time: '15 mins ago', severity: 'warning' },
              { title: 'Config Drift Detected', host: 'sw-access-14.sfo', time: '1 hour ago', severity: 'warning' },
              { title: 'Link Flapping', host: 'router-dist-05.ams', time: '3 hours ago', severity: 'critical' },
            ].map((alert, i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-700/40 transition-colors border border-transparent hover:border-slate-600/50 cursor-pointer">
                <div className="mt-1">
                  <span className={`w-2.5 h-2.5 rounded-full inline-block ${alert.severity === 'critical' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]'}`}></span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">{alert.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{alert.host}</p>
                </div>
                <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">{alert.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
