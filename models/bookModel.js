const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const getBook = async function (bookId) {
  return await prisma.book.findUnique({
    where: {
      id: bookId,
    },
  });
};

const getAllBooks = async function () {
  return await prisma.book.findMany({
    include: {
      author: {
        select: {
          firstName: true,
          familyName: true,
        },
      },
      genre: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      title: "asc",
    },
  });
};

const getBookAuthor = async function (bookId) {
  const book = getBook(bookId);
  return await prisma.author.findUnique({
    where: {
      id: book.authorId,
    },
  });
};
const getBookGenre = async function (bookId) {
  const book = getBook(bookId);
  return await prisma.genre.findUnique({
    where: {
      id: book.authorId,
    },
  });
};

const createBook = async function (bookData) {
  return await prisma.book.create({
    data: {
      title: bookData.title,
      author: {
        connect: {
          id: parseInt(bookData.author),
        },
      },
      summary: bookData.summary,
      isbn: bookData.isbn,
      genre: {
        connect: {
          id: parseInt(bookData.genre),
        },
      },
    },
  });
};

const bookExists = async function (isbn, title, summary) {
  return await prisma.book.findFirst({
    where: {
      isbn: isbn,
      title: title,
      summary: summary,
    },
  });
};

const bookCopies = async function (bookId) {
  return await prisma.bookInstance.findMany({
    where: {
      bookId: bookId,
    },
  });
};

const deleteBook = async function (bookId) {
  return await prisma.book.delete({
    where: {
      id: bookId,
    },
  });
};

module.exports = {
  getBookAuthor,
  getBookGenre,
  getBook,
  getAllBooks,
  createBook,
  bookExists,
  bookCopies,
  deleteBook,
};
