require("dotenv").config();

extractTimeFromSQL = (dateObj) => {
  if (!(dateObj instanceof Date)) return null;

  const hours = String(dateObj.getUTCHours()).padStart(2, "0");
  const minutes = String(dateObj.getUTCMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

combineSQLDateTime = (sqlDateObj, sqlTimeObj) => {
  // tạo date-time theo local time, KHÔNG QUA UTC
  const y = sqlDateObj.getUTCFullYear();
  const m = sqlDateObj.getUTCMonth();
  const d = sqlDateObj.getUTCDate();

  const h = sqlTimeObj.getUTCHours();
  const min = sqlTimeObj.getUTCMinutes();

  // Tạo datetime *local* bằng UTC values
  return new Date(Date.UTC(y, m, d, h, min));
}

// Date object để tính toán (logic)
buildDateObject = (dateVal, timeVal) => {
  if (!dateVal || !timeVal) return null;

  const [year, month, day] = dateVal.split("-").map(Number);
  const [h, m] = timeVal.split(":").map(Number);

  // tạo local datetime, KHÔNG bị UTC shift
  return new Date(Date.UTC(year, month - 1, day, h, m, 0));
};

isOverlapWithBuffer = (newStart, newEnd, existingStart, existingEnd, bufferHours = 2) => {
    const bufferMs = bufferHours * 60 * 60 * 1000;

    const existingEndWithBuffer = existingEnd.getTime() + bufferMs;

    return (
        newStart < existingEndWithBuffer &&
        newEnd >= existingStart
    );
}

module.exports = {
  buildDateObject,
  extractTimeFromSQL,
  combineSQLDateTime,
  isOverlapWithBuffer
};

