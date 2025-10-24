import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/**
 * GET /pedidos
 * Lista todos os pedidos (admin)
 */
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, u.nome AS cliente_nome, u.telefone, u.whatsapp
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /pedidos/usuario/:id
 * Lista pedidos de um cliente específico
 */
router.get("/usuario/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM pedidos WHERE usuario_id=$1 ORDER BY id DESC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /pedidos
 * Cria um pedido com seus itens
 */
router.post("/", async (req, res) => {
  const client = await pool.connect();
  try {
    const {
      usuario_id,
      data_entrega,
      periodo_entrega,
      entrega,
      endereco_entrega,
      itens
    } = req.body;

    await client.query("BEGIN");

    // Calcula total
    let total = 0;
    for (const item of itens) {
      total += item.preco * item.quantidade;
    }

    const pedido = await client.query(
      `INSERT INTO pedidos 
      (usuario_id, data_entrega, periodo_entrega, entrega, endereco_entrega, total) 
      VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [usuario_id, data_entrega, periodo_entrega, entrega, endereco_entrega, total]
    );

    const pedidoId = pedido.rows[0].id;

    for (const item of itens) {
      await client.query(
        `INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, subtotal)
         VALUES ($1,$2,$3,$4)`,
        [pedidoId, item.id, item.quantidade, item.preco * item.quantidade]
      );
    }

    await client.query("COMMIT");
    res.json({ message: "Pedido criado com sucesso!", pedido: pedido.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    res.status(400).json({ error: err.message });
  } finally {
    client.release();
  }
});

/**
 * GET /pedidos/:id
 * Detalha um pedido com itens
 */
router.get("/", async (req, res) => {
  try {
    // 1️⃣ Busca todos os pedidos com dados do cliente
    const pedidosResult = await pool.query(`
      SELECT p.*, u.nome AS cliente_nome, u.telefone, u.whatsapp
      FROM pedidos p
      JOIN usuarios u ON p.usuario_id = u.id
      ORDER BY p.id DESC
    `);

    const pedidos = pedidosResult.rows;

    // 2️⃣ Para cada pedido, busca os itens associados
    for (const pedido of pedidos) {
      const itensResult = await pool.query(`
        SELECT i.*, pr.nome AS produto_nome, pr.preco
        FROM itens_pedido i
        JOIN produtos pr ON i.produto_id = pr.id
        WHERE i.pedido_id = $1
      `, [pedido.id]);

      pedido.itens = itensResult.rows;
    }

    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * PUT /pedidos/:id/status
 * Atualiza status do pedido (pendente, entregue, cancelado)
 */
router.put("/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await pool.query(
      "UPDATE pedidos SET status=$1 WHERE id=$2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Pedido não encontrado" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/**
 * DELETE /pedidos/:id
 * Exclui um pedido (admin)
 */
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Apaga itens do pedido primeiro (evita FK constraint)
    await pool.query("DELETE FROM itens_pedido WHERE pedido_id=$1", [id]);

    // Apaga o pedido
    const result = await pool.query("DELETE FROM pedidos WHERE id=$1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    res.json({ message: "Pedido excluído com sucesso!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


export default router;
