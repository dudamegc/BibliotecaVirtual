import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();
const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

//GET ----------------------------------------------------

// Rota para BUSCAR livros em português
router.get("/livros", async (req, res) => {
  const { titulo, autor, genero } = req.query;

  // Verifica se pelo menos um parâmetro foi passado
  if (!titulo && !autor && !genero) {
    return res
      .status(400)
      .json({ erro: "Informe pelo menos um título, autor ou gênero." });
  }

  try {
    // Usa array para montar a query dinamicamente
    let queryParts = [];

    if (titulo) queryParts.push(titulo);
    if (autor) queryParts.push(`inauthor:${autor}`);
    if (genero) queryParts.push(`subject:${genero}`);

    // Junta as partes com '+'
    const query = queryParts.join("+");

    const response = await axios.get(
      "https://www.googleapis.com/books/v1/volumes",
      {
        params: {
          q: query,
          key: apiKey,
          langRestrict: "pt",
          printType: "books",
          maxResults: 20,
        },
      }
    );

    // Filtra apenas livros em português e organiza os dados
    const livros = (response.data.items || [])
      .filter(
        (livro) =>
          livro.volumeInfo.language === "pt" ||
          livro.volumeInfo.language?.startsWith("pt-")
      )
      .map((livro) => {
        const livroInfo = livro.volumeInfo;

// Monta o objeto do livro com os campos desejados
        return {
          id: livro.id,
          titulo: livroInfo.title || "Título não disponível",
          autor: livroInfo.authors
            ? livroInfo.authors.join(", ")
            : "Desconhecido",
          genero: livroInfo.categories
            ? livroInfo.categories.join(", ")
            : "Não informado",
          descricao: livroInfo.description || "Descrição não disponível",
          capa: livroInfo.imageLinks ? livroInfo.imageLinks.thumbnail : null,
          publicadoEm: livroInfo.publishedDate || "Data não disponível",
          idioma: livroInfo.language || "pt",
          favorito: false, // Valor padrão
        };
      });

    res.json(livros);
  } catch (error) {
    console.error("Erro ao buscar livros:", error.message);
    res.status(500).json({ erro: "Erro ao buscar livros" });
  }
});

//POST ----------------------------------------------------

//Salvar um livro nos favoritos
router.post("/livros", async (req, res) => {
  try {
    const livro = new Livro(req.body);
    await livro.save();
    res.status(201).json(livro);
  } catch (error) { 
    res.status(400).json({erro: "Erro ao salvar o livro nos favoritos"});
  }
});

// GET ----------------------------------------------------

// listar livros favoritos
router.get("/livros/favoritos", async (req, res) => {
  try {
    const livrosFavoritos = await Livro.find({ favorito: true });
    res.json(livrosFavoritos);
  } catch(error){{
    res.status(500).json({ erro: "Erro ao listar livros favoritos" });
  }}
});

export default router;
