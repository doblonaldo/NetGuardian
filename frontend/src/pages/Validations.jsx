import React, { useState, useCallback, useMemo } from 'react';
import { RefreshCw, Search, Filter, Clock, AlertTriangle, XCircle } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import StatusBadge from '../components/StatusBadge';
import Loader from '../components/Loader';
import useAutoRefresh from '../hooks/useAutoRefresh';
import { apiService } from '../services/api';

export default function Validations() {
  const [validations, setValidations] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  
  const [filterDevice, setFilterDevice] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('ALL');

  const fetchValidations = useCallback(async () => {
    try {
      const data = await apiService.getValidations();
      setValidations(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Falha na requisição:", error);
      throw error;
    } finally {
      setInitialLoading(false);
    }
  }, []);

  const { secondsAgo, isFetching, error, manualRefresh } = useAutoRefresh(fetchValidations, 30000);

  const filteredAndSortedValidations = useMemo(() => {
    const getSeverityWeight = (severity) => {
      switch (severity?.toUpperCase()) {
        case 'CRITICAL': return 3;
        case 'WARNING': return 2;
        case 'INFO': return 1;
        default: return 0;
      }
    };

    return validations
      .filter(v => {
        const deviceName = (v.device_name || v.device || v.host || '').toLowerCase();
        const matchesDevice = deviceName.includes(filterDevice.toLowerCase());
        const matchesSeverity = filterSeverity === 'ALL' || (v.severity?.toUpperCase() === filterSeverity);
        return matchesDevice && matchesSeverity;
      })
      .sort((a, b) => getSeverityWeight(b.severity) - getSeverityWeight(a.severity));
  }, [validations, filterDevice, filterSeverity]);

  const criticalAlertsCount = useMemo(() => {
    return validations.filter(v => v.severity?.toUpperCase() === 'CRITICAL').length;
  }, [validations]);

  const columns = [
    {
      header: 'Device',
      accessor: 'device',
      className: 'w-[20%]',
      cellClassName: 'font-medium text-slate-200 whitespace-nowrap',
      render: (row) => row.device_name || row.device || row.host || '-'
    },
    {
      header: 'Tipo',
      accessor: 'type',
      className: 'w-[15%]',
      cellClassName: 'text-slate-400 whitespace-nowrap',
      render: (row) => row.rule_type || row.type || row.category || '-'
    },
    {
      header: 'Severidade',
      accessor: 'severity',
      className: 'w-[15%]',
      cellClassName: 'whitespace-nowrap',
      render: (row) => <StatusBadge status={row.severity} />
    },
    {
      header: 'Mensagem',
      accessor: 'message',
      className: 'w-[50%]',
      cellClassName: 'text-slate-400 min-w-[300px]',
      render: (row) => row.message || row.description || row.rule_name || '-'
    }
  ];

  if (initialLoading) {
    return <Loader text="Carregando validações..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Validações</h1>
            {criticalAlertsCount > 0 && (
              <span className="bg-rose-500/20 text-rose-500 border border-rose-500/50 px-2.5 py-0.5 rounded-full text-xs font-bold animate-pulse flex items-center gap-1 shadow-[0_0_12px_rgba(244,63,94,0.3)]">
                <AlertTriangle className="w-3 h-3" /> {criticalAlertsCount} CRÍTICOS
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-1">Histórico completo de auditorias e alertas da rede.</p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button 
            onClick={manualRefresh}
            disabled={isFetching}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Atualizando...' : 'Atualizar Lista'}
          </button>
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Atualizado há {secondsAgo}s
          </span>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4 flex items-center gap-3 animate-in fade-in">
          <XCircle className="w-5 h-5 text-rose-500" />
          <p className="text-rose-200 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Filters Section */}
      <Card className="flex flex-col sm:flex-row gap-4 p-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por device..." 
            value={filterDevice}
            onChange={(e) => setFilterDevice(e.target.value)}
            className="w-full bg-noc-bg border border-noc-border text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        <div className="sm:w-64 relative">
          <Filter className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 z-10" />
          <select 
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="w-full bg-noc-bg border border-noc-border text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer relative"
          >
            <option value="ALL">Todas Severidades</option>
            <option value="CRITICAL">Critical</option>
            <option value="WARNING">Warning</option>
            <option value="INFO">Info</option>
          </select>
        </div>
      </Card>

      {/* Table Section */}
      <div className="bg-noc-panel border border-noc-border rounded-xl shadow-sm overflow-hidden relative min-h-[200px]">
        {isFetching && validations.length > 0 && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20 overflow-hidden z-10">
            <div className="h-full bg-blue-500 w-1/3 animate-[translateX_1s_infinite_ease-in-out] translate-x-[-100%]"></div>
          </div>
        )}
        {isFetching && validations.length === 0 ? (
          <Loader text="Carregando validações..." />
        ) : error && validations.length === 0 ? (
          <div className="p-12 text-center text-slate-500">Não foi possível carregar os dados. Tente atualizar a página.</div>
        ) : (
          <Table 
            columns={columns} 
            data={filteredAndSortedValidations} 
            emptyMessage="Nenhuma validação encontrada para os filtros atuais."
            rowClassName={(row) => row.severity?.toUpperCase() === 'CRITICAL' ? 'bg-rose-500/10 border-l border-rose-500/50 hover:bg-rose-500/20 shadow-[inset_0_0_20px_rgba(244,63,94,0.05)]' : ''}
          />
        )}
      </div>
    </div>
  );
}
