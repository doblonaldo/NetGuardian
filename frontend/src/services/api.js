import axios from 'axios';

// Instância base do axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para tratar erros globalmente
api.interceptors.response.use(
  (response) => response.data, // Retornamos direto os dados para simplificar o consumo
  (error) => {
    // Tratamento de erro de forma centralizada
    console.error("API Error:", error.response?.data || error.message);
    
    // Formatar a mensagem de erro para que os componentes a utilizem facilmente
    const customError = new Error(
      error.response?.data?.detail || error.message || 'Ocorreu um erro na comunicação com o backend.'
    );
    customError.status = error.response?.status;
    customError.data = error.response?.data;
    
    return Promise.reject(customError);
  }
);

export const apiService = {
  /**
   * Retorna a lista de todos os dispositivos.
   */
  getDevices: async () => {
    return await api.get('/devices/');
  },

  /**
   * Retorna todas as validações ativas (ou histórico) no sistema.
   * Transforma a resposta agrupada do backend em uma lista flat para o dashboard.
   */
  getValidations: async () => {
    const data = await api.get('/validations/');
    // Flatten the grouped response: [{device: '...', critical: [], ...}] -> [{...alert, device_name: '...'}]
    if (Array.isArray(data)) {
      return data.flatMap(group => {
        const deviceName = group.device;
        const allAlerts = [
          ...(group.critical || []),
          ...(group.warning || []),
          ...(group.info || [])
        ];
        return allAlerts.map(alert => ({
          ...alert,
          device_name: deviceName
        }));
      });
    }
    return [];
  },

  /**
   * Retorna os detalhes de um dispositivo específico.
   * @param {string|number} id - O ID do dispositivo
   */
  getDeviceById: async (id) => {
    return await api.get(`/devices/${id}`);
  },

  /**
   * Dispara o job de coleta/auditoria manual para um dispositivo.
   * @param {string|number} id - O ID do dispositivo
   */
  collectDevice: async (id) => {
    return await api.post(`/devices/${id}/collect`);
  },

  /**
   * Retorna as validações relativas a um dispositivo específico (Extra Helper).
   */
  getDeviceValidations: async (id) => {
    const group = await api.get(`/devices/${id}/validations`);
    // Flatten grouped object: {device: '...', critical: [], ...} -> [{...alert}]
    if (group && typeof group === 'object') {
      return [
        ...(group.critical || []),
        ...(group.warning || []),
        ...(group.info || [])
      ];
    }
    return [];
  }
};

export default apiService;
