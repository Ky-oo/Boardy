export const formatDate = (date: string | null | undefined) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatTime = (date: string | null | undefined) => {
  if (!date) return "";
  return new Date(date).toLocaleTimeString("fr-FR", {
    hour: "numeric",
    minute: "numeric",
  });
};
