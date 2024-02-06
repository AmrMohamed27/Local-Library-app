#! /usr/bin/env node

console.log(
  'This script populates some test books, authors, genres and bookinstances to your database. Specified database as argument - e.g.: node populatedb "mongodb+srv://cooluser:coolpassword@cluster0.lz91hw2.mongodb.net/local_library?retryWrites=true&w=majority"'
);

// Get arguments passed on command line
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const authors = [],
  books = [],
  genres = [],
  bookinstances = [];

main().catch((err) => console.log(err));

async function main() {
  console.log("Debug: Should be connected?");
  await createGenres();
  await createAuthors();
  await createBooks();
  await createBookInstances();
}

// We pass the index to the ...Create functions so that, for example,
// genre[0] will always be the Fantasy genre, regardless of the order
// in which the elements of promise.all's argument complete.
async function genreCreate(index, name) {
  try {
    const newGenre = await prisma.genre.create({
      data: {
        name: name,
      },
    });
    genres[index] = newGenre;
    return newGenre;
  } catch (error) {
    console.error("Error creating genre:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function authorCreate(index, first_name, family_name, d_birth, d_death) {
  try {
    const newAuthor = await prisma.author.create({
      data: {
        firstName: first_name,
        familyName: family_name,
        dateOfBirth: new Date(d_birth),
        dateOfDeath: new Date(d_death),
      },
    });
    authors[index] = newAuthor;
    return newAuthor;
  } catch (error) {
    console.error("Error creating author:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function bookCreate(index, title, summary, isbn, author, genre) {
  try {
    const newBook = await prisma.book.create({
      data: {
        title: title,
        summary: summary,
        isbn: isbn,
        author: {
          connect: {
            id: author.id,
          },
        },
        genre: {
          connect: { id: genre.id },
        },
      },
    });
    books[index] = newBook;
    return newBook;
  } catch (error) {
    console.error("Error creating book:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function bookInstanceCreate(index, book, due_back, status) {
  try {
    const newBookInstance = await prisma.bookInstance.create({
      data: {
        book: {
          connect: {
            id: book.id,
          },
        },
        dueBack: due_back,
        status: status,
      },
    });
    bookinstances[index] = newBookInstance;
    return newBookInstance;
  } catch (error) {
    console.error("Error creating book instance:", error);
  } finally {
    await prisma.$disconnect();
  }
}

async function createGenres() {
  console.log("Adding genres");
  await Promise.all([
    genreCreate(0, "Fantasy"),
    genreCreate(1, "Science Fiction"),
    genreCreate(2, "French Poetry"),
  ]);
}

async function createAuthors() {
  console.log("Adding authors");
  await Promise.all([
    authorCreate(0, "Patrick", "Rothfuss", "1973-06-06", false),
    authorCreate(1, "Ben", "Bova", "1932-11-8", false),
    authorCreate(2, "Isaac", "Asimov", "1920-01-02", "1992-04-06"),
    authorCreate(3, "Bob", "Billings", "1965-03-04", false),
    authorCreate(4, "Jim", "Jones", "1971-12-16", false),
  ]);
}

async function createBooks() {
  console.log("Adding Books");
  await Promise.all([
    bookCreate(
      0,
      "The Name of the Wind (The Kingkiller Chronicle, #1)",
      "I have stolen princesses back from sleeping barrow kings. I burned down the town of Trebon. I have spent the night with Felurian and left with both my sanity and my life. I was expelled from the University at a younger age than most people are allowed in. I tread paths by moonlight that others fear to speak of during day. I have talked to Gods, loved women, and written songs that make the minstrels weep.",
      "9781473211896",
      authors[0],
      genres[0]
    ),
    bookCreate(
      1,
      "The Wise Man's Fear (The Kingkiller Chronicle, #2)",
      "Picking up the tale of Kvothe Kingkiller once again, we follow him into exile, into political intrigue, courtship, adventure, love and magic... and further along the path that has turned Kvothe, the mightiest magician of his age, a legend in his own time, into Kote, the unassuming pub landlord.",
      "9788401352836",
      authors[0],
      genres[0]
    ),
    bookCreate(
      2,
      "The Slow Regard of Silent Things (Kingkiller Chronicle)",
      "Deep below the University, there is a dark place. Few people know of it: a broken web of ancient passageways and abandoned rooms. A young woman lives there, tucked among the sprawling tunnels of the Underthing, snug in the heart of this forgotten place.",
      "9780756411336",
      authors[0],
      genres[0]
    ),
    bookCreate(
      3,
      "Apes and Angels",
      "Humankind headed out to the stars not for conquest, nor exploration, nor even for curiosity. Humans went to the stars in a desperate crusade to save intelligent life wherever they found it. A wave of death is spreading through the Milky Way galaxy, an expanding sphere of lethal gamma ...",
      "9780765379528",
      authors[1],
      genres[1]
    ),
    bookCreate(
      4,
      "Death Wave",
      "In Ben Bova's previous novel New Earth, Jordan Kell led the first human mission beyond the solar system. They discovered the ruins of an ancient alien civilization. But one alien AI survived, and it revealed to Jordan Kell that an explosion in the black hole at the heart of the Milky Way galaxy has created a wave of deadly radiation, expanding out from the core toward Earth. Unless the human race acts to save itself, all life on Earth will be wiped out...",
      "9780765379504",
      authors[1],
      genres[1]
    ),
    bookCreate(
      5,
      "Test Book 1",
      "Summary of test book 1",
      "ISBN111111",
      authors[4],
      genres[0]
    ),
    bookCreate(
      6,
      "Test Book 2",
      "Summary of test book 2",
      "ISBN222222",
      authors[4],
      genres[0]
    ),
  ]);
}

async function createBookInstances() {
  console.log("Adding book instances");
  await Promise.all([
    bookInstanceCreate(0, books[0], null, "AVAILABLE"),
    bookInstanceCreate(1, books[1], null, "ON_LOAN"),
    bookInstanceCreate(2, books[2], null, "AVAILABLE"),
    bookInstanceCreate(3, books[3], null, "AVAILABLE"),
    bookInstanceCreate(4, books[3], null, "AVAILABLE"),
    bookInstanceCreate(5, books[3], null, "AVAILABLE"),
    bookInstanceCreate(6, books[4], null, "AVAILABLE"),
    bookInstanceCreate(7, books[4], null, "MAINTENANCE"),
    bookInstanceCreate(8, books[4], null, "ON_LOAN"),
    bookInstanceCreate(9, books[0], null, "AVAILABLE"),
    bookInstanceCreate(10, books[1], null, "AVAILABLE"),
  ]);
}
