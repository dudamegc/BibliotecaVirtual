import express from "express";
import dotenv from "dotenv";
import { connect } from "./src/db.js";
import error from "./src/middleware/error.js";
import googleBooksRoutes from "./src/routes/googlebooks.routes.js";
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import leiturasRoutes from "./src/routes/leiturasRoutes.js";
import avaliacaoRoutes from "./src/routes/avaliacao.routes.js";
import relatoriosRoutes from "./src/routes/relatorioRoutes.js";

import cors from "cors";

dotenv.config();

const app = express();

// Permite requisições externas (ex: front-end)
app.use(cors());
app.use(express.json());

// Rotas
app.use("/api", googleBooksRoutes);
app.use("/api", usuarioRoutes);
app.use("/api", leiturasRoutes);
app.use("/api", avaliacaoRoutes);
app.use("/api", relatoriosRoutes);
console.log("Rotas de relatório carregadas!");


// Porta
const PORT = process.env.PORT || 3000;

// Inicia o servidor
connect(process.env.MONGO_URI)
.then(() => {
app.listen(PORT, () => console.log(`API rodando na porta ${PORT}`));
})
.catch((err) => {
console.error("Falha ao conectar no MongoDB:", err);
process.exit(1);
}); 
