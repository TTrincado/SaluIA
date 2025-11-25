import type { ClinicalAttention } from "../../modules/types";
import { formatIsoToLocal } from "../../modules/utils";
import CopiableItem from "../shared/CopiableItem";
import StatusBadge from "../shared/StatusBadge";
import LinkableCopiableItem from "../shared/LinkableCopiableItem";

export const clinicalAttentionColumns = [
  {
    header: "Created At",
    accessor: "created_at",
    render: (row: ClinicalAttention) =>
      row.created_at ? formatIsoToLocal(row.created_at) : "-",
  },
  {
    header: "ID Episodio",
    accessor: "id",
    render: (row: ClinicalAttention) => (
      <LinkableCopiableItem
        value={row.id}
        displayValue={row.id.slice(-6)}
        toRoute={"/clinical_attentions/details"}
        routeParam={row.id}
        label="ID Episodio copiado"
      />
    ),
  },
  {
    header: "Nombre Paciente",
    accessor: "patient",
    render: (row: ClinicalAttention) =>
      `${row.patient.first_name} ${row.patient.last_name}`,
  },
  {
    header: "RUT Paciente",
    render: (row: ClinicalAttention) => (
      <CopiableItem value={row.patient.rut} label="Rut paciente copiado" />
    ),
  },
  {
    header: "Médico residente",
    accessor: "resident_doctor",
    render: (row: ClinicalAttention) =>
      `${row.resident_doctor.first_name} ${row.resident_doctor.last_name}`,
  },
  {
    header: "Médico supervisor",
    accessor: "supervisor_doctor",
    render: (row: ClinicalAttention) =>
      `${row.supervisor_doctor.first_name} ${row.supervisor_doctor.last_name}`,
  },
  {
    header: "Ley de urgencia",
    accessor: "applies_urgency_law",
    render: (row: ClinicalAttention) => (
      <StatusBadge
        value={row.applies_urgency_law}
        trueLabel="Aplica"
        falseLabel="No aplica"
      />
    ),
  },
  {
    header: "Resultado IA",
    accessor: "ai_result",
    render: (row: ClinicalAttention) => (
      <StatusBadge
        value={row.ai_result}
        trueLabel="Aplica"
        falseLabel="No aplica"
      />
    ),
  },
  {
    header: "Medic approved",
    accessor: "medic_approved",
    render: (row: ClinicalAttention) => (
      <StatusBadge
        value={row.medic_approved}
        trueLabel="true"
        falseLabel="false"
        nullLabel="pending"
      />
    ),
  },
  {
    header: "Updated At",
    accessor: "updated_at",
    render: (row: ClinicalAttention) => formatIsoToLocal(row.updated_at),
  },
];
