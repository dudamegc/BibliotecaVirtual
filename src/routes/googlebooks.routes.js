import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

// Rota para buscar livros em português
router.get("/livros", async (req, res) => {
  const { titulo } = req.query;

  if (!titulo) {
    return res.status(400).json({ erro: "O parâmetro 'titulo' é obrigatório" });
  }

  try {
    const response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
      params: {
        q: titulo,
        key: apiKey,
        language: "pt",
        printType: "books",
        totalItems: 20,
      },
    });

    // 🔹 Garante que só retorne livros em português
    const livros = (response.data.items || []).filter(
      (livro) =>
        livro.volumeInfo.language === "pt" ||
        (livro.volumeInfo.language?.startsWith("pt-")) // cobre pt-BR e pt-PT
    );

    // 🔹 Se não houver nenhum livro em português, tenta buscar explicitamente 'inauthor' + 'subject' em português
    if (livros.length === 0) {
      const altResponse = await axios.get("https://www.googleapis.com/books/v1/volumes", {
        params: {
          q: `${titulo}+subject:portuguese`,
          key: apiKey,
          printType: "books",
          maxResults: 20,
        },
      });

      const livrosAlt = (altResponse.data.items || []).filter(
        (livro) =>
          livro.volumeInfo.language === "pt" ||
          (livro.volumeInfo.language?.startsWith("pt-"))
      );

      return res.json(livrosAlt);
    }

    res.json(livros);
  } catch (error) {
    console.error("Erro ao buscar livros:", error.message);
    res.status(500).json({ erro: "Erro ao buscar livros" });
  }
});

export default router;
