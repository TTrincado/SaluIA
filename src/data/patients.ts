export type Patient = {
  name: string;
  rut: string;
  age: number;
  urgent: boolean;
  presentFirst: boolean;
  vitals: string;
  doctor: string;
};

export const patients: Patient[] = [
  {
    name: "Ari Satou",
    rut: "11.111.111-1",
    age: 33,
    urgent: false,
    presentFirst: true,
    vitals: "Estable",
    doctor: "Marco Muñoz",
  },
  {
    name: "Ángela Ramos",
    rut: "22.222.222-2",
    age: 47,
    urgent: true,
    presentFirst: true,
    vitals: "Estable",
    doctor: "Marco Muñoz",
  },
  {
    name: "Ashton Cox",
    rut: "33.333.333-3",
    age: 66,
    urgent: true,
    presentFirst: true,
    vitals: "Estable",
    doctor: "Marco Muñoz",
  },
  {
    name: "Bradley Greer",
    rut: "44.444.444-4",
    age: 41,
    urgent: false,
    presentFirst: true,
    vitals: "Estable",
    doctor: "Marco Muñoz",
  },
  {
    name: "Brenden Wagner",
    rut: "55.555.555-5",
    age: 28,
    urgent: false,
    presentFirst: true,
    vitals: "Estable",
    doctor: "Marco Muñoz",
  },
  {
    name: "Brielle Williamson",
    rut: "66.666.666-6",
    age: 61,
    urgent: true,
    presentFirst: true,
    vitals: "Estable",
    doctor: "Marco Muñoz",
  },
  {
    name: "Bruno Nash",
    rut: "77.777.777-7",
    age: 38,
    urgent: false,
    presentFirst: true,
    vitals: "Estable",
    doctor: "Marco Muñoz",
  },
  {
    name: "Caesar Vance",
    rut: "88.888.888-8",
    age: 21,
    urgent: true,
    presentFirst: true,
    vitals: "Estable",
    doctor: "Marco Muñoz",
  },
  {
    name: "Cara Stevens",
    rut: "99.999.999-9",
    age: 46,
    urgent: false,
    presentFirst: true,
    vitals: "Estable",
    doctor: "Marco Muñoz",
  },
  {
    name: "Cedric Kelly",
    rut: "10.555.333-1",
    age: 22,
    urgent: true,
    presentFirst: true,
    vitals: "Estable",
    doctor: "Marco Muñoz",
  },
];
