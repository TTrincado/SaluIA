import { useEffect, useState } from "react";

export default function PatientDetail() {
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPatientId = () => {
    if (typeof window === 'undefined') return null;
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('patientId');
  };

  const fetchPatient = async () => {
    const patientId = getPatientId();

    if (!patientId) {
      setError('ID de paciente no proporcionado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:3000/patients/${encodeURIComponent(patientId)}`);

      await new Promise(resolve => setTimeout(resolve, 500));

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setPatient(data.data);
    } catch (err) {
      setError(`No se pudo cargar la información del paciente: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchPatient();
    }
  }, []);

  if (loading) {
    return (
      <div className="text-center space-y-4">
        <div className="animate-spin h-8 w-8 border-2 border-health-accent border-t-transparent rounded-full mx-auto"></div>
        <p className="text-white/70">Cargando información del paciente...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-red-400">Error al cargar</h2>
        <p className="text-white/70">{error}</p>
        <div className="pt-2 space-x-4">
          <a href="/patients" className="text-health-accent hover:underline">
            Volver a la lista
          </a>
          <button
            onClick={fetchPatient}
            className="text-health-accent hover:underline"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center space-y-4">
        <p className="text-white/70">No se encontró información del paciente</p>
        <a href="/patients" className="text-health-accent hover:underline">
          Volver a la lista
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center border-b border-white/10 pb-6">
        <h1 className="text-3xl font-bold">{patient.name || 'Sin nombre'}</h1>
        <p className="text-white/60 mt-2">RUT: {patient.rut || 'Sin RUT'}</p>
        <div className="mt-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${patient.urgent
              ? "bg-health-ok/20 text-health-ok"
              : "bg-white/10 text-white/70"
              }`}
          >
            {patient.urgent ? "Urgente" : "No urgente"}
          </span>
        </div>
      </div>

      {/* Evaluación Ley de Urgencia */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-6">
        <div className="flex items-center gap-4">
          <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
            patient.urgent 
              ? "bg-health-ok/20" 
              : "bg-yellow-500/20"
          }`}>
            {patient.urgent ? (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M20 7L9 18l-5-5" 
                  stroke="#34d399" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            ) : (
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M12 9v3.75m0 4.5h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                  stroke="#eab308" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">
              {patient.urgent ? "Se aplica Ley de Urgencia" : "No se aplica Ley de Urgencia"}
            </h3>
            <p className="text-white/70">
              {patient.urgent 
                ? "El caso cumple criterios de activación según los datos entregados (MVP demostrativo)."
                : "El caso no cumple con los criterios necesarios para activar la ley de urgencia."
              }
            </p>
          </div>
        </div>
        
        {patient.urgent && (
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-white/60">Estado:</span>
                <span className="ml-2 font-semibold text-health-ok">Activado</span>
              </div>
              <div>
                <span className="text-white/60">Prioridad:</span>
                <span className="ml-2 font-semibold text-health-ok">Alta</span>
              </div>
              <div>
                <span className="text-white/60">Tiempo de respuesta:</span>
                <span className="ml-2 font-semibold text-health-ok">Inmediato</span>
              </div>
              <div>
                <span className="text-white/60">Protocolo:</span>
                <span className="ml-2 font-semibold text-health-ok">Urgencia Médica</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white/90">Información Personal</h3>
          <div className="space-y-3">
            <InfoRow label="Email" value={patient.email} />
            <InfoRow label="Edad" value={patient.age} />
            <InfoRow label="Teléfono" value={patient.phone} />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white/90">Información Médica</h3>
          <div className="space-y-3">
            <InfoRow label="Diagnóstico" value={patient.diagnosis} />
            <InfoRow label="Síntomas" value={patient.symptoms} />
            <InfoRow
              label="Fecha de consulta"
              value={patient.consultDate ? new Date(patient.consultDate).toLocaleDateString('es-CL') : null}
            />
          </div>
        </div>
      </div>

      {/* Notas Clínicas */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white/90">Notas Clínicas</h3>
        <div className="bg-white/5 rounded-lg p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white/90 mb-2">Motivo de Consulta</h4>
                <p className="text-white/75 text-sm">
                  {patient.consultReason || "Cefalea súbita de intensidad severa"}
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold text-white/90 mb-2">Constantes Vitales</h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Glasgow:</span>
                    <span>{patient.glasgow || "15"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">PA:</span>
                    <span>{patient.bloodPressure || "150/90"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">FC:</span>
                    <span>{patient.heartRate || "92"} bpm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">SpO₂:</span>
                    <span>{patient.oxygenSaturation || "98"}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white/90 mb-2">Exámenes Previos</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">TAC simple:</span>
                    <span className="text-health-ok">{patient.tacResult || "Normal"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-white/60">EKG:</span>
                    <span className="text-health-ok">{patient.ekgResult || "Sin alteraciones"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-white/60">Laboratorio:</span>
                    <span>{patient.labResults || "Pendiente"}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold text-white/90 mb-2">Observaciones</h4>
                <p className="text-white/75 text-sm leading-relaxed">
                  {patient.observations || "Derivado a evaluación neurológica. Paciente estable, consciente y orientado. Se recomienda observación continua."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {patient.notes && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white/90">Notas Adicionales</h3>
          <div className="bg-white/5 rounded-lg p-4">
            <p className="text-white/80">{patient.notes}</p>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-4 pt-6 border-t border-white/10">
        <a
          href="/patients"
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
        >
          ← Volver a la lista
        </a>
        <button
          onClick={fetchPatient}
          className="px-4 py-2 bg-health-accent/20 hover:bg-health-accent/30 text-health-accent rounded-lg transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-white/5">
      <span className="text-white/60">{label}:</span>
      <span>{value || 'No disponible'}</span>
    </div>
  );
}
