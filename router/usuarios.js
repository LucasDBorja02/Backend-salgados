import express from "express";

const router = express.Router();

// Lista todos os usuários
router.get("/", async (req, res) => {
  res.json({ message: "Rota de usuários funcionando!" });
});

// Rota para registrar um novo usuário
router.post("/registrar", async (req, res) => {
  const { nome, email, senha, tipo } = req.body;

  // Aqui você colocaria a lógica de salvar no banco (ex: Supabase, Mongo, etc.)
  // Por enquanto, só retorna sucesso de teste:
  res.json({
    sucesso: true,
    mensagem: "Usuário registrado com sucesso!",
    usuario: { nome, email, tipo: tipo || "cliente" }
  });
});

router.post("/login", async (req, res) => {
  const { email, senha } = req.body;

  // Simulação de banco de dados (exemplo de login master)
  if (email === "ld388571@gmail.com" && senha === "0504") {
    return res.json({
      sucesso: true,
      tipo: "master",
      id: 1,
      nome: "Lucas Borja"
    });
  }

  // Caso credenciais erradas
  return res.status(401).json({
    sucesso: false,
    mensagem: "E-mail ou senha incorretos"
  });
});


  res.status(401).json({ sucesso: false, mensagem: "Credenciais inválidas" });
});

export default router;

