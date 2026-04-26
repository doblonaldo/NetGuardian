import React, { useState, useEffect } from 'react';
import { Server, Activity, AlertTriangle, Info as InfoIcon, ArrowLeft, ShieldAlert, Cpu } from 'lucide-react';

export default function DeviceDetails({ deviceId = 1, onBack }) {
  const [device, setDevice] = useState(null);
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!deviceId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
        
        // Fetch Device Details
        const devRes = await fetch(`${baseUrl}/devices/${deviceId}`);
        if (devRes.ok) {
          const devData = await devRes.json();
          setDevice(devData);
        }

        // Fetch Validations for this Device
        const valRes = await fetch(`${baseUrl}/devices/${deviceId}/validations`);
        if (valRes.ok) {
          const valData = await valRes.json();
          setValidations(Array.isArray(valData) ? valData : []);
        }
      } catch (error) {
        console.error("Erro ao buscar dados do device:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [deviceId]);

  // Grouping validations
  const criticals = validations.filter(v => v.severity?.toUpperCase() === 'CRITICAL');
  const warnings = validations.filter(v => v.severity?.toUpperCase() === 'WARNING');
  const infos = validations.filter(v => v.severity?.toUpperCase() === 'INFO');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Activity className="w-8 h-8 animate-spin mb-4 text-blue-500" />
        <p>Carregando detalhes do equipamento...</p>
      </div>
    );
  }

  if (!device && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Server className="w-12 h-12 mb-4 text-slate-600" />
        <p>Equipamento não encontrado.</p>
        {onBack && (
          <button onClick={onBack} className="mt-4 text-blue-500 hover:underline transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header com infos do Device */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors text-sm">
              <ArrowLeft className="w-4 h-4" />
              Voltar para Lista
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">{device.hostname || device.name || 'Unknown Device'}</h1>
              <div className="flex items-center gap-3 mt-1 text-sm text-slate-400">
                <span className="flex items-center gap-1"><Cpu className="w-4 h-4" /> {device.vendor || device.platform || 'N/A'}</span>
                <span>&bull;</span>
                <span className="font-mono bg-slate-800/50 px-2 py-0.5 rounded text-slate-300">{device.ip_address || device.management_ip || 'Sem IP'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          {/* Summary Badges */}
          <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center min-w-[80px]">
            <p className="text-2xl font-bold text-rose-500">{criticals.length}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-500">Críticos</p>
          </div>
          <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center min-w-[80px]">
            <p className="text-2xl font-bold text-amber-500">{warnings.length}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-500">Warnings</p>
          </div>
        </div>
      </div>

      {/* Grid de Validações Separadas */}
      <div className="space-y-6">
        
        {/* Seção Critical - DESTAQUE VISUAL */}
        {criticals.length > 0 && (
          <div className="bg-rose-500/5 border border-rose-500/30 rounded-xl p-5 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-semibold text-rose-500">Problemas Críticos</h2>
              <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">{criticals.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticals.map((val, i) => (
                <div key={i} className="bg-slate-900/80 border border-rose-500/40 p-4 rounded-lg hover:border-rose-500/60 transition-colors flex gap-3">
                  <div className="mt-0.5"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></div></div>
                  <div>
                    <p className="text-slate-200 text-sm font-semibold">{val.rule_type || val.type || val.category || 'Alerta Crítico'}</p>
                    <p className="text-slate-400 text-sm mt-1.5 leading-relaxed">{val.message || val.description || val.rule_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção Warning */}
        {warnings.length > 0 && (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-amber-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-amber-500">Avisos (Warnings)</h2>
              <span className="ml-auto bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded-full">{warnings.length}</span>
            </div>
            <div className="space-y-3">
              {warnings.map((val, i) => (
                <div key={i} className="bg-slate-900/30 border border-amber-500/20 p-3 rounded-lg flex items-start gap-3">
                   <div className="mt-1.5"><div className="w-2 h-2 rounded-full bg-amber-500"></div></div>
                   <div>
                     <p className="text-slate-300 text-sm font-medium">{val.rule_type || val.type || val.category || 'Aviso'}</p>
                     <p className="text-slate-400 text-xs mt-0.5">{val.message || val.description || val.rule_name}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção Info */}
        {infos.length > 0 && (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-blue-500/20 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <InfoIcon className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold text-blue-500">Informações</h2>
              <span className="ml-auto bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-full">{infos.length}</span>
            </div>
            <div className="space-y-3">
              {infos.map((val, i) => (
                <div key={i} className="bg-slate-900/30 border border-slate-700/50 p-3 rounded-lg flex items-start gap-3">
                   <div className="mt-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div></div>
                   <div>
                     <p className="text-slate-400 text-sm">{val.message || val.description || val.rule_name}</p>
                   </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {validations.length === 0 && (
          <div className="bg-slate-800/40 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-8 h-8 text-emerald-500" />
            </div>
            <h3 className="text-xl font-medium text-emerald-400 mb-2">Equipamento Saudável</h3>
            <p className="text-slate-400">Nenhum problema de configuração ou auditoria detectado neste device.</p>
          </div>
        )}
      </div>
    </div>
  );
}
