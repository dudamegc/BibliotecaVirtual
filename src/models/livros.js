import mongoose from "mongoose";

const livroSchema = new mongoose.Schema({
    titulo: { type: String, required: true },
    autor: { type: String },
    genero: { type: String },
    descricao: { type: String},
    capa: { type: String },
    publicadoEm: { type: String },
    idioma: { type: String, default: "pt" },
    favorito: { type: Boolean, default: false },
});

export default mongoose.model("Livro", livroSchema);