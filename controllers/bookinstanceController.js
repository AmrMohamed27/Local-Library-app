const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { formatDate } = require("./functions");

// Display list of all BookInstances.

// Function to get all instances

async function getBookInstances() {
  try {
    const books = await prisma.bookInstance.findMany({
      include: {
        book: true,
      },
    });
    return books;
  } catch (error) {
    console.error("Error getting books:", error);
  } finally {
    await prisma.$disconnect();
  }
}
exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const bookInstances = await getBookInstances();
  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookInstances: bookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  try {
    const bookInstance = await prisma.bookInstance.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    if (bookInstance === null) {
      const err = new Error("BookInstance not found");
      err.status = 404;
      return next(err);
    }
    const book = await prisma.book.findUnique({
      select: {
        title: true,
        id: true,
        summary: true,
        authorId: true,
      },
      where: {
        id: bookInstance.bookId,
      },
    });
    if (book === null) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    const author = await prisma.author.findUnique({
      where: {
        id: book.authorId,
      },
    });
    if (author === null) {
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }
    res.render("bookinstance_detail", {
      title: "Book Instance Detail",
      bookInstance: bookInstance,
      book: book,
      author: author,
      formatDate: formatDate,
    });
  } catch (err) {
    return next(err);
  } finally {
    prisma.$disconnect;
  }
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance create GET");
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance create POST");
});

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance delete GET");
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance delete POST");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
});
