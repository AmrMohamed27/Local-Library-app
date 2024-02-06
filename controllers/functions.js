const { DateTime } = require("luxon");

const formatDate = function (date) {
  return DateTime.fromJSDate(date).toLocaleString(DateTime.DATETIME_MED);
};

const calculateAge = function (dateOfBirth, dateOfDeath = new Date()) {
  const dob = new Date(dateOfBirth);
  const dod = new Date(dateOfDeath);
  const diffInMilliseconds = Math.abs(dod - dob);
  const years = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(years);
};
module.exports = { formatDate, calculateAge };
