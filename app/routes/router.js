const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const usuariosModel = require("../models/models");
const anunciosModel = require("../models/anunciosModel");
const trocasModel = require("../models/trocasModel");
const aiService = require("../ai/aiService");
const historyManager = require("../ai/historyManager");
const multer = require("multer");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const upload = multer({
    dest: "uploads/",
    limits: {
        fileSize: 5 * 1024 * 1024
  },
  fileFilter: (req, file, callback) => {
    callback(null, file.mimetype.startsWith("image/"));
  }
});

const autenticado = (req, res, next) => {
  if (req.session && req.session.usuario) return next();
  res.redirect("/login");
};

router.get("/login", (req, res) => {
  if (req.session && req.session.usuario) return res.redirect("/");
  res.render("pages/login", { erro: null, sucesso: null, valores: {}, erroValidacao: {}, msgErro: {} });
});

router.get("/cadastro", (req, res) => {
  if (req.session && req.session.usuario) return res.redirect("/");
  res.render("pages/login", { erro: null, sucesso: null, valores: {}, erroValidacao: {}, msgErro: {} });
});

router.get("/", (req, res) => {
  try {
    const stats = trocasModel.getStats();
    res.render("pages/home", {
      membrosAtivos: stats.membrosAtivos.toLocaleString('pt-BR'),
      trocasRealizadas: stats.trocasRealizadas.toLocaleString('pt-BR'),
      totalDoacoes: trocasModel.formatarValor(stats.totalDoacoesReais * 100),
    });
  } catch (err) {
    console.error("Erro home:", err);
    res.render("pages/home", { membrosAtivos: "0", trocasRealizadas: "0", totalDoacoes: "R$ 0" });
  }
});

router.get("/todos", (req, res) => {
  const busca = req.query.busca || '';
  const anuncios = anunciosModel.findAll({ busca });
  res.render("pages/todos", { anuncios, busca });
});

router.get("/kids", (req, res) => {
  const busca = req.query.busca || '';
  const anuncios = anunciosModel.findAll({ categoria: 'infantil', busca });
  res.render("pages/infantil", { anuncios, busca });
});

router.get("/alimentos", (req, res) => {
  const busca = req.query.busca || '';
  const anuncios = anunciosModel.findAll({ categoria: 'alimentos', busca });
  res.render("pages/alimentos", { anuncios, busca });
});

router.get("/profissionais", (req, res) => {
  const busca = req.query.busca || '';
  const anuncios = anunciosModel.findAll({ categoria: 'profissionais', busca });
  res.render("pages/profissionais", { anuncios, busca });
});

router.get("/contato/:id", (req, res) => {
  const anuncio = anunciosModel.findById(req.params.id);
  if (!anuncio) return res.redirect("/todos");
  res.render("pages/contato-troca", { anuncio });
});

router.get("/contato", (req, res) => {
  const anuncios = anunciosModel.findAll();
  const anuncio = anuncios[0] || null;
  res.render("pages/contato-troca", { anuncio });
});

router.get("/resumo/:anuncioId", (req, res) => {
  const anuncio = anunciosModel.findById(req.params.anuncioId);
  if (!anuncio) return res.redirect("/todos");
  req.session.anuncioPendente = anuncio;
  res.render("pages/resumo-troca", { anuncio });
});

router.get("/resumo", (req, res) => {
  const anuncio = req.session.anuncioPendente || null;
  res.render("pages/resumo-troca", { anuncio });
});

router.post("/confirmar-troca", (req, res) => {
  try {
    const { anuncioId, anuncioTitulo, mensagem } = req.body;
    const usuario = req.session.usuario;
    const anuncio = anunciosModel.findById(anuncioId);
    trocasModel.create({
      anuncioId,
      anuncioTitulo: anuncioTitulo || 'Anúncio CPC',
      doadorNome: anuncio ? anuncio.doadorNome : 'Doador CPC',
      foto: anuncio ? anuncio.foto : '../img/img malcon.png',
      solicitanteNome: usuario ? usuario.nome : (req.body.nome || 'Visitante'),
      solicitanteEmail: usuario ? usuario.email : (req.body.email || ''),
      mensagem: mensagem || '',
    });
    delete req.session.anuncioPendente;
    res.redirect("/obrigado");
  } catch (err) {
    console.error("Erro confirmar troca:", err);
    res.redirect("/obrigado");
  }
});

router.get("/novo-anuncio", (req, res) => {

    // Usuário não está logado
    if (!req.session.usuario) {

        // guarda a página que ele queria acessar
        req.session.redirectAfterLogin = "/novo-anuncio";

        return res.redirect("/login");
    }

    // Usuário logado
    res.render("pages/novo-anuncio", {
        erro: null,
        sucesso: null,
        valores: {}
    });

});

router.post(
    "/novo-anuncio",

    upload.array("imagens", 3),

    (req, res, next) => {

        if (!req.session.usuario) {
            req.session.redirectAfterLogin = "/novo-anuncio";
            return res.redirect("/login");
        }

        next();

    },

    body("titulo").trim().notEmpty().withMessage("Título é obrigatório"),
    body("descricao").trim().notEmpty().withMessage("Descrição é obrigatória"),
    body("categoria").notEmpty().withMessage("Categoria é obrigatória"),

    async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("pages/novo-anuncio", {
        erro: errors.array().map(e => e.msg).join(' | '),
        sucesso: null,
        valores: req.body,
      });
    }
    try {
      const usuario = req.session.usuario;
      const imagens = [];

if (req.files && req.files.length) {

    const pastaDestino = path.join(
        __dirname,
        "../public/img/anuncios"
    );

    if (!fs.existsSync(pastaDestino)) {
        fs.mkdirSync(pastaDestino, { recursive: true });
    }

    for (const arquivo of req.files) {

        const nome =
            Date.now() +
            "-" +
            Math.round(Math.random() * 1000000) +
            ".webp";

        const destino = path.join(
    pastaDestino,
    nome
);

await sharp(arquivo.path)
    .resize({
        width: 1200,
        withoutEnlargement: true
    })
    .webp({
        quality: 80
    })
    .toFile(destino);

fs.unlinkSync(arquivo.path);

imagens.push(
    "/img/anuncios/" + nome
);
    }

}
      anunciosModel.create({

    titulo: req.body.titulo,

    descricao: req.body.descricao,

    categoria: req.body.categoria,

    tipo: req.body.tipo,

    doadorId: usuario.id,

    doadorNome: usuario.nome,

    doadorLocal: req.body.doadorLocal,

    imagens,

    foto: imagens[0] || "/img/img malcon.png"

});
      res.render("pages/novo-anuncio", { erro: null, sucesso: "Anúncio cadastrado com sucesso!", valores: {} });
    } catch (err) {
         res.render("pages/novo-anuncio", {
        erro: "Erro ao cadastrar. Tente novamente.",
        sucesso: null,
        valores: req.body
      });
    }
});

router.get("/api/stats", (req, res) => {
  const stats = trocasModel.getStats();
  res.json({
    membrosAtivos: stats.membrosAtivos,
    trocasRealizadas: stats.trocasRealizadas,
    totalDoacoes: trocasModel.formatarValor(stats.totalDoacoesReais * 100),
  });
});

router.get("/api/anuncios", (req, res) => {
  const { categoria, busca } = req.query;
  res.json(anunciosModel.findAll({ categoria, busca }));
});

// ==========================
// CHAT IA (Gemini)
// ==========================

router.post("/api/chat", async (req, res) => {

    try {

        const mensagem = String(

            req.body.mensagem || ""

        ).trim();

        if (!mensagem) {

            return res.status(400).json({

                resposta: "Digite uma pergunta."

            });

        }

        const conversationId =

            req.session?.usuario?.id ||

            req.sessionID ||

            req.ip;

        const historico = historyManager.get(

            conversationId

        );

        const resposta = await aiService.answer(

            mensagem,

            historico

        );

        historyManager.add(

            conversationId,

            "user",

            mensagem

        );

        historyManager.add(

            conversationId,

            "assistant",

            resposta

        );

        return res.json({

            resposta

        });

    }

    catch (erro) {

        console.error("Erro IA:", erro);

        return res.status(500).json({

            resposta:

            "Desculpe, ocorreu um erro ao consultar o assistente."

        });

    }

});

router.get("/avaliacao", (req, res) => res.render("pages/avaliacao"));
router.get("/saibamais", (req, res) => res.render("pages/saibamais"));
router.get("/servicos", (req, res) => res.render("pages/servicos"));
router.get("/noticia", (req, res) => res.render("pages/noticia"));
router.get("/sobrenos", (req, res) => res.render("pages/sobrenos"));
router.get("/comofunciona", (req, res) => res.render("pages/comofunciona"));
router.get("/doe", (req, res) => res.render("pages/doe"));
router.get("/obrigado", (req, res) => res.render("pages/obrigado"));

router.get("/conta", autenticado, async (req, res) => {
  // ✅ Admin vai para o painel, não para a conta de usuário
  if (req.session.usuario.perfil === "admin") return res.redirect("/adm");
  try {
    const usuario = await usuariosModel.findById(req.session.usuario.id);
    if (!usuario) return res.redirect("/login");
    const meusTrocas = trocasModel.findAll().filter(t => t.solicitanteEmail === usuario.email);
    res.render("pages/conta", {
      usuario,
      meusTrocas,
      totalTrocas: meusTrocas.length,
      querySucesso: req.query.sucesso === "foto",
      queryErro: req.query.erro === "foto"
    });
  } catch (err) {
    res.redirect("/login");
  }
});

router.post("/conta/foto", autenticado, upload.single("foto"), async (req, res) => {
  if (!req.file) return res.redirect("/conta?erro=foto");

  try {
    const pastaDestino = path.join(__dirname, "../public/img/perfis");
    if (!fs.existsSync(pastaDestino)) fs.mkdirSync(pastaDestino, { recursive: true });

    const nome = `perfil-${req.session.usuario.id}-${Date.now()}.webp`;
    const destino = path.join(pastaDestino, nome);

    await sharp(req.file.path)
      .resize(600, 600, { fit: "cover" })
      .webp({ quality: 82 })
      .toFile(destino);

    fs.unlinkSync(req.file.path);
    const foto = `/img/perfis/${nome}`;
    await usuariosModel.updateFoto(req.session.usuario.id, foto);
    req.session.usuario.foto = foto;
    return res.redirect("/conta?sucesso=foto");
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error("Erro ao atualizar foto de perfil:", err);
    return res.redirect("/conta?erro=foto");
  }
});

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

router.post("/cadastro",
  body("nome").trim().notEmpty().withMessage("*Campo obrigatório!").isLength({ min: 3 }).withMessage("*Mínimo 3 caracteres!"),
  body("email").trim().notEmpty().withMessage("*Campo obrigatório!").isEmail().withMessage("*Email inválido!"),
  body("senha").notEmpty().withMessage("*Campo obrigatório!").isLength({ min: 6 }).withMessage("*Mínimo 8 caracteres!"),
  body("confirmarSenha").notEmpty().withMessage("*Campo obrigatório!").custom((v, { req }) => {
    if (v !== req.body.senha) throw new Error("Senhas não coincidem!");
    return true;
  }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const erroValidacao = {}, msgErro = {};
      errors.array().forEach(e => { erroValidacao[e.path] = "input-error"; msgErro[e.path] = e.msg; });
      return res.render("pages/login", { valores: req.body, erroValidacao, msgErro, erro: null, sucesso: false });
    }
    try {
      const existe = await usuariosModel.findByEmail(req.body.email);
      if (existe) return res.render("pages/login", { valores: req.body, erroValidacao: { email: "input-error" }, msgErro: { email: "*Email já cadastrado!" }, erro: null, sucesso: false });
      await usuariosModel.create({ nome: req.body.nome.trim(), email: req.body.email.toLowerCase(), senha: req.body.senha });
      trocasModel.incrementarMembro();
      await usuariosModel.create({
    nome: req.body.nome.trim(),
    email: req.body.email.toLowerCase(),
    senha: req.body.senha
});

trocasModel.incrementarMembro();

// faz login automaticamente
const usuario = await usuariosModel.findByEmail(req.body.email);

req.session.usuario = {
    id: usuario.id,
    nome: usuario.nome,
    email: usuario.email,
    perfil: usuario.perfil || "user"
};

req.session.usuarioId = usuario.id;

const destino = req.session.redirectAfterLogin || "/";

delete req.session.redirectAfterLogin;

return res.redirect(destino);
    } catch (err) {
      return res.render("pages/login", { erro: "Erro ao cadastrar. Tente novamente.", sucesso: false, valores: req.body, erroValidacao: {}, msgErro: {} });
    }
  }
);

// LOGIN
router.post("/login",
  body("usuarioDigitado").notEmpty().withMessage("*Informe o usuário/email!"),
  body("senhaDigitada").notEmpty().withMessage("*Informe a senha!"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const erroValidacao = {}, msgErro = {};
      errors.array().forEach(e => { erroValidacao[e.path] = "input-error"; msgErro[e.path] = e.msg; });
      return res.render("pages/login", { erro: "*Preencha todos os campos!", sucesso: false, valores: req.body, erroValidacao, msgErro });
    }
    try {
      const u = req.body.usuarioDigitado.toLowerCase();
      const usuario = await usuariosModel.findByCredentials(u, req.body.senhaDigitada);
      if (usuario) {
        req.session.usuarioId = usuario.id;
        // ✅ CORRIGIDO: inclui perfil na sessão
        req.session.usuario = { id: usuario.id, nome: usuario.nome, email: usuario.email, foto: usuario.foto || null, perfil: usuario.perfil || "user" };

        // ✅ NOVO: redireciona admin direto para o painel
    if (usuario.perfil === "admin") {
    return res.redirect("/adm");
}

const destino = req.session.redirectAfterLogin || "/";

delete req.session.redirectAfterLogin;

return res.redirect(destino);
      }
      const existe = await usuariosModel.findByUsuarioOuEmail(u);
      if (existe) return res.render("pages/login", { erro: null, sucesso: false, valores: req.body, erroValidacao: { senhaDigitada: "input-error" }, msgErro: { senhaDigitada: "*Senha incorreta!" } });
      return res.render("pages/login", { erro: null, sucesso: false, valores: req.body, erroValidacao: { usuarioDigitado: "input-error" }, msgErro: { usuarioDigitado: "Usuário não encontrado!" } });
    } catch (err) {
      return res.render("pages/login", { erro: "Erro ao fazer login.", sucesso: false, valores: req.body, erroValidacao: {}, msgErro: {} });
    }
  }
);

module.exports = router;