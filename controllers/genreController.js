const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { body, validationResult } = require("express-validator");

// Display list of all Genre.

// Function to get all genres
async function getGenres() {
  try {
    const genres = await prisma.genre.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return genres;
  } catch (error) {
    console.error("Error getting genres:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exports.genre_list = asyncHandler(async (req, res, next) => {
  const genres = await getGenres();
  res.render("genre_list", {
    title: "Genre List",
    genres: genres,
  });
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const genre = await prisma.genre.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  });
  const booksInGenre = await prisma.book.findMany({
    select: {
      title: true,
      summary: true,
      id: true,
    },
    where: {
      genreId: parseInt(req.params.id),
    },
  });
  if (genre === null) {
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }
  res.render("genre_detail", {
    title: "Genre Detail",
    genre: genre,
    books: booksInGenre,
  });
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", { title: "Create Genre" });
};

// Handle Genre create on POST.
exports.genre_create_post = [
  body("name", "Genre name must contain at least 2 characters")
    .trim()
    .isLength({ min: 2 })
    .escape(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const genreName = req.body.name;
    if (!errors.isEmpty()) {
      res.render("genre_form", {
        title: "Create Genre",
        genre: genreName,
        errors: errors.array(),
      });
      return;
    } else {
      const genreExists = await prisma.genre.findFirst({
        where: {
          name: {
            equals: genreName,
            mode: "insensitive",
          },
        },
      });
      if (genreExists) {
        res.redirect(`/catalog/genre/${genreExists.id}`);
      } else {
        const createdGenre = await prisma.genre.create({
          data: {
            name: genreName,
          },
        });
        res.redirect(`/catalog/genre/${createdGenre.id}`);
      }
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  const genre = await prisma.genre.findUnique({
    where: {
      id: parseInt(req.params.id),
    },
  });
  const booksInGenre = await prisma.book.findMany({
    where: {
      genreId: genre.id,
    },
  });
  res.render("genre_delete", {
    title: "Delete Genre",
    books: booksInGenre,
    genre: genre,
  });
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  const genre = await prisma.genre.findUnique({
    where: {
      id: parseInt(req.body.genreId),
    },
  });
  const booksInGenre = await prisma.book.findMany({
    where: {
      genreId: genre.id,
    },
  });
  if (booksInGenre.length > 0) {
    res.render("genre_delete", {
      title: "Delete Genre",
      books: booksInGenre,
      genre: genre,
    });
  }
  await prisma.genre.delete({
    where: {
      id: genre.id,
    },
  });
  res.redirect("/catalog/genres");
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

// Handle Genre update on POST.
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});
