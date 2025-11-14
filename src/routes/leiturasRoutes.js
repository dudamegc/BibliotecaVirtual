import express from 'express';
const router = express.Router();
import Leitura from '../models/leitura.js';

// POST /leituras – Registrar início de leitura
router.post("/", async (req, res) => {
  try {
    const { usuarioId, livroId } = req.body;

    const novaLeitura = await Leitura.create({ usuarioId, livroId });
    res.status(201).json(novaLeitura);

  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar leitura" });
  }
});

// PUT /leituras/:id – Atualizar progresso
router.put("/:id", async (req, res) => {
  try {
        const { progresso } = req.body;

    const leituraAtualizada = await Leitura.findByIdAndUpdate(
      req.params.id,
      { progresso, ultimaAtualizacao: new Date() },
      { new: true }
    );

    res.json(leituraAtualizada);

  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar progresso" });
  }
});

// GET /leituras/historico/:usuarioId – Histórico de leitura
router.get("/historico/:usuarioId", async (req, res) => {
  try {
    const historico = await Leitura.find({ usuarioId: req.params.usuarioId });
    res.json(historico);

  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar histórico" });
  }
});

export default router;
