import { useState } from "react";
import { apiClient } from "../../modules/api";

export default function EditModal({
  isOpen,
  onClose,
  clinicalAttention,
  onSuccess,
}) {
  const [diagnostic, setDiagnostic] = useState(
    clinicalAttention?.diagnostic || ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage("");

    try {
      const response = await apiClient.updateClinicalAttention(
        clinicalAttention.id,
        { diagnostic }
      );

      if (response.success) {
        setSuccessMessage("Atención clínica actualizada exitosamente");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1000);
      } else {
        setError(response.error || "Error al actualizar la atención clínica");
      }
    } catch (err) {
      setError("Error al actualizar la atención clínica");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={handleBackdropClick}
    >
      <div className="bg-[#1a1a2e] rounded-lg p-6 w-full max-w-lg mx-4 border border-white/10">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Editar Atención Clínica
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="diagnostic"
              className="block text-sm text-white/70 mb-2"
            >
              Diagnóstico
            </label>
            <textarea
              id="diagnostic"
              value={diagnostic}
              onChange={(e) => setDiagnostic(e.target.value)}
              rows={6}
              required
              className="w-full rounded-lg bg-black/40 border border-white/10 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-health-accent resize-none"
              placeholder="Ingrese el diagnóstico..."
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {successMessage && (
            <div className="text-health-ok text-sm bg-health-ok/10 border border-health-ok/20 rounded-lg px-3 py-2">
              {successMessage}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-white/10 px-4 py-2 text-white hover:bg-white/10 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-health-accent text-black px-4 py-2 font-medium hover:bg-health-accent-dark transition disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
