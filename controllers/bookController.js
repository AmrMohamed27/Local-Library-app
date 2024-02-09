const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { DateTime } = require("luxon");
const { body, validationResult } = require("express-validator");
const { formatDate } = require("./functions.js");

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
  const [allAuthors, allGenres] = await Promise.all([
    prisma.author.findMany(),
    prisma.genre.findMany(),
  ]);
  res.render("book_form", {
    title: "Create Book",
    authors: allAuthors,
    genres: allGenres,
  });
});

// Handle book create on POST.
exports.book_create_post = [
  body("title")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Book title must not be empty"),
  body("genre").escape(),
  body("summary")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Book summary must not be empty"),
  body("isbn")
    .trim()
    .isLength({ min: 13, max: 13 })
    .isNumeric()
    .withMessage("Book ISBN must contain 13 digits"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const bookData = {
      title: req.body.title,
      author: req.body.author,
      genre: req.body.genre,
      summary: req.body.summary,
      isbn: req.body.isbn,
    };
    if (!errors.isEmpty()) {
      const [allAuthors, allGenres] = await Promise.all([
        prisma.author.findMany(),
        prisma.genre.findMany(),
      ]);
      res.render("book_form", {
        title: "Create Book",
        book: bookData,
        authors: allAuthors,
        genres: allGenres,
      });
    } else {
      const bookExists = await prisma.book.findFirst({
        where: {
          isbn: bookData.isbn,
        },
      });
      if (bookExists) {
        res.redirect(`/catalog/book/${bookExists.id}`);
      } else {
        const createdBook = await prisma.book.create({
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
        res.redirect(`/catalog/book/${createdBook.id}`);
      }
    }
  }),
];

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  const book = await prisma.book.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  });
  if (!book) {
    res.redirect("/catalog/books");
  }
  const author = await prisma.author.findUnique({
    where: {
      id: book.authorId,
    },
  });
  const genre = await prisma.genre.findUnique({
    where: {
      id: book.genreId,
    },
  });
  const bookInstances = await prisma.bookInstance.findMany({
    where: {
      bookId: book.id,
    },
  });
  res.render("book_delete", {
    title: "Delete Book",
    book: book,
    genre: genre,
    author: author,
    bookInstances: bookInstances,
    formatDate: formatDate,
  });
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  const book = await prisma.book.findUnique({
    where: {
      id: parseInt(req.body.bookId),
    },
  });
  const author = await prisma.author.findUnique({
    where: {
      id: book.authorId,
    },
  });
  const genre = await prisma.genre.findUnique({
    where: {
      id: book.genreId,
    },
  });
  const bookInstances = await prisma.bookInstance.findMany({
    where: {
      bookId: book.id,
    },
  });
  if (!book || !author || !genre) {
    res.redirect("/catalog/books");
  }
  if (bookInstances.length > 0) {
    res.render("book_delete", {
      title: "Delete Book",
      book: book,
      genre: genre,
      author: author,
      bookInstances: bookInstances,
      formatDate: formatDate,
    });
  }
  await prisma.book.delete({
    where: {
      id: book.id,
    },
  });
  res.redirect("/catalog/books");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update GET");
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});
