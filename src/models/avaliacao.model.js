import mongoose from "mongoose";

const avaliacaoSchema = new mongoose.Schema({
  usuario: { type: mongoose.Schema.Types.ObjectId, ref: "Usuario", required: true },
  livroId: { type: String, required: true }, // ID do livro (Google Books ou interno)
  nota: { type: Number, required: true, min: 0, max: 5 },
  comentario: { type: String },
  data: { type: Date, default: Date.now }
});

export default mongoose.model("Avaliacao", avaliacaoSchema);