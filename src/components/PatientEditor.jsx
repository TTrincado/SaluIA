import { useEffect, useMemo, useState } from "react";
import { loadPatients, upsertPatient } from "../data/patientStore";

/**
 * @typedef {{name:string; rut:string; age:number; urgent:boolean; presentFirst:boolean; vitals:string; doctor:string; }} Patient
 */

/** @param {{ initial: Patient }} props */
export default function PatientEditor({ initial }) {
  const [p, setP] = useState(initial);

  useEffect(() => {
    const list = loadPatients();
    const found = list.find((x) => x.rut === initial.rut);
    if (found) setP(found);
  }, [initial.rut]);

  const toggleUrgent = () => setP((s) => ({ ...s, urgent: !s.urgent }));
  const togglePresent = () =>
    setP((s) => ({ ...s, presentFirst: !s.presentFirst }));
  const setVitals = (v) => setP((s) => ({ ...s, vitals: v }));

  const badgeUrgent = useMemo(
    () =>
      p.urgent ? "bg-health-ok/20 text-health-ok" : "bg-white/10 text-white/70",
    [p.urgent]
  );

  const handleSave = () => {
    upsertPatient(p);
    const el = document.getElementById("saveMsg");
    if (el) {
      el.textContent = "Cambios guardados ✔";
      setTimeout(() => (el.textContent = ""), 1600);
    }
  };

  return (
    <div className="grid gap-6 p-6 md:grid-cols-2">
      <div>
        <h2 className="text-lg font-semibold mb-2">Datos del paciente</h2>
        <ul className="space-y-1 text-white/80">
          <li>
            <span className="text-white/50">Nombre:</span> {p.name}
          </li>
          <li>
            <span className="text-white/50">RUT:</span> {p.rut}
          </li>
          <li>
            <span className="text-white/50">Edad:</span> {p.age}
          </li>
          <li>
            <span className="text-white/50">Médico:</span> {p.doctor}
          </li>
          <li>
            <span className="text-white/50">Ley de Urgencia:</span>
            <span
              className={`ml-2 rounded-md px-2 py-0.5 text-xs ${badgeUrgent}`}
            >
              {p.urgent ? "Sí" : "No"}
            </span>
            <button
              onClick={toggleUrgent}
              className="ml-3 rounded-lg border border-white/10 px-2 py-1 text-xs hover:bg-white/10"
            >
              Cambiar a {p.urgent ? "No" : "Sí"}
            </button>
          </li>
          <li className="mt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={p.presentFirst}
                onChange={togglePresent}
              />
              <span>Presente en primera instancia</span>
            </label>
          </li>
          <li className="mt-2">
            <label className="text-white/50 mr-2">Signos vitales:</label>
            <select
              value={p.vitals}
              onChange={(e) => setVitals(e.target.value)}
              className="rounded-lg bg-black/40 border border-white/10 px-3 py-1 outline-none focus:ring-2 focus:ring-health-accent"
            >
              <option value="Estable">Estable</option>
              <option value="Crítico">Crítico</option>
              <option value="Reposo">Reposo</option>
            </select>
          </li>
        </ul>

        <button
          onClick={handleSave}
          className="mt-4 rounded-lg bg-health-accent text-black px-4 py-2 font-medium hover:bg-health-accent-dark transition"
        >
          Guardar cambios
        </button>
        <p id="saveMsg" className="text-xs text-health-ok mt-2"></p>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Notas clínicas</h2>
        <p className="text-white/75 leading-relaxed">
          Motivo consulta: cefalea súbita, Glasgow 15, PA 150/90, FC 92, SpO₂
          98%.
          <br /> Exámenes previos: TAC simple normal, EKG sin alteraciones.
          <br /> Observación: derivado a evaluación neurológica. (Texto ficticio
          / placeholder)
        </p>
      </div>
    </div>
  );
}
