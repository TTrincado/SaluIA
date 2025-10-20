import type { Patient } from "./patients";

const STORAGE_KEY = "saluia.patients";

export function loadPatients(): Patient[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Patient[]) : [];
  } catch {
    return [];
  }
}

export function savePatients(list: Patient[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function upsertPatient(p: Patient) {
  const list = loadPatients();
  const idx = list.findIndex((x) => x.rut === p.rut);
  if (idx >= 0) list[idx] = p;
  else list.push(p);
  savePatients(list);
}

export function mergeSSRWithClient(ssr: Patient[]): Patient[] {
  const client = loadPatients();
  if (!client.length) return ssr;
  const map = new Map(ssr.map((p) => [p.rut, p]));
  for (const c of client) map.set(c.rut, c);
  return Array.from(map.values());
}
