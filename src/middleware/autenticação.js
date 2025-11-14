export const limparId = (req, res, next) => {
  if (req.body && req.body.id) {
    delete req.body.id;
  }
  next();
};
import jwt from "jsonwebtoken";
import Usuario from "../models/usuarios.js";

const JWT_SECRET = process.env.JWT_SECRET || "chaveSuperSecreta";

// ✅ Middleware: verifica se o usuário está autenticado
export const verificarToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido." });
    }

    const token = authHeader.split(" ")[1]; // formato: "Bearer TOKEN"
    if (!token) {
      return res.status(401).json({ error: "Token ausente ou mal formatado." });
    }

    // Verifica se o token é válido
    const decoded = jwt.verify(token, JWT_SECRET);

    // Busca o usuário no banco
    const usuario = await Usuario.findById(decoded.id).select("-senha");
    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado." });
    }

    // Anexa o usuário autenticado na requisição
    req.usuario = usuario;

    next();
  } catch (error) {
    res.status(401).json({ error: "Token inválido ou expirado." });
  }
};


// Middleware: verifica se o usuário é administrador

export const somenteAdmin = (req, res, next) => {
  try {
    if (!req.usuario) {
      return res.status(401).json({ error: "Usuário não autenticado." });
    }

    if (req.usuario.tipo !== "admin") {
      return res.status(403).json({ error: "Acesso restrito a administradores." });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: "Erro ao verificar privilégios de administrador." });
  }
};
