import { useCallback, useEffect, useState } from "react";

/**
 * @param {Function} fetchCallback - Función asíncrona que retorna { data, total }
 * @param {Object} initialParams - Configuración inicial opcional
 */
export function useTableData(
  fetchCallback,
  initialParams = { page: 1, pageSize: 10 },
) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado de paginación
  const [pagination, setPagination] = useState(initialParams);

  // Memoizamos la llamada para que useEffect no entre en loop infinito
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Le pasamos el estado actual de paginación a la función de fetch
      const response = await fetchCallback(pagination);

      if (response.success) {
        setData(response.data.results);
        setTotal(response.data.total);
      } else {
        setError(response.error || "Error desconocido");
      }
    } catch (err) {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }, [fetchCallback, pagination.page, pagination.pageSize]);

  // Efecto: Cuando cambia la paginación, recargamos
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers para la UI
  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handlePageSizeChange = (newPageSize) => {
    setPagination((prev) => ({ ...prev, pageSize: newPageSize, page: 1 }));
  };

  return {
    data,
    total,
    loading,
    error,
    pagination: {
      currentPage: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
      onPageChange: handlePageChange,
      onPageSizeChange: handlePageSizeChange,
    },
    refresh: fetchData, // Por si quieres un botón de "Recargar tabla"
  };
}
