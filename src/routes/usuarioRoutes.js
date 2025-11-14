import express from "express";
import dotenv from "dotenv";
import Usuario from "../models/usuarios.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import { verificarToken, somenteAdmin } from "../middleware/autenticação.js";

dotenv.config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "chaveSuperSecreta";

router.post("/usuarios", async (req, res, next) => {
  try {
    const { nome, email, senha } = req.body;

    const usuario = new Usuario({
      nome,
      email,
      senha,
      tipo: "leitor",
    });

    await usuario.save(); // agora ativa o pre("save")

    res.status(201).json({ mensagem: "Usuário criado com sucesso!", usuario });
  } catch (error) {
    next(error);
  }
});

//  Login → gera token JWT
router.post("/login", async (req, res, next) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });

    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) return res.status(401).json({ error: "Senha incorreta." });

    const token = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: "4h" });
    res.json({ mensagem: "Login realizado com sucesso!", token, tipo: usuario.tipo });
  } catch (error) {
    next(error);
  }
});

// Consultar usuário (admin pode ver qualquer, leitor só o próprio)
router.get("/usuarios/:id", verificarToken, async (req, res, next) => {
  try {
    if (req.usuario.tipo !== "admin" && req.usuario._id.toString() !== req.params.id) {
      return res.status(403).json({ error: "Acesso negado." });
    }

    const usuario = await Usuario.findById(req.params.id).select("-senha");
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });

    res.json(usuario);
  } catch (error) {
    next(error);
  }
});

// Atualizar usuário (admin pode atualizar qualquer, leitor só o próprio)
router.put("/usuarios/:id", verificarToken, async (req, res, next) => {
  try {
    if (req.usuario.tipo !== "admin" && req.usuario._id.toString() !== req.params.id) {
      return res.status(403).json({ error: "Você não tem permissão para editar este usuário." });
    }

    const usuarioAtualizado = await Usuario.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!usuarioAtualizado) return res.status(404).json({ error: "Usuário não encontrado." });

    res.json({ mensagem: "Usuário atualizado com sucesso!", usuario: usuarioAtualizado });
  } catch (error) {
    next(error);
  }
});

//  Deletar usuário (somente admin)
router.delete("/usuarios/:id", verificarToken, somenteAdmin, async (req, res, next) => {
  try {
    const usuario = await Usuario.findByIdAndDelete(req.params.id);
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });

    res.json({ mensagem: "Usuário excluído com sucesso!" });
  } catch (error) {
    next(error);
  }
});

//  Recuperar senha → envia e-mail com token
router.post("/recuperar-senha", async (req, res, next) => {
  try {
    const { email } = req.body;
    const usuario = await Usuario.findOne({ email });
    if (!usuario) return res.status(404).json({ error: "E-mail não encontrado." });

    const tokenRecuperacao = jwt.sign({ id: usuario._id }, JWT_SECRET, { expiresIn: "15m" });
    const link = `${process.env.FRONTEND_URL}/resetar-senha/${tokenRecuperacao}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Biblioteca Virtual" <${process.env.EMAIL_USER}>`,
      to: usuario.email,
      subject: "Recuperação de senha",
      html: `
        <p>Olá, ${usuario.nome}</p>
        <p>Você solicitou a redefinição de senha. Clique no link abaixo:</p>
        <a href="${link}">${link}</a>
        <p>O link expira em 15 minutos.</p>
      `,
    });

    res.json({ mensagem: "E-mail de recuperação enviado com sucesso." });
  } catch (error) {
    next(error);
  }
});

// Redefinir senha → valida token e define nova senha
router.post("/resetar-senha/:token", async (req, res, next) => {
  try {
    const { token } = req.params;
    const { novaSenha } = req.body;

    const decoded = jwt.verify(token, JWT_SECRET);
    const usuario = await Usuario.findById(decoded.id);
    if (!usuario) return res.status(404).json({ error: "Usuário não encontrado." });

    usuario.senha = await bcrypt.hash(novaSenha, 10);
    await usuario.save();

    res.json({ mensagem: "Senha redefinida com sucesso!" });
  } catch (error) {
    res.status(400).json({ error: "Token inválido ou expirado." });
  }
});

export default router;
