import { useEffect, useMemo, useState } from "react";
import { mergeSSRWithClient } from "../data/patientStore";

/**
 * @typedef {Object} Patient
 * @property {string} name
 * @property {string} rut
 * @property {number} age
 * @property {boolean} urgent
 * @property {boolean} presentFirst
 * @property {string} vitals
 * @property {string} doctor
 */

/**
 * @param {{ rows: Patient[] }} props
 */

export default function ConsultTable({ rows = [] }) {
  const [q, setQ] = useState("");
  const [data, setData] = useState(rows);

  useEffect(() => {
    setData(mergeSSRWithClient(rows));
  }, [rows]);

  const view = useMemo(() => {
    const source = data;
    if (!q) return source;
    const s = q.toLowerCase();
    return source.filter(
      (r) =>
        r.name.toLowerCase().includes(s) ||
        r.rut.toLowerCase().includes(s) ||
        String(r.age).includes(s) ||
        r.doctor.toLowerCase().includes(s) ||
        r.vitals.toLowerCase().includes(s)
    );
  }, [q, data]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-white/70">Buscar:</label>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Nombre, RUT, médico, signos…"
          className="w-72 rounded-lg bg-black/40 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-health-accent"
        />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-black/30">
            <tr className="[&>th]:px-4 [&>th]:py-3 text-left text-white/80">
              <th>Nombre</th>
              <th>Rut</th>
              <th>Edad</th>
              <th>Signos</th>
              <th>Urgencia</th>
              <th>Presente 1ª</th>
              <th>Médico</th>
              <th></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {view.map((r) => (
              <tr key={r.rut} className="hover:bg-white/5">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.rut}</td>
                <td className="px-4 py-3">{r.age}</td>
                <td className="px-4 py-3">{r.vitals}</td>
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
                  <span
                    className={`rounded-md px-2 py-1 text-xs ${
                      r.presentFirst
                        ? "bg-white/10 text-white/80"
                        : "bg-white/5 text-white/50"
                    }`}
                  >
                    {r.presentFirst ? "Sí" : "No"}
                  </span>
                </td>
                <td className="px-4 py-3">{r.doctor}</td>
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
                <td className="px-4 py-6 text-white/60" colSpan={8}>
                  Sin resultados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-white/50">
        Mostrando {view.length} de {data.length} registros
      </p>
    </div>
  );
}
