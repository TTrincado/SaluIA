import { useEffect, useState } from "react";
import { apiClient } from "../modules/api";

export default function ConsultTable() {
  const [clinicalAttentions, setClinicalAttentions] = useState([]);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Session State
  const [userRole, setUserRole] = useState(null);
  const [userFullName, setUserFullName] = useState("");

  // --- FILTERS STATE ---
  const [filters, setFilters] = useState({
    patient: "", // Name or RUT
    doctor: "", // Dynamic doctor search
    status: "all", // "all", "pending", "approved/applies", "rejected/not_applies"
  });

  useEffect(() => {
    try {
      const sessionStr = localStorage.getItem("saluia.session");
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        const meta = session.user?.user_metadata;

        if (meta) {
          const role = meta.role;
          const fullName = `${meta.first_name || ""} ${
            meta.last_name || ""
          }`.trim();

          setUserRole(role);
          setUserFullName(fullName);
        }
      }
    } catch (e) {
      console.error("Error leyendo sesión:", e);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.getClinicalAttentions({
          page: currentPage,
          page_size: pageSize,
        });

        if (response.success && response.data) {
          setClinicalAttentions(response.data.results);
          setTotal(response.data.total);
        } else {
          setError(response.error || "Error al cargar los datos");
        }
      } catch (err) {
        setError("Error al cargar los datos");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, pageSize]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const normalize = (text) => (text ? text.toLowerCase().trim() : "");

  const filteredData = clinicalAttentions.filter((item) => {
    if (userRole && userRole !== "admin") {
      const myNameNormalized = normalize(userFullName);
      
      if (userRole === "resident") {
        const residentName = `${item.resident_doctor?.first_name || ""} ${item.resident_doctor?.last_name || ""}`;
        if (normalize(residentName) !== myNameNormalized) return false;
      }
      
      if (userRole === "supervisor") {
        const supervisorName = `${item.supervisor_doctor?.first_name || ""} ${item.supervisor_doctor?.last_name || ""}`;
        if (normalize(supervisorName) !== myNameNormalized) return false;
      }
    }

    if (filters.patient) {
      const search = normalize(filters.patient);
      const pName = normalize(`${item.patient.first_name} ${item.patient.last_name}`);
      const pRut = normalize(item.patient.rut);
      if (!pName.includes(search) && !pRut.includes(search)) {
        return false;
      }
    }

    if (filters.doctor) {
      const search = normalize(filters.doctor);
      
      if (userRole === "resident") {
        const supName = normalize(`${item.supervisor_doctor?.first_name} ${item.supervisor_doctor?.last_name}`);
        if (!supName.includes(search)) return false;
      
      } else if (userRole === "supervisor") {
        const resName = normalize(`${item.resident_doctor?.first_name} ${item.resident_doctor?.last_name}`);
        if (!resName.includes(search)) return false;
      
      } else if (userRole === "admin") {
        const resName = normalize(`${item.resident_doctor?.first_name} ${item.resident_doctor?.last_name}`);
        const supName = normalize(`${item.supervisor_doctor?.first_name} ${item.supervisor_doctor?.last_name}`);
        
        if (!resName.includes(search) && !supName.includes(search)) return false;
      }
    }

    if (filters.status !== "all") {
      if (userRole === "resident") {
        if (filters.status === "pending" && item.medic_approved !== null) return false;
        if (filters.status === "approved" && item.medic_approved !== true) return false;
        if (filters.status === "rejected" && item.medic_approved !== false) return false;
      } else {
        if (filters.status === "pending" && item.applies_urgency_law !== null) return false;
        if (filters.status === "approved" && item.applies_urgency_law !== true) return false;
        if (filters.status === "rejected" && item.applies_urgency_law !== false) return false;
      }
    }

    return true;
  });

  const totalPages = Math.ceil(total / pageSize);
  const startRecord = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, total);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1);
  };

  if (loading && clinicalAttentions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-health-text-muted">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  let doctorFilterLabel = "Buscar Médico";
  if (userRole === "resident") doctorFilterLabel = "Buscar Supervisor";
  else if (userRole === "supervisor") doctorFilterLabel = "Buscar Residente";
  else if (userRole === "admin") doctorFilterLabel = "Buscar Médico (Res. o Sup.)";

  return (
    <div className="space-y-6">
      
      {/* --- FILTER BAR --- */}
      <div className="bg-white p-4 rounded-2xl border border-health-border shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Patient Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-health-text-muted font-medium">Paciente (Nombre o RUT)</label>
          <input 
            type="text" 
            placeholder="Ej: Juan Pérez o 12.345..."
            value={filters.patient}
            onChange={(e) => setFilters(prev => ({ ...prev, patient: e.target.value }))}
            className="border border-health-border rounded-lg px-3 py-2 text-sm text-health-text outline-none focus:ring-1 focus:ring-health-accent"
          />
        </div>

        {/* Doctor Filter (Dynamic) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-health-text-muted font-medium">{doctorFilterLabel}</label>
          <input 
            type="text" 
            placeholder="Nombre del médico..."
            value={filters.doctor}
            onChange={(e) => setFilters(prev => ({ ...prev, doctor: e.target.value }))}
            className="border border-health-border rounded-lg px-3 py-2 text-sm text-health-text outline-none focus:ring-1 focus:ring-health-accent"
          />
        </div>

        {/* Status Filter (Dynamic) */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-health-text-muted font-medium">
             {userRole === "resident" ? "Estado Validación" : "Estado Ley Urgencia"}
          </label>
          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="border border-health-border rounded-lg px-3 py-2 text-sm text-health-text outline-none focus:ring-1 focus:ring-health-accent bg-white"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendiente</option>
            {userRole === "resident" ? (
              <>
                <option value="approved">Validado (Aprobado)</option>
                <option value="rejected">Objetado / Rechazado</option>
              </>
            ) : (
              <>
                {/* Admin ve las opciones de Supervisor (Ley de Urgencia) */}
                <option value="approved">Aplica Ley Urgencia</option>
                <option value="rejected">No Aplica</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div className="overflow-x-auto rounded-2xl border border-health-border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="[&>th]:px-4 [&>th]:py-3 text-left text-health-text [&>th]:whitespace-nowrap">
              <th>Fecha</th>
              <th># Episodio</th>
              <th>Nombre Paciente</th>
              <th>RUT</th>
              <th>Ley Urgencia</th>
              <th>Análisis IA</th>
              <th>Validación Médico</th>
              <th>Validación Supervisor</th>

              {userRole !== "resident" && <th>Médico Residente</th>}

              {userRole !== "supervisor" && <th>Supervisor</th>}

              <th></th>
            </tr>
          </thead>

          <tbody className="divide-y divide-health-border bg-white">
            {filteredData.map((r) => {
              const isPendingUrgencyLaw =
                r.ai_result !== true && r.ai_result !== false;
              const doesUrgencyLawApply =
                (r.ai_result === true && r.medic_approved === false) ||
                (r.ai_result === false && r.medic_approved === true);

              return (
                <tr key={r.id} className="hover:bg-gray-50 text-health-text">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {formatDate(r.created_at)}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis">
                    {r.id_episodio ? r.id_episodio : "-"}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.patient.first_name} {r.patient.last_name}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    {r.patient.rut}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${
                        isPendingUrgencyLaw
                          ? "bg-gray-100 text-gray-600"
                          : doesUrgencyLawApply
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {isPendingUrgencyLaw
                        ? "Pendiente"
                        : doesUrgencyLawApply
                        ? "Aplica"
                        : "No aplica"}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${
                        r.applies_urgency_law === true
                          ? "bg-green-100 text-green-700"
                          : r.applies_urgency_law === false
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.applies_urgency_law === true
                        ? "Aplica"
                        : r.applies_urgency_law === false
                        ? "No aplica"
                        : "Pendiente"}
                    </span>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    Por implementar
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`rounded-md px-2 py-1 text-xs ${
                        r.ai_result && r.medic_approved === false
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {r.ai_result && r.medic_approved === false
                        ? "Objetado"
                        : "-"}
                    </span>
                  </td>

                  {userRole !== "resident" && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.resident_doctor.first_name}{" "}
                      {r.resident_doctor.last_name}
                    </td>
                  )}

                  {userRole !== "supervisor" && (
                    <td className="px-4 py-3 whitespace-nowrap">
                      {r.supervisor_doctor.first_name}{" "}
                      {r.supervisor_doctor.last_name}
                    </td>
                  )}

                  <td className="px-4 py-3 whitespace-nowrap">
                    <a
                      href={`/clinical_attentions/details/${r.id}`}
                      className="text-health-accent hover:underline"
                    >
                      Ver más
                    </a>
                  </td>
                </tr>
              );
            })}

            {filteredData.length === 0 && (
              <tr>
                <td
                  colSpan={userRole === "admin" ? 11 : 10}
                  className="px-4 py-6 text-health-text-muted text-center"
                >
                   {clinicalAttentions.length > 0
                    ? "No se encontraron resultados con estos filtros."
                    : "No hay registros disponibles."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-health-text-muted">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <span>Registros por página:</span>
            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              className="rounded-lg bg-white border border-health-border px-3 py-1 outline-none focus:ring-2 focus:ring-health-accent text-health-text"
            >
              <option value={2}>2</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

          <p className="text-xs">
            Mostrando {startRecord}-{endRecord} de {total} registros
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs">
            Página {currentPage} de {totalPages || 1}
          </span>

          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg bg-white border border-health-border hover:bg-gray-50 disabled:opacity-50 transition text-health-text"
          >
            Anterior
          </button>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 rounded-lg bg-white border border-health-border hover:bg-gray-50 disabled:opacity-50 transition text-health-text"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}