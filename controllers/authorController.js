const asyncHandler = require("express-async-handler");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { formatDate, calculateAge } = require("./functions");

// Display list of all Authors.

// Function to get all authors
async function getAuthors() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: {
        firstName: "asc",
      },
    });
    return authors;
  } catch (error) {
    console.error("Error getting authors:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Function to calculate age of author

exports.author_list = asyncHandler(async (req, res, next) => {
  const authors = await getAuthors();
  res.render("author_list", {
    title: "Author List",
    authors: authors,
    calculateAge: calculateAge,
  });
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  try {
    const author = await prisma.author.findUnique({
      where: {
        id: parseInt(req.params.id),
      },
    });
    if (author === null) {
      const err = new Error("Author not found");
      err.status = 404;
      return next(err);
    }
    const booksByAuthor = await prisma.book.findMany({
      select: {
        title: true,
        summary: true,
        id: true,
      },
      where: {
        authorId: author.id,
      },
    });
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
exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author create GET");
});

// Handle Author create on POST.
exports.author_create_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author create POST");
});

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author delete GET");
});

// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author delete POST");
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update GET");
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update POST");
});
