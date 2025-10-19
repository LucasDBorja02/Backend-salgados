import express from "express";
const router = express.Router();

// Teste GET simples
router.get("/", (req, res) => {
  res.json({ mensagem: "Rota /usuarios funcionando!" });
});

// Login simulado
router.post("/login", (req, res) => {
  const { email, senha } = req.body;

  if (email === "ld388571@gmail.com" && senha === "0504") {
    return res.json({
      sucesso: true,
      tipo: "master",
      id: 1,
      nome: "Lucas Borja"
    });
  }

  res.status(401).json({ sucesso: false, mensagem: "E-mail ou senha incorretos" });
});

export default router;
