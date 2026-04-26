import React, { useState, useEffect } from 'react';
import { RefreshCw, Search, Filter, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export default function Validations() {
  const [validations, setValidations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filterDevice, setFilterDevice] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const fetchValidations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/validations`);
      if (response.ok) {
        const data = await response.json();
        setValidations(Array.isArray(data) ? data : []);
      } else {
        console.error("Erro ao buscar validações");
      }
    } catch (error) {
      console.error("Falha na requisição:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchValidations();
  }, []);

  const getSeverityWeight = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 3;
      case 'WARNING': return 2;
      case 'INFO': return 1;
      default: return 0;
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'WARNING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'INFO': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const filteredAndSortedValidations = validations
    .filter(v => {
      const deviceName = (v.device_name || v.device || v.host || '').toLowerCase();
      const matchesDevice = deviceName.includes(filterDevice.toLowerCase());
      const matchesSeverity = filterSeverity === 'ALL' || (v.severity?.toUpperCase() === filterSeverity);
      return matchesDevice && matchesSeverity;
    })
    .sort((a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity));

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Validações</h1>
          <p className="text-slate-400 text-sm mt-1">Histórico completo de auditorias e alertas da rede.</p>
        </div>
        <button 
          onClick={fetchValidations}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Atualizando...' : 'Atualizar Lista'}
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4 shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por device..." 
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="sm:w-64 relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
          <select 
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700 text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer relative"
          >
            <option value="ALL">Todas Severidades</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Device</th>
                <th scope="col" className="px-6 py-4 font-semibold">Tipo</th>
                <th scope="col" className="px-6 py-4 font-semibold">Severidade</th>
                <th scope="col" className="px-6 py-4 font-semibold">Mensagem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {loading && validations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-3 text-blue-500" />
                    Carregando validações...
                  </td>
                </tr>
              ) : filteredAndSortedValidations.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-3 text-emerald-500/50" />
                    Nenhuma validação encontrada.
                  </td>
                </tr>
              ) : (
                filteredAndSortedValidations.map((val, i) => {
                  const severity = val.severity?.toUpperCase() || 'UNKNOWN';
                  return (
                    <tr key={i} className="hover:bg-slate-700/20 transition-colors group">
                      <td className="px-6 py-4 font-medium text-slate-200 whitespace-nowrap">
                        {val.device_name || val.device || val.host || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-slate-400">
                        {val.rule_type || val.type || val.category || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border ${getSeverityStyles(severity)}`}>
                          {severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 min-w-[300px]">
                        {val.message || val.description || val.rule_name || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
