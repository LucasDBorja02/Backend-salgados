import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

router.post('/registrar', async (req, res) => {
  try {
    const { nome, email, senha, tipo } = req.body;
    const hash = await bcrypt.hash(senha, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nome, email, senha, tipo) VALUES ($1,$2,$3,$4) RETURNING *',
      [nome, email, hash, tipo || 'cliente']
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = (await pool.query('SELECT * FROM usuarios WHERE email=$1', [email])).rows[0];
  if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
  const ok = await bcrypt.compare(senha, user.senha);
  if (!ok) return res.status(401).json({ error: 'Senha incorreta' });
  const token = jwt.sign({ id: user.id, tipo: user.tipo }, SECRET, { expiresIn: '8h' });
  res.json({ token, user });
});

export default router;
