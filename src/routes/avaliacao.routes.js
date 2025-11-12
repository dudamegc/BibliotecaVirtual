import express from "express";
import mongoose from "mongoose";
import Avaliacao from "../models/avaliacao.model.js";

const router = express.Router();

// ➕ Criar Avaliação
router.post("/avaliacao", async (req, res) => {
  try {
    const avaliacao = new Avaliacao(req.body);
    await avaliacao.save();
    res.status(201).json(avaliacao);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// 📋 Listar todas as avaliações
router.get("/avaliacao", async (req, res) => {
  try {
    const avaliacoes = await Avaliacao.find().populate("usuario", "nome email");
    res.json(avaliacoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📚 Listar avaliações por livro
router.get("/avaliacao/:livroId", async (req, res) => {
  try {
    const { livroId } = req.params;
    const avaliacoes = await Avaliacao.find({ livroId }).populate("usuario", "nome");
    res.json(avaliacoes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ❌ Deletar avaliação
router.delete("/avaliacao/:id", async (req, res) => {
  try {
    await Avaliacao.findByIdAndDelete(req.params.id);
    res.json({ message: "Avaliação removida com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
