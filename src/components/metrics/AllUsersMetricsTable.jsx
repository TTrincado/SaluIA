import React, { useEffect, useState } from "react";
import { apiClient } from "../../modules/api";

export default function AllUsersMetricsTable() {
  const [allMetrics, setAllMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });

  // Date filters
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const resp = await apiClient.getAllUsersMetrics(startDate, endDate);
      if (resp.success && resp.data) {
        setAllMetrics(resp.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [startDate, endDate]);

  // Sort Logic
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedMetrics = React.useMemo(() => {
    let filtered = [...allMetrics];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((user) =>
        user.name.toLowerCase().includes(query)
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return 0;
    });

    return filtered;
  }, [allMetrics, searchQuery, sortConfig]);

  const renderSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey)
      return <span className="text-gray-300">⇅</span>;
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div className="space-y-6">
      {/* Controles: Buscador y Fecha */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-2xl border border-health-border shadow-sm">
        <input
          type="text"
          placeholder="Buscar médico..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-white border border-health-border rounded-lg p-2 text-health-text outline-none focus:ring-2 focus:ring-health-accent"
        />

        <div className="flex gap-2">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="bg-white border border-health-border rounded-lg p-2 text-health-text"
          />
          <span className="self-center text-gray-400">a</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="bg-white border border-health-border rounded-lg p-2 text-health-text"
          />
          <button
            onClick={fetchMetrics}
            className="px-4 py-2 bg-health-accent text-white rounded-lg hover:bg-health-accent-dark transition"
          >
            Filtrar
          </button>
        </div>
      </div>

      {/* Tabla (Light Mode Fix) */}
      <div className="bg-white border border-health-border rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-health-text-muted font-semibold border-b border-health-border">
              <tr>
                <th
                  className="px-4 py-3 cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center gap-1">
                    Médico {renderSortIcon("name")}
                  </div>
                </th>

                {/* 1. # Episodios subidos */}
                <th
                  className="px-4 py-3 text-center cursor-pointer"
                  onClick={() => handleSort("total_episodes")}
                  title="Total de episodios clínicos registrados por el usuario"
                >
                  <div className="flex flex-col items-center">
                    <span># Ep.</span>
                    <span>Subidos</span>
                    {renderSortIcon("total_episodes")}
                  </div>
                </th>

                {/* 2. # Ley Urgencia (IA o Médico SI) */}
                <th
                  className="px-4 py-3 text-center cursor-pointer"
                  onClick={() => handleSort("total_urgency_law")}
                  title="Cantidad de episodios donde finalmente se aplicó Ley de Urgencia (IA acertó o Médico corrigió)"
                >
                  <div className="flex flex-col items-center">
                    <span># Ley</span>
                    <span>Urgencia</span>
                    {renderSortIcon("total_urgency_law")}
                  </div>
                </th>

                {/* 3. % Rechazo Ley Urgencia */}
                <th
                  className="px-4 py-3 text-center cursor-pointer"
                  onClick={() => handleSort("percent_urgency_law_rejected")}
                  title="Porcentaje de rechazo por aseguradora sobre el total de Ley de Urgencia"
                >
                  <div className="flex flex-col items-center">
                    <span>% Rechazo</span>
                    <span>(General)</span>
                    {renderSortIcon("percent_urgency_law_rejected")}
                  </div>
                </th>

                {/* 4. # IA SI */}
                <th
                  className="px-4 py-3 text-center cursor-pointer"
                  onClick={() => handleSort("total_ai_yes")}
                  title="Cantidad de episodios donde la IA sugirió Ley de Urgencia"
                >
                  <div className="flex flex-col items-center">
                    <span># IA</span>
                    <span>Sí</span>
                    {renderSortIcon("total_ai_yes")}
                  </div>
                </th>

                {/* 5. % Rechazo IA SI */}
                <th
                  className="px-4 py-3 text-center cursor-pointer"
                  onClick={() => handleSort("percent_ai_yes_rejected")}
                  title="Porcentaje de rechazo por aseguradora cuando la IA dijo Sí"
                >
                  <div className="flex flex-col items-center">
                    <span>% Rechazo</span>
                    <span>(IA Sí)</span>
                    {renderSortIcon("percent_ai_yes_rejected")}
                  </div>
                </th>

                {/* 6. # IA NO / Med SI */}
                <th
                  className="px-4 py-3 text-center cursor-pointer"
                  onClick={() => handleSort("total_ai_no_medic_yes")}
                  title="Cantidad de episodios donde IA dijo No pero Médico corrigió a Sí"
                >
                  <div className="flex flex-col items-center">
                    <span># IA No</span>
                    <span>Med Sí</span>
                    {renderSortIcon("total_ai_no_medic_yes")}
                  </div>
                </th>

                {/* 7. % Rechazo (IA No / Med SI) */}
                <th
                  className="px-4 py-3 text-center cursor-pointer"
                  onClick={() => handleSort("percent_ai_no_medic_yes_rejected")}
                  title="Porcentaje de rechazo por aseguradora en casos corregidos por médico"
                >
                  <div className="flex flex-col items-center">
                    <span>% Rechazo</span>
                    <span>(Corregidos)</span>
                    {renderSortIcon("percent_ai_no_medic_yes_rejected")}
                  </div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-health-border text-health-text">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-health-text-muted"
                  >
                    Cargando datos...
                  </td>
                </tr>
              ) : filteredAndSortedMetrics.length > 0 ? (
                filteredAndSortedMetrics.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium">
                      {user.name || "Usuario Desconocido"}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {user.total_episodes}
                    </td>

                    <td className="px-4 py-3 text-center font-semibold text-blue-600">
                      {user.total_urgency_law}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`${
                          user.percent_urgency_law_rejected > 20
                            ? "text-red-600 font-bold"
                            : "text-green-600"
                        }`}
                      >
                        {user.percent_urgency_law_rejected}%
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      {user.total_ai_yes}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`${
                          user.percent_ai_yes_rejected > 20
                            ? "text-red-600"
                            : "text-health-text"
                        }`}
                      >
                        {user.percent_ai_yes_rejected}%
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center bg-yellow-50">
                      {user.total_ai_no_medic_yes}
                    </td>

                    <td className="px-4 py-3 text-center bg-yellow-50">
                      {user.percent_ai_no_medic_yes_rejected}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-health-text-muted"
                  >
                    No se encontraron resultados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex gap-2 items-start text-xs text-health-text-muted bg-blue-50 p-3 rounded-lg border border-blue-100">
        <span className="text-xl">💡</span>
        <p>
          Pasa el cursor sobre los encabezados de la tabla para ver la
          descripción detallada de cada métrica.
        </p>
      </div>
    </div>
  );
}
