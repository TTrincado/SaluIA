import { useState } from "react";
import { apiClient } from "../../modules/api";

export default function DeleteModal({
  isOpen,
  onClose,
  clinicalAttentionId,
  deleted_by_id,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.deleteClinicalAttention(
        clinicalAttentionId,
        deleted_by_id
      );

      if (response.success) {
        // Redirect to clinical attentions list
        window.location.href = "/clinical_attentions";
      } else {
        setError(response.error || "Error al eliminar la atención clínica");
      }
    } catch (err) {
      setError("Error al eliminar la atención clínica");
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
      <div className="bg-[#1a1a2e] rounded-lg p-6 w-full max-w-md mx-4 border border-white/10">
        <h2 className="text-xl font-semibold mb-4 text-white">
          Confirmar Eliminación
        </h2>

        <div className="space-y-4">
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
            <p className="text-white/90">
              ¿Está seguro que desea eliminar esta atención clínica?
            </p>
            <p className="text-white/60 text-sm mt-2">
              Esta acción no se puede deshacer.
            </p>
          </div>

          <div className="text-white/60 text-sm mt-2">
            A eliminar por: {deleted_by_id}
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
              {error}
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
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="rounded-lg bg-red-500 text-white px-4 py-2 font-medium hover:bg-red-600 transition disabled:opacity-50"
            >
              {loading ? "Eliminando..." : "Eliminar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
