import express from "express";
import cors from "cors";
import usuariosRouter from "./router/usuarios.js";
import produtosRouter from "./router/produtos.js";
import pedidosRouter from "./router/pedidos.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/usuarios", usuariosRouter);
app.use("/produtos", produtosRouter);
app.use("/pedidos", pedidosRouter);

app.get("/", (req, res) => {
  res.send("API Salgados da Tia Cida online!");
});

export default app;
