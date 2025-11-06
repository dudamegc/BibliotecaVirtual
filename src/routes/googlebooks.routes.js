import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

// Rota para buscar livros
router.get("/livros", async (req, res) => {
  const { titulo } = req.query;

  if (!titulo) {
    return res.status(400).json({ erro: "O parâmetro 'titulo' é obrigatório" });
  }

  try {
    const response = await axios.get(
      `https://www.googleapis.com/books/v1/volumes?q=${titulo}&key=${apiKey}`
    );

    res.json(response.data);
  } catch (error) {
    console.error("Erro ao buscar livros:", error.message);
    res.status(500).json({ erro: "Erro ao buscar livros" });
  }
});

export default router;
