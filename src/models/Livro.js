import mongoose from "mongoose";

const LivroSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, required: true, auto: true },
  titulo: { type: String, required: true },
  autor: { type: String },
  genero: { type: String },
  descricao: { type: String },
  capa: { type: String },
  publicadoEm: { type: String },
  idioma: { type: String, default: "pt" },
  criadoEm: { type: Date, default: Date.now },
  favorito: { type: Boolean, default: false },
});

export default mongoose.model("Livro", LivroSchema);
