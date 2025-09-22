import { useMemo, useState } from "react";

/**
 * @typedef {Object} Patient
 * @property {string} name
 * @property {string} rut
 * @property {string} email
 * @property {number} age
 * @property {boolean} urgent
 */

/**
 * @param {{ rows: Patient[] }} props
 */

export default function ConsultTable({ rows = [] }) {
  const [q, setQ] = useState("");

  const view = useMemo(() => {
    if (!q) return rows;
    const s = q.toLowerCase();
    return rows.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.rut.toLowerCase().includes(s) ||
        r.email.toLowerCase().includes(s)
    );
  }, [q, rows]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-white/70">Search:</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre, RUT o correo…"
          className="w-72 rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-health-accent"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/30">
            <tr className="[&>th]:px-4 [&>th]:py-3 text-left text-white/80">
              <th>Nombre</th>
              <th>Rut</th>
              <th>Mail</th>
              <th>Edad</th>
              <th>Urgencia</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {view.map((r) => (
              <tr key={r.rut} className="hover:bg-white/5">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.rut}</td>
                <td className="px-4 py-3">{r.email}</td>
                <td className="px-4 py-3">{r.age}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs ${
                      r.urgent
                        ? "bg-health-ok/20 text-health-ok"
                        : "bg-white/10 text-white/70"
                    }`}
                  >
                    {r.urgent ? "Sí" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <a
                    href={`/patient/${encodeURIComponent(r.rut)}`}
                    className="text-health-accent hover:underline"
                  >
                    Ver más
                  </a>
                </td>
              </tr>
            ))}
            {view.length === 0 && (
              <tr>
                <td className="px-4 py-6 text-white/60" colSpan={6}>
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-white/50">
        Mostrando {view.length} de {rows.length} registros
      </p>
    </div>
  );
}
