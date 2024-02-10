const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { formatDate, calculateAge, htmlDate } = require("./functions");
const { body, validationResult } = require("express-validator");
const authorModel = require("../models/authorModel.js");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const authors = await authorModel.getAllAuthors();
  res.render("author_list", {
    title: "Author List",
    authors: authors,
    calculateAge: calculateAge,
  });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  try {
    const author = await authorModel.getAuthor(parseInt(req.params.id));
    if (author === null) {
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }
    const booksByAuthor = await authorModel.booksByAuthor(author.id);
    res.render("author_detail", {
      title: "Author Detail",
      author: author,
      books: booksByAuthor,
      calculateAge: calculateAge,
      formatDate: formatDate,
    });
  } catch (err) {
    return next(err);
  } finally {
    prisma.$disconnect;
  }
});

// Display Author create form on GET.
exports.author_create_get = (req, res, next) => {
  res.render("author_form", { title: "Create Author" });
};

// Handle Author create on POST.
exports.author_create_post = [
  body("firstName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Please enter a valid first name")
    .isAlpha()
    .withMessage("Please enter a first name that only containers letters"),
  body("familyName")
    .trim()
    .isLength({ min: 1 })
    .escape()
    .withMessage("Please enter a valid family name")
    .isAlpha()
    .withMessage("Please enter a family name that only containers letters"),
  body("dateOfBirth")
    .trim()
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate()
    .withMessage("Please enter a valid date of birth"),
  body("dateOfDeath")
    .trim()
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate()
    .withMessage("Please enter a valid date of death"),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const authorData = {
      firstName: req.body.firstName,
      familyName: req.body.familyName,
      dateOfBirth: htmlDate(req.body.dateOfBirth),
      dateOfDeath: htmlDate(req.body.dateOfDeath),
    };
    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author: authorData,
        errors: errors.array(),
      });
    } else {
      const authorExists = authorModel.authorExists(
        authorData.firstName,
        authorData.familyName
      );
      if (authorExists) {
        res.redirect(`/catalog/author/${authorExists.id}`);
      } else {
        const createdAuthor = await prisma.author.create({
          data: {
            firstName: authorData.firstName,
            familyName: authorData.familyName,
            dateOfBirth: req.body.dateOfBirth,
            dateOfDeath: req.body.dateOfDeath ? req.body.dateOfDeath : null,
          },
        });
        res.redirect(`/catalog/author/${createdAuthor.id}`);
      }
    }
  }),
];

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const author = await authorModel.getAuthor(parseInt(req.params.id));
  if (!author) {
    res.redirect("/catalog/authors");
  }
  const booksByAuthor = await authorModel.booksByAuthor(author.id);
  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    books: booksByAuthor,
    formatDate: formatDate,
    calculateAge: calculateAge,
  });
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  const author = await authorModel.getAuthor(parseInt(req.body.authorId));
  if (!author) {
    res.redirect("/catalog/authors");
  }
  const booksByAuthor = await authorModel.booksByAuthor(author.id);
  if (booksByAuthor.length > 0) {
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      books: booksByAuthor,
      formatDate: formatDate,
      calculateAge: calculateAge,
    });
    return;
  } else {
    authorModel.deleteAuthor(author.id);
    res.redirect("/catalog/authors");
  }
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update GET");
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update POST");
});
