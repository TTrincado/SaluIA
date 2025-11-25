export default function StatusBadge({
  value,
  trueLabel = "Sí",
  falseLabel = "No",
  nullLabel = "Pendiente",
}) {
  const statusConfig = {
    positive: {
      style: "bg-green-400/20 text-green-400 border border-green-400/10",
      label: trueLabel,
    },
    negative: {
      style: "bg-red-400/20 text-red-400 border border-red-400/10",
      label: falseLabel,
    },
    neutral: {
      style: "bg-white/10 text-white/70 border border-white/5",
      label: nullLabel,
    },
  };

  let currentConfig;

  if (value === true) {
    currentConfig = statusConfig.positive;
  } else if (value === false) {
    currentConfig = statusConfig.negative;
  } else {
    currentConfig = statusConfig.neutral;
  }

  return (
    <span
      className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-md text-xs font-medium ${currentConfig.style}`}
    >
      {currentConfig.label}
    </span>
  );
}
