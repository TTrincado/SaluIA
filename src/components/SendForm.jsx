import { useState } from "react";
import { apiClient } from "../modules/api";

export default function SendForm() {
  const [patientId, setPatientId] = useState("");
  const [residentDoctorId, setResidentDoctorId] = useState("");
  const [supervisorDoctorId, setSupervisorDoctorId] = useState("");
  const [diagnostic, setDiagnostic] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await apiClient.createClinicalAttention({
        patient_id: patientId,
        resident_doctor_id: residentDoctorId,
        supervisor_doctor_id: supervisorDoctorId,
        diagnostic: diagnostic,
      });

      if (response.success && response.data) {
        setSuccess(true);
        // Redirigir al detalle después de 1.5 segundos
        setTimeout(() => {
          window.location.href = `/clinical_attentions/details/${response.data.id}`;
        }, 1500);
      } else {
        setError(response.error || "Error al crear la atención clínica");
      }
    } catch (err) {
      setError("Error al crear la atención clínica");
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = patientId && residentDoctorId && supervisorDoctorId && diagnostic;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* IDs en una sola línea */}
      <div className="grid gap-4 grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">ID Paciente *</label>
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-health-accent"
            placeholder="ID del paciente"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">ID Médico Residente *</label>
          <input
            value={residentDoctorId}
            onChange={(e) => setResidentDoctorId(e.target.value)}
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-health-accent"
            placeholder="ID del médico"
            required
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">ID Médico Supervisor *</label>
          <input
            value={supervisorDoctorId}
            onChange={(e) => setSupervisorDoctorId(e.target.value)}
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-health-accent"
            placeholder="ID del médico"
            required
          />
        </div>
      </div>

      {/* Diagnóstico */}
      <div className="flex flex-col gap-2">
        <label className="text-sm text-white/70">Diagnóstico *</label>
        <textarea
          value={diagnostic}
          onChange={(e) => setDiagnostic(e.target.value)}
          className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-health-accent min-h-32"
          placeholder="Describe el diagnóstico del paciente..."
          required
        />
      </div>

      {/* Mensajes de error y éxito */}
      {error && (
        <div className="rounded-lg bg-red-500/20 border border-red-500/50 px-4 py-3 text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-lg bg-health-ok/20 border border-health-ok/50 px-4 py-3 text-health-ok">
          ¡Atención clínica creada exitosamente! Redirigiendo...
        </div>
      )}

      {/* Botón enviar */}
      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`w-full rounded-xl px-6 py-3 font-medium transition ${
          isFormValid && !loading
            ? "bg-health-accent text-black hover:bg-health-accentDark"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        {loading ? "Creando..." : "Crear Atención Clínica"}
      </button>
    </form>
  );
}
