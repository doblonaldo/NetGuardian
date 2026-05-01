import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Activity, Server, Shield, Settings, X, WifiOff } from 'lucide-react';
import { apiService } from '../services/api';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
  { icon: Activity, label: 'Telemetry', to: '/telemetry' },
  { icon: Server, label: 'Devices', to: '/devices' },
  { icon: Shield, label: 'Audits', to: '/audits' },
  { icon: Settings, label: 'Settings', to: '#' },
];

export default function Sidebar({ isOpen, setIsOpen }) {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Verifica periodicamente se a API está online
    const checkStatus = async () => {
      try {
        await apiService.getDevices(); // Ping leve, poderia ser uma rota /health
        setIsOnline(true);
      } catch (error) {
        setIsOnline(false);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={`
        fixed lg:sticky top-0 left-0 z-40
        h-screen w-64 bg-slate-900 border-r border-slate-800 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">NetGuardian</span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-2">Menu</div>
          <ul className="space-y-1.5">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={index}>
                  <NavLink
                    to={item.to}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => `
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600/10 text-blue-400 font-medium shadow-[inset_2px_0_0_0_#3b82f6]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                      }
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : 'text-slate-500'}`} />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700/50 backdrop-blur-sm">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">System Status</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-300">API Gateway</span>
                {isOnline ? (
                  <span className="flex items-center gap-2 text-emerald-400 text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Online
                  </span>
                ) : (
                  <span className="flex items-center gap-2 text-rose-400 text-xs font-medium">
                    <WifiOff className="w-3 h-3" />
                    Offline
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
