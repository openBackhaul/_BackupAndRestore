import { DateTime } from "luxon";

const SYSTEM_TIMEZONE = "UTC";

function getServerTime() {
  return DateTime.utc();
}

/**
 * Get user's local timezone with abbreviation
 * @returns {object} { name: 'Asia/Kolkata', abbr: 'IST', offset: '+05:30' }
 */
function getUserTimezone() {
  const dt = DateTime.local();
  return {
    name: dt.zoneName,
    abbr: dt.offsetNameShort,
    offset: dt.toFormat("ZZ"),
  };
}

function formatDateTime(isoString, options = {}) {
  if (!isoString || isoString === "-") return "-";

  const {
    showBothTimezones = false,
    format = "DATETIME_MED",
    showTimezone = true,
  } = options;

  let dt;
  if (isoString instanceof Date) {
    dt = DateTime.fromJSDate(isoString);
  } else {
    dt = DateTime.fromISO(isoString);
  }

  if (!dt.isValid) return "-";

  const formatted = dt.toLocaleString(DateTime[format]);

  if (showTimezone === false) {
    return formatted;
  }

  if (showBothTimezones) {
    const localDt = dt.toLocal();
    const localTime = localDt.toLocaleString(DateTime.TIME_SIMPLE);
    const localTz = localDt.offsetNameShort;
    return `${formatted} (Local: ${localTime} ${localTz})`;
  }

  const offset = dt.toFormat("ZZ");
  return `${formatted}`;
}

function formatDate(isoString) {
  if (!isoString || isoString === "-") return "-";

  const dt = DateTime.fromISO(isoString);
  return dt.isValid ? dt.toLocaleString(DateTime.DATE_MED) : "-";
}

function formatTime(isoString, showTimezone = false) {
  if (!isoString || isoString === "-") return "-";

  const dt = DateTime.fromISO(isoString);
  if (!dt.isValid) return "-";

  const time = dt.toLocaleString(DateTime.TIME_24_SIMPLE);
  return showTimezone ? `${time} ${dt.offsetNameShort}` : time;
}

/**
 * Convert local datetime input to UTC for storage
 * @param {string} dateString - Date string (YYYY-MM-DD)
 * @param {string} timeString - Time string (HH:MM)
 * @param {string} timezone - Source timezone (default: user's local)
 * @returns {string} ISO string in UTC
 */
function localToUTC(dateString, timeString, timezone = null) {
  const tz = timezone || getUserTimezone().name;
  const dt = DateTime.fromISO(`${dateString}T${timeString}`, { zone: tz });
  return dt.toUTC().toISO();
}

/**
 * Convert UTC to local datetime for input fields
 * @param {string} isoString - ISO string in UTC
 * @returns {object} { date: 'YYYY-MM-DD', time: 'HH:MM', timezone: 'America/New_York' }
 */
function utcToLocal(isoString) {
  if (!isoString) return { date: "", time: "", timezone: getUserTimezone() };

  const dt = DateTime.fromISO(isoString, { zone: SYSTEM_TIMEZONE }).toLocal();

  return {
    date: dt.toISODate(),
    time: dt.toFormat("HH:mm"),
    timezone: dt.zoneName,
  };
}

function getServerTimeInfo() {
  const now = getServerTime();
  return {
    datetime: now.toISO(),
    formatted: now.toLocaleString(DateTime.DATETIME_MED_WITH_SECONDS),
    date: now.toLocaleString(DateTime.DATE_MED),
    time: now.toLocaleString(DateTime.TIME_24_WITH_SECONDS),
    timezone: SYSTEM_TIMEZONE,
    timestamp: now.toMillis(),
  };
}

function calculateNextRun(cronExpression) {
  try {
    return null;
  } catch (error) {
    return null;
  }
}

function isFutureTime(isoString) {
  const dt = DateTime.fromISO(isoString, { zone: SYSTEM_TIMEZONE });
  const now = getServerTime();
  return dt > now;
}

function getTimeDifference(isoString) {
  if (!isoString || isoString === "-") return "-";

  const dt = DateTime.fromISO(isoString, { zone: SYSTEM_TIMEZONE });
  const now = getServerTime();

  return dt.toRelative({ base: now });
}

/**
 * Normalize timezone value - converts GMT+5:30 format to abbreviation like IST
 * If already in abbreviation format, returns as-is
 * @param {string} tzValue - Timezone value to normalize (e.g., "GMT+5:30", "IST", "Asia/Kolkata")
 * @returns {string} Timezone abbreviation (e.g., "IST", "UTC", "CET")
 */
function normalizeTimezone(tzValue) {
  const userTz = getUserTimezone();
  if (!tzValue) return userTz.abbr || "UTC";

  if (/^[A-Z]{2,5}$/.test(tzValue)) {
    return tzValue;
  }

  const offsetToAbbr = {
    "+05:30": "IST",
    "+00:00": "UTC",
    "+01:00": "CET",
    "+02:00": "EET",
    "+03:00": "MSK",
    "+04:00": "GST",
    "+05:00": "PKT",
    "+06:00": "BST",
    "+07:00": "ICT",
    "+08:00": "SGT",
    "+09:00": "JST",
    "+10:00": "AEST",
    "+11:00": "SBT",
    "+12:00": "NZST",
    "-05:00": "EST",
    "-06:00": "CST",
    "-07:00": "MST",
    "-08:00": "PST",
    "-09:00": "AKST",
    "-10:00": "HST",
    "-03:00": "ART",
    "-04:00": "AST",
  };

  const gmtMatch = tzValue.match(/^GMT([+-])(\d{1,2}):(\d{2})$/);
  if (gmtMatch) {
    const sign = gmtMatch[1];
    const hours = gmtMatch[2].padStart(2, "0");
    const mins = gmtMatch[3];
    const normalizedOffset = `${sign}${hours}:${mins}`;

    if (offsetToAbbr[normalizedOffset]) {
      return offsetToAbbr[normalizedOffset];
    }
  }

  try {
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const ianaToAbbr = {
      "Asia/Kolkata": "IST",
      "Asia/Calcutta": "IST",
      "Europe/London": "GMT",
      "Europe/Paris": "CET",
      "Europe/Berlin": "CET",
      "America/New_York": "EST",
      "America/Chicago": "CST",
      "America/Denver": "MST",
      "America/Los_Angeles": "PST",
      "Asia/Tokyo": "JST",
      "Asia/Shanghai": "CST",
      "Asia/Singapore": "SGT",
      "Australia/Sydney": "AEST",
      "Pacific/Auckland": "NZST",
    };

    if (ianaToAbbr[timeZone]) {
      return ianaToAbbr[timeZone];
    }
  } catch (error) {}
  return "UTC";
}

export {
  SYSTEM_TIMEZONE,
  getServerTime,
  getUserTimezone,
  normalizeTimezone,
  formatDateTime,
  formatDate,
  formatTime,
  localToUTC,
  utcToLocal,
  getServerTimeInfo,
  calculateNextRun,
  isFutureTime,
  getTimeDifference,
};

export default {
  SYSTEM_TIMEZONE,
  getServerTime,
  getUserTimezone,
  normalizeTimezone,
  formatDateTime,
  formatDate,
  formatTime,
  localToUTC,
  utcToLocal,
  getServerTimeInfo,
  calculateNextRun,
  isFutureTime,
  getTimeDifference,
};
