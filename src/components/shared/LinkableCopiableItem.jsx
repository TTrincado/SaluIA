import { useClipboard } from "../../modules/useClipboard"; // Reutilizamos tu hook

export default function LinkableCopiableItem({
  value,
  displayValue = value,
  toRoute,
  routeParam,
  label = "Copiado",
}) {
  // Cada ítem tiene su propia instancia del hook.
  // Esto es genial porque el estado 'copiedId' es local para este botón específico.
  const { copyToClipboard, copiedId, ClipboardToast } = useClipboard();

  return (
    <div className="flex items-center gap-2">
      {/* Lo que se ve (ej: los últimos 6 caracteres) */}
      {/* Lo que se ve (ej: los últimos 6 caracteres) */}
      {/* Se asume que `toRoute` y `routeParam` serán pasados como props al componente CopiableItem */}
      {/* Si `toRoute` y `routeParam` existen, se renderiza como un enlace; de lo contrario, como un span */}
      {toRoute && routeParam ? (
        <a
          href={`${toRoute}/${routeParam}`}
          className="font-mono text-blue-400 hover:underline transition-colors duration-200"
          target="_blank" // Abre el enlace en una nueva pestaña
          rel="noopener noreferrer" // Seguridad recomendada para target="_blank"
        >
          {displayValue}
        </a>
      ) : (
        <span className="font-mono">{displayValue}</span>
      )}

      {/* El botón */}
      <button
        onClick={() => copyToClipboard(value, value, label)} // Copia el valor completo
        className="text-white/40 hover:text-white hover:bg-white/10 p-1.5 rounded-md transition-all"
        title="Copiar"
      >
        {copiedId === value ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-green-400"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        )}
      </button>

      {/* El Toast vive aquí dentro, pero como tiene position:fixed,
          se verá en el centro de la pantalla sin importar dónde esté la tabla */}
      {ClipboardToast}
    </div>
  );
}
