const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { DateTime } = require("luxon");

exports.index = asyncHandler(async (req, res, next) => {
  const bookCount = await prisma.book.count();
  const bookInstanceCount = await prisma.bookInstance.count();
  const authorCount = await prisma.author.count();
  const genreCount = await prisma.genre.count();
  const availableCount = await prisma.bookInstance.count({
    where: {
      status: "AVAILABLE",
    },
  });
  res.render("index", {
    title: "Local Library Home",
    book_count: bookCount,
    author_count: authorCount,
    genre_count: genreCount,
    book_instance_count: bookInstanceCount,
    available_count: availableCount,
  });
  await prisma.$disconnect;
});

// Display list of all books.

// Function to get the books
async function getBooks() {
  try {
    const books = await prisma.book.findMany({
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
    return books;
  } catch (error) {
    console.error("Error getting books:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exports.book_list = asyncHandler(async (req, res, next) => {
  const books = await getBooks();
  res.render("book_list", {
    title: "Book List",
    books: books,
  });
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  try {
    const book = await prisma.book.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    if (book === null) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    await prisma.bookInstance.updateMany({
      where: {
        dueBack: null,
      },
      data: {
        dueBack: new Date(),
      },
    });
    const bookInstances = await prisma.bookInstance.findMany({
      where: {
        bookId: parseInt(req.params.id),
      },
    });
    if (bookInstances === null) {
      const err = new Error("Book Instances not found");
      err.status = 404;
      return next(err);
    }
    bookInstances.forEach((bookie, index, arr) => {
      arr[index].dueBack = DateTime.fromJSDate(bookie.dueBack).toLocaleString(
        DateTime.DATETIME_MED
      );
    });

    const authorOfBook = await prisma.author.findUnique({
      where: {
        id: parseInt(book.authorId),
      },
    });
    if (authorOfBook === null) {
      const err = new Error("Book Author not found");
      err.status = 404;
      return next(err);
    }
    const genreOfBook = await prisma.genre.findUnique({
      where: {
        id: parseInt(book.genreId),
      },
    });
    res.render("book_detail", {
      book: book,
      bookInstances: bookInstances,
      author: authorOfBook,
      genre: genreOfBook,
    });
  } catch (err) {
    return next(err);
  } finally {
    prisma.$disconnect;
  }
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create GET");
});

// Handle book create on POST.
exports.book_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book create POST");
});

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete GET");
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book delete POST");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});
