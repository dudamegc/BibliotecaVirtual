import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const { Schema, model } = mongoose;



const usuarioSchema = new Schema(
  {
    nome: { type: String, required: true, trim: true, minlength: 2 },

    email: { type: String, required: true, unique: true, trim: true },

    senha: { type: String, required: true, minlength: 6 },

    tipo: { 
      type: String, 
      enum: ["leitor", "admin", "dev"], 
      default: "leitor" 
    }
  },
  { timestamps: true }
);

// ✅ Antes de salvar, criptografa a senha corretamente
usuarioSchema.pre("save", async function (next) {
  if (this.isModified("senha")) {
    this.senha = await bcrypt.hash(this.senha, 10);
  }
  next();
});


export default model("Usuario", usuarioSchema);

