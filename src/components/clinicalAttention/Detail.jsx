import { useEffect, useState } from "react";
import { apiClient } from "../../modules/api";
import DeleteModal from "./DeleteModal";
import EditModal from "./EditModal";

// =====================
// PARSE CLINICAL SUMMARY TXT (Funcionalidad de HEAD)
// =====================
const parseClinicalSummary = (txt) => {
  if (!txt) return null;

  // Si no tiene el formato nuevo, devolvemos estructura básica con el texto en diagnóstico
  if (!txt.includes("=====")) {
      return {
          anamnesis: "N/A",
          signosVitalesRaw: "",
          signosVitales: {},
          hallazgos: "N/A",
          diagnostico: txt
      };
  }

  const raw = txt
    .split("=====")
    .map((s) => s.trim())
    .filter(Boolean);

  const output = {
    anamnesis: "",
    signosVitalesRaw: "",
    signosVitales: {},
    hallazgos: "",
    diagnostico: ""
  };

  // Recorremos como pares: TITULO -> CONTENIDO
  for (let i = 0; i < raw.length; i++) {
    const block = raw[i].toLowerCase();

    if (block === "anamnesis") output.anamnesis = raw[i + 1] || "";
    if (block === "signos vitales") output.signosVitalesRaw = raw[i + 1] || "";
    if (block === "hallazgos clínicos") output.hallazgos = raw[i + 1] || "";
    if (block === "diagnóstico presuntivo") output.diagnostico = raw[i + 1] || "";
  }

  // Parse signos vitales
  if (output.signosVitalesRaw) {
    output.signosVitalesRaw.split("\n").forEach((l) => {
        if (l.includes(":")) {
        const [k, v] = l.split(":").map((x) => x.trim());
        output.signosVitales[k] = v;
        }
    });
  }

  return output;
};

// Combinamos la prop de Main con la lógica interna
export default function ClinicalAttentionDetail({ attentionId }) {
  const [clinicalAttention, setClinicalAttention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Estado de HEAD (Polling y Aprobación)
  const [polling, setPolling] = useState(false);
  const [approvalReason, setApprovalReason] = useState("");
  const [rejectMode, setRejectMode] = useState(false);
  
  // Estado de Main (Auth)
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const sessionStr = localStorage.getItem("saluia.session");
    if (sessionStr) {
      const session = JSON.parse(sessionStr);
      setCurrentUser(session.user);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attentionId]);

  const fetchData = async () => {
    let id = attentionId;

    if (!id) {
      const pathname = window.location.pathname;
      const parts = pathname.split("/");
      id = parts[parts.length - 1];
    }

    if (!id || id === "details") {
      setError("No se encontró el ID de la atención clínica");
      setLoading(false);
      return;
    }

    try {
      const response = await apiClient.getClinicalAttention(id);

      if (response.success && response.data) {
        setClinicalAttention(response.data);
        // Lógica de HEAD para polling y reject reason
        setApprovalReason(response.data.medic_reject_reason || "");
        setPolling(response.data.ai_result === null);
      } else {
        setError(response.error || "Error al cargar los datos");
      }
    } catch (err) {
      setError("Error de conexión al cargar datos");
    } finally {
      setLoading(false);
    }
  };

  // Polling Effect (HEAD)
  useEffect(() => {
    if (!polling) return;
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [polling]);

  const handleEditSuccess = () => {
    setLoading(true);
    fetchData();
  };

  const handleMedicApproval = async (approved) => {
    if (!approved && approvalReason.trim().length < 3) {
      alert("Debes ingresar una razón para rechazar.");
      return;
    }

    const id = clinicalAttention.id;
    // Usamos el ID del usuario actual de la sesión (Main) en lugar del hardcodeado de HEAD
    const medicId = currentUser?.id;

    if (!medicId) {
        alert("Error de sesión: No se identificó al médico.");
        return;
    }

    const resp = await apiClient.AproveClinicalAttention(
      id,
      approved,
      approved ? "" : approvalReason,
      medicId
    );

    if (resp.success) {
      fetchData();
      setRejectMode(false);
    } else {
      alert("Error al actualizar aprobación.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-health-accent border-t-transparent rounded-full animate-spin"></div>
          <span className="text-white/50 text-sm">Cargando información...</span>
        </div>
      </div>
    );
  }

  if (error || !clinicalAttention) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="text-red-400 bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20">
          {error || "No se encontraron datos"}
        </div>
        <a
          href="/clinical_attentions"
          className="text-health-accent hover:underline text-sm"
        >
          ← Volver a lista de atenciones
        </a>
      </div>
    );
  }

  const ca = clinicalAttention;
  const parsed = parseClinicalSummary(ca.diagnostic);
  
  // Lógica de Permisos (Main)
  const userRole = currentUser?.user_metadata?.role;
  const userId = currentUser?.id;
  const isOwner = ca.resident_doctor?.id === userId;
  const canEdit =
    userRole === "supervisor" || (userRole === "resident" && isOwner);

  return (
    <div className="p-6 flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <a
          href="/clinical_attentions"
          className="text-health-accent hover:underline text-sm inline-flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          Volver a lista
        </a>

        {canEdit && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowEditModal(true)}
              className="rounded-lg bg-health-accent text-black px-4 py-2 text-sm font-medium hover:bg-health-accent-dark transition shadow-lg shadow-health-accent/10 flex items-center gap-2"
            >
              Editar
            </button>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="rounded-lg bg-red-500 text-white px-4 py-2 text-sm font-medium hover:bg-red-600 transition shadow-lg shadow-red-500/10 flex items-center gap-2"
            >
              Eliminar
            </button>
          </div>
        )}
      </div>

      {/* ========================= */}
      {/* GRID PRINCIPAL     */}
      {/* ========================= */}

      <div className="grid gap-6 md:grid-cols-2">

        {/* ========================= */}
        {/* COLUMNA 1: PACIENTE + CLÍNICA */}
        {/* ========================= */}
        <div className="space-y-6">
            
            {/* PACIENTE */}
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 shadow-xl backdrop-blur-md">
                <h2 className="text-lg font-semibold mb-4 text-health-accent">Datos del Paciente</h2>
                <ul className="space-y-2 text-white/80">
                <li><span className="text-white/50">Nombre:</span> {ca.patient.first_name} {ca.patient.last_name}</li>
                <li><span className="text-white/50">RUT:</span> {ca.patient.rut}</li>
                <li><span className="text-white/50">Email:</span> {ca.patient.email || "N/A"}</li>
                <li><span className="text-white/50">Teléfono:</span> {ca.patient.phone || "N/A"}</li>
                <li><span className="text-white/50">Dirección:</span> {ca.patient.address || "N/A"}</li>
                </ul>
            </div>

            {/* INFORMACIÓN CLÍNICA (ESTILO HEAD) */}
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 shadow-xl backdrop-blur-md">
                <h2 className="text-lg font-semibold mb-4 text-health-accent">Información Clínica</h2>

                {/* ANAMNESIS */}
                <div className="mb-6">
                <h3 className="text-sm text-white/60 font-semibold uppercase tracking-wide">Anamnesis</h3>
                <p className="text-white/80 mt-2 leading-relaxed whitespace-pre-line">{parsed?.anamnesis || "N/A"}</p>
                </div>

                {/* SIGNOS VITALES */}
                <div className="mb-6">
                <h3 className="text-sm text-white/60 font-semibold uppercase tracking-wide">Signos Vitales</h3>
                {parsed?.signosVitales && Object.keys(parsed.signosVitales).length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 mt-3">
                        {Object.entries(parsed.signosVitales).map(([k, v]) => (
                        <div key={k} className="flex flex-col bg-black/20 border border-white/10 rounded-lg p-3">
                            <span className="text-xs text-white/50">{k}</span>
                            <span className="text-white/90 font-medium mt-1">{v}</span>
                        </div>
                        ))}
                    </div>
                ) : ( <p className="text-white/40 mt-2">No registrados</p> )}
                </div>

                {/* HALLAZGOS */}
                <div className="mb-6">
                <h3 className="text-sm text-white/60 font-semibold uppercase tracking-wide">Hallazgos Clínicos</h3>
                <p className="text-white/80 mt-2 leading-relaxed whitespace-pre-line">{parsed?.hallazgos || "N/A"}</p>
                </div>

                {/* DIAGNÓSTICO */}
                <div>
                <h3 className="text-sm text-white/60 font-semibold uppercase tracking-wide">Diagnóstico Presuntivo</h3>
                <p className="text-white/80 mt-2 leading-relaxed whitespace-pre-line">{parsed?.diagnostico || ca.diagnostic}</p>
                </div>
            </div>
        </div>

        {/* ========================= */}
        {/* COLUMNA 2: MÉDICOS + IA */}
        {/* ========================= */}
        <div className="space-y-6">

            {/* MÉDICOS */}
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 shadow-xl backdrop-blur-md">
                <h2 className="text-lg font-semibold mb-4 text-health-accent flex items-center gap-2">Equipo Médico</h2>
                
                <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-health-accent/20 flex items-center justify-center text-health-accent font-bold">
                            R
                        </div>
                        <div>
                        <p className="text-xs text-white/50 uppercase tracking-wide">Médico Residente</p>
                        <p className="text-white font-medium">{ca.resident_doctor.first_name} {ca.resident_doctor.last_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                            S
                        </div>
                        <div>
                        <p className="text-xs text-white/50 uppercase tracking-wide">Médico Supervisor</p>
                        <p className="text-white font-medium">{ca.supervisor_doctor.first_name} {ca.supervisor_doctor.last_name}</p>
                        </div>
                    </div>
                </div>

                <div className="px-6 text-right mt-4">
                    <div className="text-xs text-white/30 space-y-1">
                    <p>Creado: {formatDate(ca.created_at)}</p>
                    <p>Última act.: {formatDate(ca.updated_at)}</p>
                    </div>
                </div>
            </div>

            {/* ANÁLISIS IA (Con lógica de aprobación de HEAD y estilos de Main) */}
            <div className="bg-white/5 p-5 rounded-xl border border-white/10 shadow-xl backdrop-blur-md">
                <h2 className="text-lg font-semibold mb-4 text-health-accent">Análisis IA</h2>

                <ul className="space-y-3 text-white/80">
                    <li>
                    <span className="text-white/50">Ley de Urgencia:</span>
                    <span className={`ml-2 rounded-md px-2 py-0.5 text-xs ${
                        ca.applies_urgency_law === true
                        ? "bg-health-ok/20 text-health-ok"
                        : ca.applies_urgency_law === false
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/10 text-white/70"
                    }`}>
                        {ca.applies_urgency_law === true ? "Sí" :
                        ca.applies_urgency_law === false ? "No" : "Pendiente"}
                    </span>
                    </li>

                    <li>
                    <span className="text-white/50">Resultado IA:</span>
                    <span className={`ml-2 rounded-md px-2 py-0.5 text-xs ${
                        ca.ai_result === true
                        ? "bg-health-ok/20 text-health-ok"
                        : ca.ai_result === false
                        ? "bg-red-500/20 text-red-400"
                        : "bg-white/10 text-white/70"
                    }`}>
                        {ca.ai_result === true ? "Aprobado" :
                        ca.ai_result === false ? "Rechazado" : "Pendiente"}
                    </span>
                    </li>

                    {ca.ai_result === null && (
                    <li className="flex items-center gap-2 text-white/70 mt-2">
                        <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full"></div>
                        <span>Procesando diagnóstico...</span>
                    </li>
                    )}

                    <li>
                    <span className="text-white/50">Razón IA:</span>{" "}
                    {ca.ai_reason || "N/A"}
                    </li>
                </ul>

                {/* APROBACIÓN MÉDICA (Lógica de HEAD) */}
                {/* Solo mostramos si el usuario puede editar (es supervisor o dueño) */}
                {canEdit && ca.medic_approved === null && (
                    <div className="mt-6 bg-black/20 border border-white/10 p-4 rounded-xl">

                    <h3 className="text-white text-md font-semibold mb-3">
                        Aprobación del Médico
                    </h3>

                    {rejectMode ? (
                        <>
                        <div className="mb-3">
                            <label className="text-white/50 text-sm">Razón del rechazo</label>
                            <textarea
                            className="w-full mt-1 p-2 bg-black/40 border border-white/10 rounded-lg text-white"
                            rows={2}
                            value={approvalReason}
                            onChange={(e) => setApprovalReason(e.target.value)}
                            />
                        </div>

                        <button
                            onClick={() => handleMedicApproval(false)}
                            className="bg-red-600/40 text-red-300 px-4 py-2 rounded-lg hover:bg-red-600/60 transition"
                        >
                            Enviar Rechazo
                        </button>

                        <button
                            onClick={() => {
                            setRejectMode(false);
                            setApprovalReason("");
                            }}
                            className="ml-3 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition"
                        >
                            Cancelar
                        </button>
                        </>
                    ) : (
                        <div className="flex gap-3">
                        <button
                            onClick={() => handleMedicApproval(true)}
                            className="bg-green-600/30 text-green-400 px-4 py-2 rounded-lg hover:bg-green-600/50 transition"
                        >
                            Aprobar resultado IA
                        </button>

                        <button
                            onClick={() => setRejectMode(true)}
                            className="bg-red-600/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-600/50 transition"
                        >
                            Rechazar resultado IA
                        </button>
                        </div>
                    )}
                    </div>
                )}

                {/* AVISO DE SOBRESCRITURA */}
                {ca.overwritten_reason && ca.overwritten_reason.trim() !== "" && (
                    <div className="mt-6 bg-yellow-600/10 border border-yellow-500/30 p-4 rounded-xl">
                    <h3 className="text-yellow-400 font-semibold text-sm mb-2">
                        Atención Sobrescrita
                    </h3>

                    <p className="text-white/80 whitespace-pre-line text-sm mb-3">
                        {ca.overwritten_reason}
                    </p>

                    {ca.overwritten_by && (
                        <div className="text-white/60 text-xs">
                        <span className="font-semibold text-yellow-300">Sobrescrito por:</span>{" "}
                        {ca.overwritten_by.first_name} {ca.overwritten_by.last_name}
                        </div>
                    )}
                    </div>
                )}
            </div>

        </div>

      </div>

      <EditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        clinicalAttention={ca}
        onSuccess={handleEditSuccess}
        userRole={userRole}
      />

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        clinicalAttentionId={ca.id}
        deleted_by_id={userId}
      />
    </div>
  );
}