const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
  formatDate,
  htmlDate,
  allBooks,
  statusList,
  toISO8601,
} = require("./functions");
const { body, validationResult } = require("express-validator");

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
  res.render("bookinstance_form", {
    title: "Create Book Instance",
    bookList: await allBooks(),
    statusList: await statusList(),
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
        bookList: await allBooks(),
        data: bookInstanceData,
        errors: errors.array(),
        statusList: await statusList(),
      });
      return;
    } else {
      const bookInstance = await prisma.bookInstance.create({
        data: {
          status: bookInstanceData.status,
          bookId: bookInstanceData.book,
          dueBack: req.body.dueBack,
        },
      });
      res.redirect(`/catalog/bookinstance/${bookInstance.id}`);
    }
  }),
];

// Display BookInstance delete form on GET.
exports.bookinstance_delete_get = asyncHandler(async (req, res, next) => {
  const bookInstance = await prisma.bookInstance.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  });
  const book = await prisma.book.findUnique({
    where: {
      id: bookInstance.bookId,
    },
  });
  const author = await prisma.author.findUnique({
    where: {
      id: book.authorId,
    },
  });
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
  const bookInstance = await prisma.bookInstance.findUnique({
    where: {
      id: parseInt(req.body.bookInstanceId),
    },
  });
  if (!bookInstance) {
    res.redirect("/catalog/bookinstances");
  }
  await prisma.bookInstance.delete({
    where: {
      id: bookInstance.id,
    },
  });
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
