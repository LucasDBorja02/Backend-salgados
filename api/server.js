import express from "express";
import cors from "cors";
import usuariosRouter from "./router/usuarios.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rotas
app.use("/usuarios", usuariosRouter);

app.get("/", (req, res) => {
  res.send("API Salgados da Tia Cida está online!");
});

export default app;
