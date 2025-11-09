import express from "express";
import dotenv from "dotenv";
import googleBooksRoutes from "./src/routes/googlebooks.routes.js";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();

// Permite requisições externas (ex: front-end)
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api", googleBooksRoutes);
app.use("/api", usuarioRoutes);

// Porta
const PORT = process.env.PORT || 3000;

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
