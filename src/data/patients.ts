export type Patient = {
  name: string;
  rut: string;
  email: string;
  age: number;
  urgent: boolean; // aplica ley de urgencia
};

export const patients: Patient[] = [
  { name: "Ari Satou", rut: "11.111.111-1", email: "ari@example.com", age: 33, urgent: false },
  { name: "Ángela Ramos", rut: "22.222.222-2", email: "angela@example.com", age: 47, urgent: true },
  { name: "Ashton Cox", rut: "33.333.333-3", email: "ashton@example.com", age: 66, urgent: true },
  { name: "Bradley Greer", rut: "44.444.444-4", email: "bradley@example.com", age: 41, urgent: false },
  { name: "Brenden Wagner", rut: "55.555.555-5", email: "brenden@example.com", age: 28, urgent: false },
  { name: "Brielle Williamson", rut: "66.666.666-6", email: "brielle@example.com", age: 61, urgent: true },
  { name: "Bruno Nash", rut: "77.777.777-7", email: "bruno@example.com", age: 38, urgent: false },
  { name: "Caesar Vance", rut: "88.888.888-8", email: "caesar@example.com", age: 21, urgent: true },
  { name: "Cara Stevens", rut: "99.999.999-9", email: "cara@example.com", age: 46, urgent: false },
  { name: "Cedric Kelly", rut: "10.555.333-1", email: "cedric@example.com", age: 22, urgent: true },
];
