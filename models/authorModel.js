const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllAuthors = async function () {
  return await prisma.author.findMany({
    orderBy: {
      firstName: "asc",
    },
  });
};

const getAuthor = async function (authorId) {
  return await prisma.author.findUnique({
    where: {
      id: authorId,
    },
  });
};

const booksByAuthor = async function (authorId) {
  return await prisma.book.findMany({
    select: {
      title: true,
      summary: true,
      id: true,
    },
    where: {
      authorId: authorId,
    },
  });
};

const authorExists = async function (firstName, familyName) {
  return await prisma.author.findFirst({
    where: {
      AND: [
        {
          firstName: {
            equals: firstName,
            mode: "insensitive",
          },
        },
        {
          familyName: {
            equals: familyName,
            mode: "insensitive",
          },
        },
      ],
    },
  });
};

const deleteAuthor = async function (authorId) {
  return await prisma.author.delete({
    where: {
      id: authorId,
    },
  });
};
const createAuthor = async function (authorData, dateOfBirth, dateOfDeath) {
  return await prisma.author.create({
    data: {
      firstName: authorData.firstName,
      familyName: authorData.familyName,
      dateOfBirth: dateOfBirth,
      dateOfDeath: dateOfDeath ? dateOfDeath : null,
    },
  });
};

module.exports = {
  getAllAuthors,
  getAuthor,
  booksByAuthor,
  authorExists,
  deleteAuthor,
  createAuthor,
};
