const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { DateTime } = require("luxon");
const { body, validationResult } = require("express-validator");
const { formatDate } = require("./functions.js");
const bookModel = require("../models/bookModel.js");
const bookInstanceModel = require("../models/bookInstancesModel.js");
const authorModel = require("../models/authorModel.js");
const genreModel = require("../models/genreModel.js");

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
});

// Display list of all books.

exports.book_list = asyncHandler(async (req, res, next) => {
  const books = await bookModel.getAllBooks();
  res.render("book_list", {
    title: "Book List",
    books: books,
  });
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  try {
    const book = await bookModel.getBook(parseInt(req.params.id));
    if (book === null) {
      const err = new Error("Book not found");
      err.status = 404;
      return next(err);
    }
    const bookInstances = await bookModel.bookCopies(book.id);
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

    const authorOfBook = await authorModel.getAuthor(book.authorId);
    if (authorOfBook === null) {
      const err = new Error("Book Author not found");
      err.status = 404;
      return next(err);
    }
    const genreOfBook = await genreModel.getGenre(book.genreId);
    res.render("book_detail", {
      book: book,
      bookInstances: bookInstances,
      author: authorOfBook,
      genre: genreOfBook,
    });
  } catch (err) {
    return next(err);
  } finally {
  }
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  const [allAuthors, allGenres] = await Promise.all([
    authorModel.getAllAuthors(),
    genreModel.getAllGenres(),
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
        authorModel.getAllAuthors(),
        genreModel.getAllGenres(),
      ]);
      res.render("book_form", {
        title: "Create Book",
        book: bookData,
        authors: allAuthors,
        genres: allGenres,
      });
    } else {
      const bookExists = await bookModel.bookExists(
        bookData.isbn,
        bookData.title,
        bookData.summary
      );
      if (bookExists) {
        res.redirect(`/catalog/book/${bookExists.id}`);
      } else {
        const createdBook = await bookModel.createBook(bookData);
        res.redirect(`/catalog/book/${createdBook.id}`);
      }
    }
  }),
];

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  const book = await bookModel.getBook(parseInt(req.params.id));
  if (!book) {
    res.redirect("/catalog/books");
  }
  const author = await authorModel.getAuthor(book.authorId);
  const genre = await genreModel.getGenre(book.genreId);
  const bookInstances = await bookModel.bookCopies(book.id);
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
  const book = await bookModel.getBook(parseInt(req.body.bookId));
  const author = await authorModel.getAuthor(book.authorId);
  const genre = await genreModel.getGenre(book.genreId);
  const bookInstances = await bookModel.bookCopies(book.id);
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
  await bookModel.deleteBook(book.id);
  res.redirect("/catalog/books");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  const book = await bookModel.getBook(parseInt(req.params.id));
  res.render("book_form", { title: "Update Book", book: book });
});

// Handle book update on POST.
exports.book_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Book update POST");
});
