const express = require("express");
const app = express();
const dotenv = require("dotenv").config();
const port = process.env.PORT || 3000

app.use(express.static("./app/public"));
app.set("view engine", "ejs");
app.set("views", "./app/views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
var rotas = require("./app/routes/router");
app.use("/", rotas);

app.listen(process.env.APP_PORT, () =>{
  console.log(`Servidor ouvindo na porta ${process.env.APP_PORT}\nhttp://localhost:${process.env.APP_PORT}`);
});