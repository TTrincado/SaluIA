import { useMemo, useState } from "react";

const KNOWN_DX = [
  "ACV isquémico",
  "Tromboembolismo pulmonar",
  "Infarto agudo al miocardio",
  "Politraumatismo",
  "Shock séptico",
];

export default function SendForm() {
  const [name, setName] = useState("");
  const [rut, setRut] = useState("");
  const [email, setEmail] = useState("");
  const [dx, setDx] = useState("");
  const [file, setFile] = useState(null);

  const ready = useMemo(() => {
    return Boolean(name && rut && email && file);
  }, [name, rut, email, file]);

  return (
    <form
      action="/patient/result"
      method="get"
      className="space-y-5"
      onSubmit={(e) => {
        if (!ready) e.preventDefault();
      }}
    >
      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">Nombre</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-health-accent"
            placeholder="Nombre completo"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">RUT</label>
          <input
            value={rut}
            onChange={(e) => setRut(e.target.value)}
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-health-accent"
            placeholder="12.345.678-9"
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm text-white/70">Mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-health-accent"
            placeholder="nombre@dominio.cl"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-white/70">Diagnóstico conocido (opcional)</label>
        <select
          value={dx}
          onChange={(e) => setDx(e.target.value)}
          className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-health-accent"
        >
          <option value="">Selecciona un diagnóstico…</option>
          {KNOWN_DX.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
        {dx && <p className="text-xs text-white/50">Seleccionado: {dx}</p>}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm text-white/70">Adjuntar PDF(s)</label>
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="rounded-lg bg-black/40 border border-white/10 file:mr-4 file:rounded-md file:border-0 file:bg-health-accent file:px-4 file:py-2 file:text-black hover:file:bg-health-accentDark"
        />
        <p className="text-xs text-white/50">El botón “Procesar” se habilita al completar nombre, RUT, mail y adjuntar al menos un PDF.</p>
      </div>

      <button
        type="submit"
        disabled={!ready}
        className={`w-full rounded-xl px-6 py-3 font-medium transition ${
          ready
            ? "bg-health-accent text-black hover:bg-health-accentDark"
            : "bg-white/10 text-white/40 cursor-not-allowed"
        }`}
      >
        Procesar
      </button>
    </form>
  );
}
