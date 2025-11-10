import express from "express";
import axios from "axios";
import dotenv from "dotenv";
import Livro from "../models/Livro.js";
import { verificarToken, somenteAdmin } from "../middleware/autenticação.js";


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
    //1 - Busca primeiro no banco local
    const queryLocal = {};
    if(titulo) queryLocal.titulo = {$regex: titulo, $options: "i"};
    if(autor) queryLocal.autor = {$regex: autor, $options: "i"};
    if(genero) queryLocal.genero = {$regex: genero, $options: "i"};

    const livrosLocais = await Livro.find(queryLocal);

    //2 - Depois busca na API Google Books
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

    const livrosApi = (response.data.items || []).map((item) => {
      const info = item.volumeInfo;
      return {
        idGoogle: item.id,
        titulo: info.title,
        autor: info.authors?.join(", ") || "Desconhecido",
        genero: info.categories?.join(", ") || "Não informado",
        descricao: info.description,
        capa: info.imageLinks?.thumbnail,
        publicadoEm: info.publishedDate,
        idioma: info.language,
      };
    });

    const todosLivros = [...livrosLocais, ...livrosApi];
    res.json(todosLivros);
  } catch (error) {
    console.error("Erro ao buscar livros:", error.message);
    res.status(500).json({ erro: "Erro ao buscar livros" });
  }
});

// Adicionar livro (somente admin)
router.post("/livros", verificarToken, somenteAdmin, async (req, res) => {
  try {
    const livro = new Livro(req.body);
    await livro.save();
    res.status(201).json(livro);
  } catch (error) {
    res.status(400).json({ erro: "Erro ao adicionar livro", detalhes: error.message});
  }
})

//Deletar livro (somente admin)
router.delete("/livros/:id", verificarToken, somenteAdmin, async (req, res) => {
  try {
    const livro = await Livro.findByIdAndDelete(req.params.id);
    if (!livro) return res.status(404).json({ erro: "Livro não encontrado" });
    res.json({ mensagem: "Livro excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ erro: "Erro ao excluir livro" });
  }
});

export default router;
