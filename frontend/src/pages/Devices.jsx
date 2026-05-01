import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Server, Search, Activity, XCircle } from 'lucide-react';
import Card from '../components/Card';
import Table from '../components/Table';
import Loader from '../components/Loader';
import StatusBadge from '../components/StatusBadge';
import { apiService } from '../services/api';

export default function Devices() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const fetchDevices = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getDevices();
      setDevices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar devices:", err);
      setError(err.message || "Não foi possível carregar a lista de dispositivos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDevices();
  }, []);

  const filteredDevices = devices.filter(device => {
    const term = searchTerm.toLowerCase();
    const name = (device.hostname || device.name || '').toLowerCase();
    const ip = (device.ip_address || device.management_ip || '').toLowerCase();
    const vendor = (device.vendor || '').toLowerCase();
    
    return name.includes(term) || ip.includes(term) || vendor.includes(term);
  });

  const columns = [
    {
      header: 'Hostname / Nome',
      accessor: 'name',
      className: 'w-[30%]',
      cellClassName: 'font-medium text-slate-200',
      render: (row) => row.hostname || row.name || 'Desconhecido'
    },
    {
      header: 'Endereço IP',
      accessor: 'ip_address',
      className: 'w-[20%]',
      cellClassName: 'font-mono text-slate-400',
      render: (row) => row.ip_address || row.management_ip || '-'
    },
    {
      header: 'Fabricante',
      accessor: 'vendor',
      className: 'w-[20%]',
      cellClassName: 'text-slate-400',
      render: (row) => row.vendor || '-'
    },
    {
      header: 'Status',
      accessor: 'status',
      className: 'w-[20%]',
      render: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${row.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
          {row.status === 'active' ? 'Ativo' : row.status || 'Offline'}
        </span>
      )
    }
  ];

  if (loading && devices.length === 0) {
    return <Loader text="Carregando dispositivos..." />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-tight">Dispositivos de Rede</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">Gerencie e monitore todos os equipamentos inventariados.</p>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/50 rounded-lg p-4 flex items-center gap-3 animate-in fade-in">
          <XCircle className="w-5 h-5 text-rose-500" />
          <p className="text-rose-200 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Busca */}
      <Card className="p-4">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Buscar por nome, IP ou fabricante..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-noc-bg border border-noc-border text-slate-200 text-sm rounded-lg pl-9 pr-4 py-2.5 outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </Card>

      {/* Lista */}
      <div className="bg-noc-panel border border-noc-border rounded-xl shadow-sm overflow-hidden relative min-h-[300px]">
        {loading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500/20 overflow-hidden z-10">
            <div className="h-full bg-blue-500 w-1/3 animate-[translateX_1s_infinite_ease-in-out] translate-x-[-100%]"></div>
          </div>
        )}
        <Table 
          columns={columns} 
          data={filteredDevices} 
          emptyMessage="Nenhum dispositivo encontrado."
          onRowClick={(row) => navigate(`/devices/${row.id}`)}
        />
      </div>
    </div>
  );
}
