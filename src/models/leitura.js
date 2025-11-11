const mongoose = req("mongoose");

const LeituraSchema = new mongoose.Schema({
  nome: { type: String, required: true },
  livroId: { type: String, required: true },
  progresso: { type: Number, default: 0 }, 
  inicio: { type: Date, default: Date.now },
  ultimaAtualizacao: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Leitura", LeituraSchema);
