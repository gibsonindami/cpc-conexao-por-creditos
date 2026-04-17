const express = require("express");
const session = require("express-session");
const app = express();
require("dotenv").config();

// Middleware de parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configurar sessão
app.use(session({
  secret: process.env.SESSION_SECRET || "seu-secret-seguro-aqui",
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // true se usar HTTPS
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 dias
  }
}));

// Middleware para passar dados de sessão para as views
app.use((req, res, next) => {
  res.locals.usuarioLogado = req.session.usuario || null;
  res.locals.usuarioId = req.session.usuarioId || null;
  next();
});

app.use(express.static("./app/public"));
 
app.set("view engine", "ejs");
app.set("views", "./app/views");
 
const rotaPrincipal = require("./app/routes/router");
app.use("/", rotaPrincipal);
 
// Definir porta via variável de ambiente APP_PORT ou PORT, ou 3000 como fallback
const porta = process.env.APP_PORT || process.env.PORT || 3000;
 
app.listen(porta, () => {
  console.log(`Servidor ouvindo na porta ${porta}\nhttp://localhost:${porta}`);
});