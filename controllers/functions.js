const { DateTime } = require("luxon");
const { PrismaClient, BookStatus } = require("@prisma/client");
const prisma = new PrismaClient();
const formatDate = function (date) {
  return DateTime.fromJSDate(date).toLocaleString(DateTime.DATE_FULL);
};

const toISO8601 = function (date) {
  return DateTime.fromJSDate(date).toISO();
};

const htmlDate = function (date) {
  return DateTime.fromJSDate(date).toFormat("yyyy-MM-dd");
};

const calculateAge = function (dateOfBirth, dateOfDeath = new Date()) {
  const dob = new Date(dateOfBirth);
  const dod = new Date(dateOfDeath);
  const diffInMilliseconds = Math.abs(dod - dob);
  const years = diffInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
  return Math.floor(years);
};

const allBooks = async function () {
  return await prisma.book.findMany({
    orderBy: {
      title: "asc",
    },
  });
};
const statusList = async function () {
  let statuses = [];
  for (const key in BookStatus) {
    statuses.push(BookStatus[key]);
  }
  return statuses;
};

module.exports = {
  formatDate,
  calculateAge,
  htmlDate,
  allBooks,
  statusList,
  toISO8601,
};
