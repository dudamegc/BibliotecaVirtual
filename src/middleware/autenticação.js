export const limparId = (req, res, next) => {
  if (req.body && req.body.id) {
    delete req.body.id;
  }
  next();
};
import jwt from "jsonwebtoken";
import Usuario from "../models/usuarios.js";

const JWT_SECRET = process.env.JWT_SECRET || "chaveSuperSecreta";

// 🔐 Middleware: verifica se o token JWT é válido
export const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      return res.status(401).json({ error: "Token não fornecido." });

    // Espera o formato: "Bearer token"
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Busca o usuário pelo ID decodificado no token
    req.usuario = await Usuario.findById(decoded.id);
    if (!req.usuario)
      return res.status(404).json({ error: "Usuário não encontrado." });

    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};

// 🧑‍💼 Middleware: permite apenas administradores
export const somenteAdmin = (req, res, next) => {
  if (req.usuario.tipo !== "admin") {
    return res.status(403).json({ error: "Acesso restrito a administradores." });
  }
  next();
};
