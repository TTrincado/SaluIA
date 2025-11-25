export const formatIsoToLocal = (dateString: string) => {
  const date = new Date(dateString);

  const dateFormatter = new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const formattedDate = dateFormatter.format(date);

  const timeFormatter = new Intl.DateTimeFormat("es-CL", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const formattedTime = timeFormatter.format(date);

  return `${formattedDate} / ${formattedTime}`;
};
