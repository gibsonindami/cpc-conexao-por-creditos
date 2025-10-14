const express = require("express");
const app = express();
require("dotenv").config();
app.use(express.urlencoded({ extended: true }));
 
app.use(express.static("./app/public"));
 
app.set("view engine", "ejs");
app.set("views", "./app/views");
 
const rotaPrincipal = require("./app/routes/router");
app.use("/", rotaPrincipal);

 
// Definir porta via variável de ambiente APP_PORT ou 3000 como fallback
const porta = process.env.APP_PORT || process.env.PORT || 3000;
 
app.listen(process.env.APP_PORT, () => {
  console.log(`Servidor ouvindo na porta${process.env.APP_PORT}\nhttp://localhost:${process.env.APP_PORT}`);
});