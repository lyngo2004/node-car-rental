const normalizeSQLTime = (t) => {
  if (!t) return null;
  t = String(t).trim();

  // "6:00" -> "06:00"
  if (/^\d:\d{2}$/.test(t)) t = "0" + t;

  // "HH:mm" -> "HH:mm:00"
  if (/^\d{2}:\d{2}$/.test(t)) return `${t}:00`;

  // "HH:mm:ss"
  if (/^\d{2}:\d{2}:\d{2}$/.test(t)) return t;

  throw new Error(`Invalid TIME format: ${t}`);
};

exports.normalizeSQLTime = normalizeSQLTime;


// Date object để tính toán (logic)
exports.buildDateObject = (dateVal, timeVal) => {
  if (!dateVal || !timeVal) return null;

  const [year, month, day] = dateVal.split("-").map(Number);
  const [h, m] = timeVal.split(":").map(Number);

  // tạo local datetime, KHÔNG bị UTC shift
  return new Date(year, month - 1, day, h, m, 0);
};




// === TRẢ VỀ STRING CHO SQL, KHÔNG TRẢ VỀ DATE OBJECT ===
exports.combineDateTime = (dateVal, timeVal) => {
  if (!dateVal || !timeVal) return null;

  const time = normalizeSQLTime(timeVal);   // HH:mm:ss
  return `${dateVal} ${time}`;              // ví dụ: "2025-12-10 13:00:00"
};


// Check overlap (giữ nguyên vì logic đúng)
exports.isOverlapWithBuffer = (newStart, newEnd, existingStart, existingEnd, bufferHours = 2) => {
  const bufferMs = bufferHours * 60 * 60 * 1000;
  const existingEndWithBuffer = new Date(existingEnd.getTime() + bufferMs);

  return !(newEnd <= existingStart || newStart >= existingEndWithBuffer);
};
