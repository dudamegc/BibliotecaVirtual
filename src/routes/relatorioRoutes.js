import express from "express";
import PDFDocument from "pdfkit";
import Usuario from "../models/usuarios.js";
import Livro from "../models/Livro.js";

const router = express.Router();

// GET /api/relatorio/json
router.get("/relatorio/json", async (req, res) => {
  try {
    const totalUsuarios = await Usuario.countDocuments();
    const totalLivros = await Livro.countDocuments();

    res.json({
      sucesso: true,
      dados: {
        usuarios: totalUsuarios,
        livros: totalLivros,
      },
    });
  } catch (error) {
    res.status(500).json({ erro: "Falha ao gerar relatório JSON", detalhes: error.message });
  }
});

// GET /api/relatorio/pdf
router.get("/relatorio/pdf", async (req, res) => {
    try {
      const totalUsuarios = await Usuario.countDocuments();
      const totalLivros = await Livro.countDocuments();
  
      const doc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "attachment; filename=relatorio.pdf");
  
      doc.pipe(res);
  
      doc.fontSize(20).text("Relatório do Sistema Biblioteca Virtual", { align: "center" });
      doc.moveDown();
  
      doc.fontSize(14).text(`📘 Total de livros cadastrados: ${totalLivros}`);
      doc.text(`👤 Total de usuários cadastrados: ${totalUsuarios}`);
  
      doc.moveDown();
      doc.fontSize(10).text(`Gerado em: ${new Date().toLocaleString()}`, { align: "right" });
  
      doc.end();
    } catch (error) {
      console.error(error);
      res.status(500).json({ erro: "Falha ao gerar relatório PDF", detalhes: error.message });
    }
  })

export default router;