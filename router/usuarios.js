import express from "express";
import { pool } from "../db.js"; // 🔹 Importa conexão com Neon

const router = express.Router();

/**
 * 🔹 GET /usuarios
 * Teste simples
 */
router.get("/", (req, res) => {
  res.json({ mensagem: "Rota /usuarios funcionando!" });
});

/**
 * 🔹 POST /usuarios/register
 * Cadastra um novo usuário comum (cliente)
 */
// POST /usuarios/register
router.post("/register", async (req, res) => {
  try {
    const { nome, email, senha, telefone, whatsapp, endereco_entrega } = req.body;

    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: "Campos obrigatórios: nome, email e senha." });
    }

    const existente = await pool.query("SELECT id FROM usuarios WHERE email = $1", [email]);
    if (existente.rows.length > 0) {
      return res.status(409).json({ erro: "E-mail já cadastrado." });
    }

    const result = await pool.query(
      `INSERT INTO usuarios (nome, email, senha, tipo, telefone, whatsapp, endereco_entrega)
       VALUES ($1, $2, $3, 'cliente', $4, $5, $6)
       RETURNING id, nome, email, tipo`,
      [nome, email, senha, telefone, whatsapp, endereco_entrega]
    );

    res.status(201).json({
      sucesso: true,
      mensagem: "Usuário registrado com sucesso!",
      usuario: result.rows[0],
    });
  } catch (err) {
    console.error("❌ Erro ao registrar usuário:", err.message);
    res.status(500).json({ erro: "Erro interno ao registrar usuário." });
  }
});

/**
 * 🔹 POST /usuarios/login
 * Login para master e clientes
 */
router.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    // 🔐 Admin fixo
    if (email === "ld388571@gmail.com" && senha === "0504") {
      return res.json({
        sucesso: true,
        tipo: "master",
        id: 1,
        nome: "Lucas Borja",
      });
    }

    // 🔍 Verifica se o e-mail existe
    const userQuery = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
    if (userQuery.rows.length === 0) {
      return res.status(404).json({ sucesso: false, mensagem: "E-mail não encontrado" });
    }

    // 🔑 Verifica a senha
    const senhaQuery = await pool.query("SELECT * FROM usuarios WHERE email = $1 AND senha = $2", [email, senha]);
    if (senhaQuery.rows.length === 0) {
      return res.status(401).json({ sucesso: false, mensagem: "Senha incorreta" });
    }

    // 🟢 Login bem-sucedido
    const usuario = senhaQuery.rows[0];

    return res.json({
      sucesso: true,
      tipo: usuario.tipo || "cliente",
      id: usuario.id,
      nome: usuario.nome,
    });

  } catch (err) {
    console.error("❌ Erro no login:", err.message);
    res.status(500).json({ erro: "Erro interno no login." });
  }
});


export default router;
