const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { formatDate, htmlDate } = require("./functions");
const { body, validationResult } = require("express-validator");
const bookModel = require("../models/bookModel.js");
const bookInstanceModel = require("../models/bookInstancesModel.js");
const authorModel = require("../models/authorModel.js");
const genreModel = require("../models/genreModel.js");

// Display list of all BookInstances.

// Function to get all instances

exports.bookinstance_list = asyncHandler(async (req, res, next) => {
  const bookInstances = await bookInstanceModel.getAllBookInstances();
  res.render("bookinstance_list", {
    title: "Book Instance List",
    bookInstances: bookInstances,
  });
});

// Display detail page for a specific BookInstance.
exports.bookinstance_detail = asyncHandler(async (req, res, next) => {
  const bookInstance = await bookInstanceModel.getBookInstance(
    parseInt(req.params.id)
  );
  if (bookInstance === null) {
    const err = new Error("BookInstance not found");
    err.status = 404;
    return next(err);
  }
  const book = await bookModel.getBook(bookInstance.bookId);
  if (book === null) {
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }
  const author = await authorModel.getAuthor(book.authorId);
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
});

// Display BookInstance create form on GET.
exports.bookinstance_create_get = asyncHandler(async (req, res, next) => {
  res.render("bookinstance_form", {
    title: "Create Book Instance",
    bookList: await bookModel.getAllBooks(),
    statusList: await bookInstanceModel.statusList(),
  });
});

// Handle BookInstance create on POST.
exports.bookinstance_create_post = [
  body("book")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Book is required"),
  body("status").escape(),
  body("dueBack")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate()
    .withMessage("Invalid Date"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const bookInstanceData = {
      book: parseInt(req.body.book),
      status: req.body.status,
      dueBack: htmlDate(req.body.dueBack),
    };

    if (!errors.isEmpty()) {
      res.render("bookinstance_form", {
        title: "Create Book Instance",
        bookList: await bookModel.getAllBooks(),
        data: bookInstanceData,
        errors: errors.array(),
        statusList: await bookInstanceModel.statusList(),
      });
      return;
    } else {
      const bookInstance = await bookInstanceModel.createBookInstance(
        bookInstanceData,
        req.body.dueBack
      );
      res.redirect(`/catalog/bookinstance/${bookInstance.id}`);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await bookInstanceModel.getBookInstance(
    parseInt(req.params.id)
  );
  const book = await bookModel.getBook(bookInstance.bookId);
  const author = await authorModel.getAuthor(book.authorId);
  if (!bookInstance || !book || !author) {
    res.redirect("/catalog/bookinstances");
  }
  res.render("bookinstance_delete", {
    title: "Delete Book Instance",
    bookInstance: bookInstance,
    book: book,
    author: author,
    formatDate: formatDate,
  });
});

// Handle BookInstance delete on POST.
exports.bookinstance_delete_post = asyncHandler(async (req, res, next) => {
  const bookInstance = await bookInstanceModel.getBookInstance(
    parseInt(req.body.bookInstanceId)
  );
  if (!bookInstance) {
    res.redirect("/catalog/bookinstances");
  }
  await bookInstanceModel.deleteBookInstance(bookInstance.id);
  res.redirect("/catalog/bookinstances");
});

// Display BookInstance update form on GET.
exports.bookinstance_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update GET");
});

// Handle bookinstance update on POST.
exports.bookinstance_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: BookInstance update POST");
});
