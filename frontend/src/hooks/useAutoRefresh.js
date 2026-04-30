import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook para atualização automática e controle de tempo desde a última atualização.
 * Evita múltiplas requisições simultâneas.
 * 
 * @param {Function} fetchFn Função assíncrona que busca os dados
 * @param {number} intervalMs Intervalo em milissegundos (default: 30s)
 */
export default function useAutoRefresh(fetchFn, intervalMs = 30000) {
  const [lastUpdated, setLastUpdated] = useState(null);
  const [secondsAgo, setSecondsAgo] = useState(0);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState(null);
  
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef(null);
  const isMounted = useRef(true);

  const executeFetch = useCallback(async () => {
    if (isFetchingRef.current) return;
    
    isFetchingRef.current = true;
    setIsFetching(true);
    setError(null);
    
    try {
      await fetchFn();
      if (isMounted.current) {
        setLastUpdated(new Date());
        setSecondsAgo(0);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err.message || "Erro de comunicação com a API");
        console.error("Erro na atualização automática:", err);
      }
    } finally {
      if (isMounted.current) {
        isFetchingRef.current = false;
        setIsFetching(false);
        // Agenda a próxima execução apenas APÓS a atual terminar
        if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = setTimeout(executeFetch, intervalMs);
      }
    }
  }, [fetchFn, intervalMs]);

  useEffect(() => {
    isMounted.current = true;
    
    // Inicia a primeira busca
    executeFetch();

    // Timer para incrementar os segundos
    const timerInterval = setInterval(() => {
      setSecondsAgo(prev => prev + 1);
    }, 1000);

    return () => {
      isMounted.current = false;
      if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
      clearInterval(timerInterval);
    };
  }, [executeFetch]);

  const manualRefresh = () => {
    if (fetchTimeoutRef.current) clearTimeout(fetchTimeoutRef.current);
    executeFetch();
  };

  return { lastUpdated, secondsAgo, isFetching, error, manualRefresh };
}
