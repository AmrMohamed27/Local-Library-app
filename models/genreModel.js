const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getAllGenres = async function () {
  return await prisma.genre.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

const getGenre = async function (genreId) {
  return await prisma.genre.findUnique({
    where: {
      id: genreId,
    },
  });
};

const getBooksInGenre = async function (genreId) {
  return await prisma.book.findMany({
    select: {
      title: true,
      summary: true,
      id: true,
    },
    where: {
      genreId: genreId,
    },
  });
};

const genreExists = async function (genreName) {
  return await prisma.genre.findFirst({
    where: {
      name: {
        equals: genreName,
        mode: "insensitive",
      },
    },
  });
};

const createGenre = async function (genreName) {
  return await prisma.genre.create({
    data: {
      name: genreName,
    },
  });
};

const deleteGenre = async function (genreId) {
  return await prisma.genre.delete({
    where: {
      id: genreId,
    },
  });
};
module.exports = {
  getAllGenres,
  getGenre,
  getBooksInGenre,
  genreExists,
  createGenre,
  deleteGenre,
};
