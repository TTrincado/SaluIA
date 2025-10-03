import { useEffect, useState } from "react";

export default function ConsultTable() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentLimit, setCurrentLimit] = useState(10);

  const getUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const page = parseInt(urlParams.get('page')) || 1;
    const limit = parseInt(urlParams.get('limit')) || 10;
    return { page, limit };
  };

  const buildUrl = (page, limit = currentLimit) => {
    const baseUrl = window.location.pathname;
    return `${baseUrl}?page=${page}&limit=${limit}`;
  };

  const fetchPatients = async (page, limit) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3000/patients?page=${page}&limit=${limit}`);
      await new Promise(resolve => setTimeout(resolve, 500));

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.data) {
        setPatients(data.data);
        setTotalPages(data.meta?.totalPages || 1);
        setTotalRecords(data.meta?.totalItems || data.data.length);
        setCurrentPage(data.meta?.currentPage || page);
        setCurrentLimit(data.meta?.itemsPerPage || limit);
      }
    } catch (err) {
      setError(err.message);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { page, limit } = getUrlParams();
    fetchPatients(page, limit);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const { page, limit } = getUrlParams();
      fetchPatients(page, limit);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (loading) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-2 border-health-accent border-t-transparent rounded-full mx-auto"></div>
        <p className="text-white/70">Cargando pacientes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-4">
          <p className="text-red-400">Error al cargar los datos: {error}</p>
          <a
            href={buildUrl(currentPage, currentLimit)}
            className="mt-2 inline-block px-3 py-1 bg-red-500/20 hover:bg-red-500/30 rounded text-red-400 text-sm"
          >
            Reintentar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/30">
            <tr className="[&>th]:px-4 [&>th]:py-3 text-left text-white/80">
              <th>Nombre</th>
              <th>Rut</th>
              <th>Mail</th>
              <th>Edad</th>
              <th>Urgencia</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {patients.length > 0 ? (
              patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-white/5">
                  <td className="px-4 py-3">{patient.name}</td>
                  <td className="px-4 py-3">{patient.rut}</td>
                  <td className="px-4 py-3">{patient.email}</td>
                  <td className="px-4 py-3">{patient.age}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${patient.urgent
                        ? "bg-health-ok/20 text-health-ok"
                        : "bg-white/10 text-white/70"
                        }`}
                    >
                      {patient.urgent ? "Sí" : "No"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={`/patients/details?patientId=${encodeURIComponent(patient.id)}`}
                      className="text-health-accent hover:underline"
                    >
                      Ver más
                    </a>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-4 py-6 text-white/60" colSpan={6}>
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-white/50">
          Mostrando {Math.min((currentPage - 1) * currentLimit + 1, totalRecords)} - {Math.min(currentPage * currentLimit, totalRecords)} de {totalRecords} registros
        </p>

        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            <a
              href={currentPage > 1 ? buildUrl(currentPage - 1) : '#'}
              className={`px-3 py-1 text-xs rounded ${currentPage === 1
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              onClick={currentPage === 1 ? (e) => e.preventDefault() : undefined}
            >
              Anterior
            </a>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <a
                    key={pageNum}
                    href={buildUrl(pageNum)}
                    className={`px-2 py-1 text-xs rounded ${pageNum === currentPage
                      ? "bg-health-accent text-white"
                      : "bg-white/10 hover:bg-white/20 text-white"
                      }`}
                  >
                    {pageNum}
                  </a>
                );
              })}
            </div>

            <a
              href={currentPage < totalPages ? buildUrl(currentPage + 1) : '#'}
              className={`px-3 py-1 text-xs rounded ${currentPage === totalPages
                ? "bg-white/5 text-white/30 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              onClick={currentPage === totalPages ? (e) => e.preventDefault() : undefined}
            >
              Siguiente
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
