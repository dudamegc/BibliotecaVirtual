import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Livro from "../models/Livro.js";

dotenv.config();

const router = express.Router();
const apiKey = process.env.GOOGLE_BOOKS_API_KEY;

//  Buscar livros (por título, autor ou gênero)
router.get("/livros", async (req, res) => {
  const { titulo, autor, genero } = req.query;

  if (!titulo && !autor && !genero) {
    return res
      .status(400)
      .json({ erro: "Informe pelo menos um título, autor ou gênero." });
  }

  try {
    let queryParts = [];
    if (titulo) queryParts.push(titulo);
    if (autor) queryParts.push(`inauthor:${autor}`);
    if (genero) queryParts.push(`subject:${genero}`);
    const query = queryParts.join("+");

    const response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
      params: {
        q: query,
        key: apiKey,
        langRestrict: "pt",
        printType: "books",
        maxResults: 20,
      },
    });

    const livros = (response.data.items || []).map((item) => {
      const info = item.volumeInfo;
      return {
        id: item.id,
        titulo: info.title,
        autor: info.authors?.join(", ") || "Desconhecido",
        genero: info.categories?.join(", ") || "Não informado",
        descricao: info.description,
        capa: info.imageLinks?.thumbnail,
        publicadoEm: info.publishedDate,
        idioma: info.language,
      };
    });

    res.json(livros);
  } catch (error) {
    console.error("Erro ao buscar livros:", error.message);
    res.status(500).json({ erro: "Erro ao buscar livros" });
  }
});

// Salvar um livro no banco 
router.post("/livros", async (req, res) => {
  try {
    const livro = new Livro(req.body);
    await livro.save();
    res.status(201).json(livro);
  } catch (error) {
    res.status(400).json({ erro: "Erro ao salvar livro." });
  }
});

/**
 * Favoritar por Google Books volumeId (googleId)
 * POST /api/livros/favoritar
 * body: { googleId: "volumeId_do_google" }
 *
 * Fluxo:
 * - se já existir no BD (campo googleId), apenas atualiza favorito = true
 * - senão, busca na Google Books, cria o documento com favorito = true
 */
router.post("/livros/favoritar", async (req, res) => {
  const { googleId } = req.body;

  if (!googleId) {
    return res.status(400).json({ erro: "Informe o googleId (volumeId) no body" });
  }

  try {
    // procura no banco local primeiro
    let livro = await Livro.findOne({ googleId });

    if (livro) {
      // já existe → só marca favorito
      livro.favorito = true;
      await livro.save();
      return res.status(200).json(livro);
    }

    // não existe → buscar na Google Books API
    const gbRes = await axios.get(`https://www.googleapis.com/books/v1/volumes/${googleId}`, {
      params: { key: apiKey },
    });

    const info = gbRes.data.volumeInfo;

    const novo = new Livro({
      googleId,
      titulo: info.title,
      autor: info.authors?.join(", ") || "Desconhecido",
      genero: info.categories?.join(", ") || "Não informado",
      descricao: info.description,
      capa: info.imageLinks?.thumbnail,
      publicadoEm: info.publishedDate,
      idioma: info.language,
      favorito: true,
    });

    await novo.save();
    res.status(201).json(novo);
  } catch (error) {
    console.error("Erro ao favoritar por googleId:", error.response?.data || error.message);
    res.status(500).json({ erro: "Erro ao favoritar livro" });
  }
});

/**
 * Listar apenas favoritos
 * GET /api/livros?favoritos=true
 * ou rota dedicada:
 * GET /api/livros/favoritos
 */
router.get("/livros/favoritos", async (req, res) => {
  try {
    const favoritos = await Livro.find({ favorito: true });
    res.json(favoritos);
  } catch (error) {
    console.error("Erro ao listar favoritos:", error);
    res.status(500).json({ erro: "Erro ao listar favoritos" });
  }
});

export default router;
