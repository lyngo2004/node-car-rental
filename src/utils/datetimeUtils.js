exports.combineDateTime = (dateVal, timeVal) => {
  if (!dateVal || !timeVal) return null;

  // timeVal SQL Server (TIME) → có thể là: "10:00:00", "10:00:00.0000000"
  if (typeof timeVal !== "string") {
    // convert từ Date object
    timeVal = new Date(timeVal).toISOString().substring(11, 19);
  }

  // Chuẩn hóa về HH:mm
  if (/^\d{2}:\d{2}:\d{2}/.test(timeVal)) {
    timeVal = timeVal.substring(0, 5);   // "10:00:00" → "10:00"
  }

  // Validate HH:mm
  if (!/^\d{2}:\d{2}$/.test(timeVal)) {
    throw new Error(`Invalid time format: ${timeVal}. Expected HH:mm`);
  }

  const [h, m] = timeVal.split(":");

  const date = new Date(dateVal);
  date.setHours(Number(h), Number(m), 0, 0);

  return date;
};

exports.isOverlapWithBuffer = (newStart, newEnd, existingStart, existingEnd, bufferHours = 2) => {
  const bufferMs = bufferHours * 60 * 60 * 1000;

  const existingEndWithBuffer = new Date(existingEnd.getTime() + bufferMs);

  return !(newEnd <= existingStart || newStart >= existingEndWithBuffer);
};
