//======================================================
// Middleware de erro no Express
// ------------------------------------------------------
// Assinatura: (err, req, res, next)
// - err: objeto de erro
// - req/res: requisição/resposta
// - next: próxima função (não usamos aqui)
// Retorna status e mensagens padronizadas.
// ======================================================

export default function error(err, req, res, next) {
    console.error("\n", err);
  
    // Erro de validação do Mongoose
    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: "Validação falhou",
        details: Object.values(err.errors).map((e) => e.message),
      });
    }
  
    // Erro de índice único (duplicado)
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Registro duplicado", fields: err.keyValue });
    }
  
    // Erro genérico
    res.status(500).json({ error: "Erro interno do servidor" });
  }
  