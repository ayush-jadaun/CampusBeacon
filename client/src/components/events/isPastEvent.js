/** True when the event's date is in the past. */
const isPastEvent = (event) => {
  if (!event?.date) return false;
  const d = new Date(event.date);
  return !isNaN(d.getTime()) && d < new Date();
};

export default isPastEvent;
