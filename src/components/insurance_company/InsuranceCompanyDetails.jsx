import { useEffect, useState } from "react";
import { apiClient } from "../../modules/api";

import MetricCard, { MetricCardWithProgress } from "../metrics/MetricCard.jsx";
import DeleteInsuranceCompanyModal from "./DeleteInsuranceCompanyModal";
import EditInsuranceCompanyModal from "./EditInsuranceCompanyModal";

export default function InsuranceCompanyDetails({ id }) {
  const [company, setCompany] = useState(null);
  const [metrics, setMetrics] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Date filters for metrics
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Parallel fetch
      const [companyResp, metricsResp] = await Promise.all([
        apiClient.getInsuranceCompany(id),
        apiClient.getInsuranceMetrics(id, startDate, endDate),
      ]);

      if (companyResp.success) setCompany(companyResp.data);
      else throw new Error(companyResp.error || "Error cargando compañía");

      if (metricsResp.success) setMetrics(metricsResp.data);
      // Metrics might fail if no data, optional to handle strictly
    } catch (e) {
      setError(e.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id, startDate, endDate]);

  if (loading && !company)
    return (
      <div className="py-20 text-center text-health-text-muted">
        Cargando...
      </div>
    );

  if (error || !company)
    return <div className="py-20 text-center text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <a
          href="/aseguradora"
          className="text-health-accent hover:underline text-sm"
        >
          ← Volver a la lista
        </a>

        <div className="flex gap-3">
          <button
            onClick={() => setShowEditModal(true)}
            className="rounded-lg bg-health-accent text-white px-4 py-2 text-sm hover:bg-health-accent-dark shadow-md"
          >
            Editar
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="rounded-lg bg-red-500 text-white px-4 py-2 text-sm hover:bg-red-600 shadow-md"
          >
            Eliminar
          </button>
        </div>
      </div>

      {/* DATOS DE LA EMPRESA */}
      <div className="bg-health-card p-6 rounded-xl border border-health-border shadow-sm">
        <h2 className="text-lg font-semibold text-health-accent mb-4">
          Información de la aseguradora
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span className="block text-health-text-muted text-xs">
              Nombre Comercial
            </span>
            <span className="text-health-text font-medium">
              {company.nombre_comercial || "—"}
            </span>
          </div>
          <div>
            <span className="block text-health-text-muted text-xs">
              Razón Social
            </span>
            <span className="text-health-text font-medium">
              {company.nombre_juridico}
            </span>
          </div>
          <div>
            <span className="block text-health-text-muted text-xs">RUT</span>
            <span className="text-health-text font-medium">
              {company.rut || "—"}
            </span>
          </div>
        </div>
      </div>

      {/* SECCIÓN MÉTRICAS */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-health-text">
            Métricas de Desempeño
          </h2>
          <div className="flex gap-2">
            <select
              className="bg-white border border-health-border rounded-lg px-2 py-1 text-sm"
              onChange={(e) => {
                const val = e.target.value;
                if (val === "all") {
                  setStartDate("");
                  setEndDate("");
                }
                if (val === "month") {
                  const d = new Date();
                  d.setMonth(d.getMonth() - 1);
                  setStartDate(d.toISOString().split("T")[0]);
                  setEndDate(new Date().toISOString().split("T")[0]);
                }
                if (val === "year") {
                  const d = new Date();
                  d.setFullYear(d.getFullYear() - 1);
                  setStartDate(d.toISOString().split("T")[0]);
                  setEndDate(new Date().toISOString().split("T")[0]);
                }
              }}
            >
              <option value="all">Todo el historial</option>
              <option value="month">Último Mes</option>
              <option value="year">Último Año</option>
            </select>
          </div>
        </div>

        {metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Episodios Subidos */}
            <MetricCard
              title="Episodios Totales"
              value={metrics.total_episodes}
              subtitle="Registrados con esta aseguradora"
              theme="info"
              icon="📂"
            />

            {/* 2. Ley Urgencia (IA o Médico SI) */}
            <MetricCard
              title="Ley Urgencia (General)"
              value={metrics.total_urgency_law}
              subtitle="Confirmados como urgencia"
              theme="warning"
              icon="🚑"
            />

            {/* 3. % Rechazo Ley Urgencia */}
            <MetricCardWithProgress
              title="% Rechazo (General)"
              value={metrics.percent_urgency_law_rejected}
              subtitle="Tasa de rechazo en casos de urgencia"
              theme={
                metrics.percent_urgency_law_rejected > 15 ? "danger" : "success"
              }
            />

            {/* 4. IA SI */}
            <MetricCard
              title="IA detectó Urgencia"
              value={metrics.total_ai_yes}
              subtitle="Casos marcados por IA"
              theme="highlight"
              icon="🤖"
            />

            {/* 5. % Rechazo IA SI */}
            <MetricCardWithProgress
              title="% Rechazo (IA Sí)"
              value={metrics.percent_ai_yes_rejected}
              subtitle="Rechazo cuando IA dijo sí"
              theme={
                metrics.percent_ai_yes_rejected > 15 ? "danger" : "success"
              }
            />

            {/* 6. IA NO / Med SI */}
            <MetricCard
              title="IA No / Médico Sí"
              value={metrics.total_ai_no_medic_yes}
              subtitle="Correcciones médicas"
              theme="default"
              icon="🩺"
            />

            {/* 7. % Rechazo (IA No / Med SI) */}
            <MetricCardWithProgress
              title="% Rechazo (Corregidos)"
              value={metrics.percent_ai_no_medic_yes_rejected}
              subtitle="Rechazo en correcciones médicas"
              theme={
                metrics.percent_ai_no_medic_yes_rejected > 20
                  ? "danger"
                  : "warning"
              }
            />
          </div>
        ) : (
          <div className="p-8 bg-gray-50 rounded-xl text-center text-health-text-muted">
            No hay métricas disponibles para el rango seleccionado.
          </div>
        )}
      </div>

      {/* MODALES */}
      <EditInsuranceCompanyModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        company={company}
        onSuccess={loadData}
      />

      <DeleteInsuranceCompanyModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        companyId={company.id}
        onSuccess={() => (window.location.href = "/aseguradora")}
      />
    </div>
  );
}
