const { PrismaClient, BookStatus } = require("@prisma/client");
const prisma = new PrismaClient();

const getBookInstance = async function (Id) {
  return await prisma.bookInstance.findUnique({
    where: {
      id: Id,
    },
  });
};

const getAllBookInstances = async function () {
  return await prisma.bookInstance.findMany({
    include: {
      book: true,
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

const createBookInstance = async function (bookInstanceData, dueBack) {
  return await prisma.bookInstance.create({
    data: {
      status: bookInstanceData.status,
      bookId: bookInstanceData.book,
      dueBack: dueBack ? dueBack : null,
    },
  });
};

const deleteBookInstance = async function (Id) {
  return await prisma.bookInstance.delete({
    where: {
      id: Id,
    },
  });
};

const updateBookInstance = async function (data, dueBack) {
  console.log(data);
  return await prisma.bookInstance.update({
    where: {
      id: data.id,
    },
    data: {
      status: data.status,
      bookId: data.bookId,
      dueBack: dueBack ? dueBack : null,
    },
  });
};
module.exports = {
  getBookInstance,
  getAllBookInstances,
  statusList,
  createBookInstance,
  deleteBookInstance,
  updateBookInstance,
};
