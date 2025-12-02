import { useState, useRef, useEffect } from "react";

export default function AutocompleteSelect({
  value,
  onChange,
  options,
  placeholder = "Seleccione aseguradora...",
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const filtered =
    query.length === 0
      ? options
      : options.filter((o) =>
          (o.nombre_comercial || o.nombre_juridico)
            .toLowerCase()
            .includes(query.toLowerCase())
        );

  // Click afuera para cerrar
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selectedInsurance = options.find((o) => o.id === value);

  return (
    <div ref={containerRef} className="relative">
      {/* Input Visible */}
      <input
        type="text"
        className="w-full bg-white border border-health-border rounded p-2 text-health-text"
        placeholder={placeholder}
        value={
          open ? query : selectedInsurance
            ? selectedInsurance.nombre_comercial || selectedInsurance.nombre_juridico
            : ""
        }
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
      />

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 mt-1 max-h-60 overflow-auto bg-white border border-health-border rounded shadow-xl z-50">
          {filtered.length === 0 && (
            <div className="p-3 text-health-text-muted text-sm">Sin resultados</div>
          )}

          {filtered.map((o) => (
            <div
              key={o.id}
              onMouseDown={() => {
                onChange(o.id);
                setQuery("");
                setOpen(false);
              }}
              className="px-3 py-2 cursor-pointer text-health-text hover:bg-health-accent hover:text-white text-sm"
            >
              {o.nombre_comercial || o.nombre_juridico}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
