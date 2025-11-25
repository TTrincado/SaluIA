import { useState, useRef, useEffect } from "react";

export function useClipboard() {
  const [copiedId, setCopiedId] = useState("");
  const [toast, setToast] = useState({ show: false, message: "" });
  const toastTimerRef = useRef(null);

  // Limpiar timer al desmontar para evitar errores
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  const copyToClipboard = (text, id, label = "ID copiado") => {
    if (!text) return;

    // 1. Copiar
    navigator.clipboard.writeText(text);

    // 2. Feedback en el botón (check)
    setCopiedId(id);
    setTimeout(() => setCopiedId(""), 2000);

    // 3. Feedback global (Toast)
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);

    setToast({ show: true, message: label });

    toastTimerRef.current = setTimeout(() => {
      setToast({ show: false, message: "" });
    }, 3000);
  };

  const ClipboardToast = (
    <div
      className={`fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out pointer-events-none ${
        toast.show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
    >
      <div className="flex items-center gap-3 bg-gray-900 border border-white/10 text-white px-4 py-3 rounded-lg shadow-2xl backdrop-blur-sm">
        <div className="bg-green-500/20 p-1 rounded-full">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-400"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
        <span className="text-sm font-medium">{toast.message}</span>
      </div>
    </div>
  );

  return {
    copyToClipboard, // La función para llamar en el onClick
    copiedId, // El ID actual para mostrar el check verde
    ClipboardToast, // El componente visual para poner al final del JSX
  };
}
