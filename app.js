const express = require("express");
const session = require("express-session");
const app = express();
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
require("dotenv").config();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const passport = require("passport");
require("./config/passport");
const authRoutes = require("./app/routes/auth");

app.use(session({
  secret: process.env.SESSION_SECRET || "seu-secret-seguro-aqui",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
}));

const upload = multer({ dest: 'uploads/' });
app.post('/upload', upload.single('minhaImagem'), async (req, res) => {
    try {
        const { path: tempPath, originalname } = req.file;
        const nomeArquivo = path.parse(originalname).name + '-' + Date.now() + '.webp';
        const destinoFinal = path.join(__dirname, 'public/images', nomeArquivo);
        await sharp(tempPath).webp({ quality: 80 }).toFile(destinoFinal);
        fs.unlinkSync(tempPath);
        res.send(`Imagem convertida com sucesso: ${nomeArquivo}`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Erro ao processar imagem.");
    }
});

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.usuarioLogado = req.session.usuario || null;
  res.locals.usuarioId = req.session.usuarioId || null;
  next();
});

app.use(express.static("./app/public"));

app.set("view engine", "ejs");
app.set("views", "./app/views");

const rotaPrincipal = require("./app/routes/router");
const rotaAdm = require("./app/routes/routerAdm"); // ✅ NOVO

app.use("/auth", authRoutes);
app.use("/adm", rotaAdm);       // ✅ NOVO — antes do "/"
app.use("/", rotaPrincipal);

const porta = process.env.APP_PORT || process.env.PORT || 3000;

app.listen(porta, () => {
  console.log(`Servidor ouvindo na porta ${porta}\nhttp://localhost:${porta}`);
});