const express = require("express");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const author = await prisma.author.findUnique({
      where: {
        id: parseInt(id),
      },
    });
    res.json(author);
  } catch (error) {
    console.error("Error fetching author", error);
    res.stats(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
