require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { connect } = require("./db");
const error = require("./middlewares/error");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

// Rotas de negócio
// app.use(base, roteador) monta sub-rotas sob '/alunos'.
// app.use("/estudantes", alunosRoutes);

// Middleware de erros (sempre por último)
// Qualquer erro lançado em rotas anteriores cai aqui.

app.use(error);

// Porta da aplicação
// process.env.PORT -> variável do .env
// || 3000 -> operador lógico OR (fallback).

const PORT = process.env.PORT || 3000;

// Conexão com o MongoDB + subir servidor
// connect(uri) Abre a conexão (retorna Promise).
// .then(...) Executa se deu certo.
// .catch(...) Captura erro de conexão.
// app.listen(PORT, cb) inicia o servidor HTTP.
// process.exit(1) encerra o processo com código de erro.

connect(process.env.MONGO_URI)
.then(() => {
app.listen(PORT, () => console.log(`n API rodando na porta ${PORT}`));
})
.catch((err) => {
console.error("Falha ao conectar no MongoDB:", err);
process.exit(1);
});