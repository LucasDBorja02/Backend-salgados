import express from "express";
import cors from "cors";
import usuariosRouter from "./router/usuarios.js";
import produtosRouter from "./router/produtos.js";
import pedidosRouter from "./router/pedidos.js";

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rotas
app.use("/usuarios", usuariosRouter);
app.use("/produtos", produtosRouter);
app.use("/pedidos", pedidosRouter);

// Rota de teste
app.get("/", (req, res) => {
  res.send("API Salgados da Tia Cida está funcionando!");
});

// ⚠️ Não use app.listen() no Vercel
export default app;
