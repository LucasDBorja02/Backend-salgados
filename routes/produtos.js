import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * GET /produtos
 * Retorna todos os produtos
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM produtos ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /produtos/:id
 * Retorna um produto específico
 */
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM produtos WHERE id=$1", [id]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Produto não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /produtos
 * Cria um novo produto
 */
router.post("/", async (req, res) => {
  try {
    const { nome, descricao, preco, imagem_url } = req.body;
    const result = await pool.query(
      "INSERT INTO produtos (nome, descricao, preco, imagem_url) VALUES ($1,$2,$3,$4) RETURNING *",
      [nome, descricao, preco, imagem_url]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * PUT /produtos/:id
 * Atualiza um produto existente
 */
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, descricao, preco, imagem_url } = req.body;
    const result = await pool.query(
      "UPDATE produtos SET nome=$1, descricao=$2, preco=$3, imagem_url=$4 WHERE id=$5 RETURNING *",
      [nome, descricao, preco, imagem_url, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Produto não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /produtos/:id
 * Exclui um produto
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM produtos WHERE id=$1", [id]);
    if (result.rowCount === 0)
      return res.status(404).json({ error: "Produto não encontrado" });
    res.json({ message: "Produto removido com sucesso" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
