// convert 24 hour time to 12 hour time
export const convertTime = (time: string) => {
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours);
  const minute = parseInt(minutes);
  const ampm = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, "0")} ${ampm}`;
};
