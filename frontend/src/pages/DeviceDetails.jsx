import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Server, Activity, AlertTriangle, Info as InfoIcon, ArrowLeft, ShieldAlert, Cpu, Play, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Card from '../components/Card';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import { apiService } from '../services/api';

export default function DeviceDetails({ deviceId: propDeviceId, onBack }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const deviceId = propDeviceId || id || 1;
  
  const [device, setDevice] = useState(null);
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectFeedback, setCollectFeedback] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch Device Details
      const devData = await apiService.getDeviceById(deviceId);
      setDevice(devData);

      // Fetch Validations for this Device
      const valData = await apiService.getDeviceValidations(deviceId);
      setValidations(Array.isArray(valData) ? valData : []);
    } catch (err) {
      console.error("Erro ao buscar dados do device:", err);
      setError(err.message || 'Erro ao carregar os dados do equipamento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!deviceId) return;
    fetchData();
  }, [deviceId]);

  const handleCollect = async () => {
    if (!deviceId || isCollecting) return;
    setIsCollecting(true);
    setCollectFeedback('');
    try {
      await apiService.collectDevice(deviceId);
      setCollectFeedback('Coleta iniciada com sucesso');
      setTimeout(() => setCollectFeedback(''), 5000);
    } catch (error) {
      console.error("Erro ao iniciar coleta:", error);
      setCollectFeedback('Erro ao iniciar coleta');
      setTimeout(() => setCollectFeedback(''), 5000);
    } finally {
      setIsCollecting(false);
    }
  };

  // Grouping validations with useMemo for performance optimization
  const { criticals, warnings, infos } = useMemo(() => {
    return {
      criticals: validations.filter(v => v.severity?.toUpperCase() === 'CRITICAL'),
      warnings: validations.filter(v => v.severity?.toUpperCase() === 'WARNING'),
      infos: validations.filter(v => v.severity?.toUpperCase() === 'INFO')
    };
  }, [validations]);

  if (loading && !device) {
    return <Loader text="Carregando detalhes do equipamento..." />;
  }

  if (error && !device) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500 animate-in fade-in">
        <XCircle className="w-12 h-12 mb-4 text-rose-500" />
        <p className="text-rose-400 font-medium">{error}</p>
        <button onClick={fetchData} className="mt-4 bg-noc-panel border border-noc-border hover:bg-noc-border text-slate-300 px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Tentar Novamente
        </button>
        <button onClick={onBack || (() => navigate(-1))} className="mt-4 text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </div>
    );
  }

  if (!device && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <Server className="w-12 h-12 mb-4 text-slate-600" />
        <p>Equipamento não encontrado.</p>
        <button onClick={onBack || (() => navigate(-1))} className="mt-4 text-blue-500 hover:text-blue-400 transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      {/* Header com infos do Device */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div className="w-full sm:w-auto">
          <button onClick={onBack || (() => navigate(-1))} className="flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors text-sm">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </button>
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
              <Server className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight truncate max-w-[200px] sm:max-w-md">{device.hostname || device.name || 'Unknown Device'}</h1>
                <button 
                  onClick={handleCollect}
                  disabled={isCollecting}
                  className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-3 py-1.5 rounded-md text-xs font-semibold transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                >
                  {isCollecting ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {isCollecting ? 'Coletando...' : 'Atualizar'}
                </button>
                {collectFeedback && (
                  <span className={`text-xs flex items-center gap-1 animate-in fade-in ${collectFeedback.includes('Erro') ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {collectFeedback.includes('Erro') ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {collectFeedback}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mt-1.5 text-xs sm:text-sm text-slate-400">
                <span className="flex items-center gap-1"><Cpu className="w-4 h-4" /> <span className="truncate max-w-[100px] sm:max-w-none">{device.vendor || device.platform || 'N/A'}</span></span>
                <span className="hidden sm:inline">&bull;</span>
                <span className="font-mono bg-noc-panel border border-noc-border px-2 py-0.5 rounded text-slate-300 truncate max-w-[150px]">{device.ip_address || device.management_ip || 'Sem IP'}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 w-full sm:w-auto justify-start sm:justify-end">
          {/* Summary Badges */}
          <div className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-noc-panel border border-noc-border text-center min-w-[80px]">
            <p className="text-2xl font-bold text-rose-500">{criticals.length}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-500">Críticos</p>
          </div>
          <div className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-noc-panel border border-noc-border text-center min-w-[80px]">
            <p className="text-2xl font-bold text-amber-500">{warnings.length}</p>
            <p className="text-[10px] uppercase font-semibold text-slate-500">Warnings</p>
          </div>
        </div>
      </div>

      {error && device && (
        <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4 flex items-center gap-3 animate-in fade-in">
          <XCircle className="w-5 h-5 text-rose-500" />
          <p className="text-rose-200 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Grid de Validações Separadas */}
      <div className="space-y-6">
        
        {/* Seção Critical - DESTAQUE VISUAL */}
        {criticals.length > 0 && (
          <div className="bg-rose-500/5 border border-rose-500/30 rounded-xl p-4 sm:p-5 shadow-[0_0_15px_rgba(244,63,94,0.05)]">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="w-5 h-5 text-rose-500" />
              <h2 className="text-lg font-semibold text-rose-500">Problemas Críticos</h2>
              <span className="ml-auto bg-rose-500 text-white text-xs font-bold px-2 py-1 rounded-full">{criticals.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {criticals.map((val, i) => (
                <div key={i} className="bg-noc-panel border border-rose-500/40 p-4 rounded-lg hover:border-rose-500/60 transition-colors flex gap-3">
                  <div className="mt-0.5 shrink-0"><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.8)] animate-pulse"></div></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-slate-200 text-sm font-semibold truncate">{val.rule_type || val.type || val.category || 'Alerta Crítico'}</p>
                    <p className="text-slate-400 text-sm mt-1.5 leading-relaxed break-words">{val.message || val.description || val.rule_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Seção Warning */}
        {warnings.length > 0 && (
          <Card title="Avisos (Warnings)" action={<span className="bg-amber-500/20 text-amber-400 text-xs font-bold px-2 py-1 rounded-full">{warnings.length}</span>}>
            <div className="space-y-3">
              {warnings.map((val, i) => (
                <div key={i} className="bg-noc-bg border border-noc-border p-3 rounded-lg flex items-start gap-3">
                   <div className="mt-1.5 shrink-0"><div className="w-2 h-2 rounded-full bg-amber-500"></div></div>
                   <div className="min-w-0 flex-1">
                     <p className="text-slate-300 text-sm font-medium truncate">{val.rule_type || val.type || val.category || 'Aviso'}</p>
                     <p className="text-slate-400 text-xs mt-0.5 break-words">{val.message || val.description || val.rule_name}</p>
                   </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Seção Info */}
        {infos.length > 0 && (
          <Card title="Informações" action={<span className="bg-blue-500/20 text-blue-400 text-xs font-bold px-2 py-1 rounded-full">{infos.length}</span>}>
            <div className="space-y-3">
              {infos.map((val, i) => (
                <div key={i} className="bg-noc-bg border border-noc-border p-3 rounded-lg flex items-start gap-3">
                   <div className="mt-1.5 shrink-0"><div className="w-2 h-2 rounded-full bg-blue-500"></div></div>
                   <div className="min-w-0 flex-1">
                     <p className="text-slate-400 text-sm break-words">{val.message || val.description || val.rule_name}</p>
                   </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {validations.length === 0 && !error && (
          <div className="bg-noc-panel border border-emerald-500/20 rounded-xl p-8 text-center">
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
