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

      const todosLivros = [...livrosLocais, ...livrosApi];
      res.json(todosLivros);
    } catch (error) {
      console.error("Erro ao buscar livros:", error.message);
      res.status(500).json({ erro: "Erro ao buscar livros" });
    }
  });

  // Buscar lançamentos recentes de livros
router.get("/livros/lancamentos", async (req, res) => {
  const { genero, autor, titulo } = req.query;

  try {
    let queryParts = [];

    if (titulo) queryParts.push(titulo);
    if (autor) queryParts.push(`inauthor:${autor}`);
    if (genero) queryParts.push(`subject:${genero}`);

    const query = queryParts.length ? queryParts.join("+") : "livros"; // busca geral se nada for passado

    const response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
      params: {
        q: query,
        orderBy: "newest", // 🔥 traz os lançamentos
        langRestrict: "pt", // apenas em português
        printType: "books",
        maxResults: 20,
        key: process.env.GOOGLE_BOOKS_API_KEY,
      },
    });

    const livrosLancamentos = (response.data.items || []).map((item) => {
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

    res.json(livrosLancamentos);
  } catch (error) {
    console.error("Erro ao buscar lançamentos:", error.message);
    res.status(500).json({ erro: "Erro ao buscar lançamentos" });
  }
});


  // Adicionar livro (somente admin)
  router.post("/livros", verificarToken, somenteAdmin, async (req, res) => {
    try {
      const { titulo, autor } = req.body;

      // 1️⃣ Verifica se já existe localmente (mesmo título e autor)
      const livroExistente = await Livro.findOne({
        titulo: { $regex: `^${titulo}$`, $options: "i" },
        autor: { $regex: `^${autor}$`, $options: "i" },
      });

      if (livroExistente) {
        return res.status(409).json({ erro: "Livro já cadastrado localmente." });
      }

      // 2️⃣ Verifica se já existe na API do Google Books
      const queryParts = [];
      if (titulo) queryParts.push(titulo);
      if (autor) queryParts.push(`inauthor:${autor}`);
      const query = queryParts.join("+");

      const response = await axios.get("https://www.googleapis.com/books/v1/volumes", {
        params: {
          q: query,
          key: process.env.GOOGLE_BOOKS_API_KEY,
          langRestrict: "pt",
          printType: "books",
          maxResults: 5,
        },
      });

      const livrosApi = response.data.items || [];
      const livroNaApi = livrosApi.find(item => {
        const info = item.volumeInfo;
        return (
          info.title?.toLowerCase() === titulo.toLowerCase() &&
          (info.authors?.join(", ") || "").toLowerCase().includes(autor.toLowerCase())
        );
      });

      if (livroNaApi) {
        return res.status(409).json({
          erro: "Livro já existe na Google Books API. Não é necessário adicionar manualmente.",
          id: livroNaApi.id,
        });
      }

      // 3️⃣ Se não existir em nenhum lugar, salva localmente
      const novoLivro = new Livro(req.body);
      await novoLivro.save();

      res.status(201).json(novoLivro);
    } catch (error) {
      console.error("Erro ao adicionar livro:", error);
      res.status(400).json({
        erro: "Erro ao adicionar livro",
        detalhes: error.message,
      });
    }
  });


  //Deletar livro do Banco de Dados Local (somente admin)
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