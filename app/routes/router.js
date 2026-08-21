const express = require("express");
const { body } = require("express-validator");
const usuariosModel = require("../models/models");
const anunciosModel = require("../models/anunciosModel");
const trocasModel = require("../models/trocasModel");
const upload = require("../middlewares/upload");
const { criarAnuncio } = require("../controllers/anunciosController");
const { exibirConta, atualizarFoto } = require("../controllers/usuariosController");
const { responderDuvida } = require("../controllers/iaController");
const { cadastroController, loginController } = require("../controllers/controllers");

const router = express.Router();

const autenticado = (req, res, next) => {
  if (req.session?.usuario) return next();
  res.redirect("/login");
};

router.get("/login", (req, res) => {
  if (req.session?.usuario) return res.redirect("/");
  res.render("pages/login", { erro: null, sucesso: null, valores: {}, erroValidacao: {}, msgErro: {} });
});

router.get("/cadastro", (req, res) => {
  if (req.session?.usuario) return res.redirect("/");
  res.render("pages/login", { erro: null, sucesso: null, valores: {}, erroValidacao: {}, msgErro: {} });
});

router.get("/", (req, res) => {
  try {
    const stats = trocasModel.getStats();
    res.render("pages/home", {
      membrosAtivos: stats.membrosAtivos.toLocaleString("pt-BR"),
      trocasRealizadas: stats.trocasRealizadas.toLocaleString("pt-BR"),
      totalDoacoes: trocasModel.formatarValor(stats.totalDoacoesReais * 100),
    });
  } catch (err) {
    console.error("Erro home:", err);
    res.render("pages/home", { membrosAtivos: "0", trocasRealizadas: "0", totalDoacoes: "R$ 0" });
  }
});

const prepararAnuncio = async (anuncio, usuariosPorId = new Map()) => {
  if (!anuncio) return null;
  if (anuncio.doadorNome === "Malcolm Eliseu Ribeiro" || !anuncio.doadorId) {
    return { ...anuncio, fotoExibicao: anuncio.foto || "/img/img malcon.png" };
  }

  if (!usuariosPorId.has(anuncio.doadorId)) {
    usuariosPorId.set(anuncio.doadorId, await usuariosModel.findById(anuncio.doadorId));
  }
  const anunciante = usuariosPorId.get(anuncio.doadorId);
  return {
    ...anuncio,
    fotoExibicao: anunciante?.foto || "/img/img perfil-white.png",
  };
};

const listarAnuncios = (categoria, pagina) => async (req, res) => {
  const busca = req.query.busca || "";
  const anuncios = anunciosModel.findAll({ categoria, busca });
  const usuariosPorId = new Map();
  const anunciosComFoto = await Promise.all(anuncios.map((anuncio) => prepararAnuncio(anuncio, usuariosPorId)));
  res.render(`pages/${pagina}`, { anuncios: anunciosComFoto, busca });
};

router.get("/todos", listarAnuncios(undefined, "todos"));
router.get("/kids", listarAnuncios("infantil", "infantil"));
router.get("/alimentos", listarAnuncios("alimentos", "alimentos"));
router.get("/profissionais", listarAnuncios("profissionais", "profissionais"));

router.get("/contato/:id", async (req, res) => {
  const anuncio = anunciosModel.findById(req.params.id);
  if (!anuncio) return res.redirect("/todos");
  res.render("pages/contato-troca", { anuncio: await prepararAnuncio(anuncio) });
});

router.get("/contato", async (req, res) => {
  const anuncio = anunciosModel.findAll()[0] || null;
  res.render("pages/contato-troca", { anuncio: await prepararAnuncio(anuncio) });
});

router.get("/resumo/:anuncioId", async (req, res) => {
  const anuncio = anunciosModel.findById(req.params.anuncioId);
  if (!anuncio) return res.redirect("/todos");
  req.session.anuncioPendente = anuncio;
  res.render("pages/resumo-troca", { anuncio: await prepararAnuncio(anuncio) });
});

router.get("/resumo", async (req, res) => {
  const anuncio = await prepararAnuncio(req.session.anuncioPendente || null);
  res.render("pages/resumo-troca", { anuncio });
});

router.post("/confirmar-troca", (req, res) => {
  try {
    const { anuncioId, anuncioTitulo, mensagem } = req.body;
    const usuario = req.session.usuario;
    const anuncio = anunciosModel.findById(anuncioId);
    trocasModel.create({
      anuncioId,
      anuncioTitulo: anuncioTitulo || "Anúncio CPC",
      doadorNome: anuncio?.doadorNome || "Doador CPC",
      foto: anuncio?.foto || "../img/img malcon.png",
      solicitanteNome: usuario?.nome || req.body.nome || "Visitante",
      solicitanteEmail: usuario?.email || req.body.email || "",
      mensagem: mensagem || "",
    });
    delete req.session.anuncioPendente;
  } catch (err) {
    console.error("Erro confirmar troca:", err);
  }
  res.redirect("/obrigado");
});

router.get("/novo-anuncio", (req, res) => {
  if (!req.session?.usuario) {
    req.session.redirectAfterLogin = "/novo-anuncio";
    return res.redirect("/login");
  }
  res.render("pages/novo-anuncio", { erro: null, sucesso: null, valores: {} });
});

router.post(
  "/novo-anuncio",
  (req, res, next) => {
    if (!req.session?.usuario) {
      req.session.redirectAfterLogin = "/novo-anuncio";
      return res.redirect("/login");
    }
    next();
  },
  upload.array("imagens", 3),
  body("titulo").trim().notEmpty().withMessage("Título é obrigatório"),
  body("descricao").trim().notEmpty().withMessage("Descrição é obrigatória"),
  body("categoria").notEmpty().withMessage("Categoria é obrigatória"),
  criarAnuncio
);

router.get("/api/stats", (req, res) => {
  const stats = trocasModel.getStats();
  res.json({
    membrosAtivos: stats.membrosAtivos,
    trocasRealizadas: stats.trocasRealizadas,
    totalDoacoes: trocasModel.formatarValor(stats.totalDoacoesReais * 100),
  });
});

router.get("/api/anuncios", (req, res) => {
  res.json(anunciosModel.findAll({ categoria: req.query.categoria, busca: req.query.busca }));
});

router.post("/api/chat", responderDuvida);

router.get("/avaliacao", autenticado, async (req, res) => {
  try {
    const usuario = await usuariosModel.findById(req.session.usuario.id);
    if (!usuario) return res.redirect("/login");

    const trocas = trocasModel.findAll()
      .filter((troca) => troca.solicitanteEmail === usuario.email)
      .slice(0, 5);

    return res.render("pages/avaliacao", {
      trocas,
      sucesso: req.query.sucesso === "1",
      erro: req.query.erro === "1",
    });
  } catch (err) {
    console.error("Erro ao carregar avaliações:", err);
    return res.redirect("/conta");
  }
});

router.post("/avaliacao/:id", autenticado, async (req, res) => {
  try {
    const usuario = await usuariosModel.findById(req.session.usuario.id);
    const avaliacao = usuario && trocasModel.avaliar(req.params.id, usuario.email, req.body.nota);
    return res.redirect(`/avaliacao?${avaliacao ? "sucesso=1" : "erro=1"}`);
  } catch (err) {
    console.error("Erro ao salvar avaliação:", err);
    return res.redirect("/avaliacao?erro=1");
  }
});
router.get("/saibamais", (req, res) => res.render("pages/saibamais"));
router.get("/servicos", (req, res) => res.render("pages/servicos"));
router.get("/noticia", (req, res) => res.render("pages/noticia"));
router.get("/sobrenos", (req, res) => res.render("pages/sobrenos"));
router.get("/comofunciona", (req, res) => res.render("pages/comofunciona"));
router.get("/doe", (req, res) => res.render("pages/doe"));
router.get("/obrigado", (req, res) => res.render("pages/obrigado"));

router.get("/conta", autenticado, exibirConta);
router.post("/conta/foto", autenticado, upload.single("foto"), atualizarFoto);

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/"));
});

router.post(
  "/cadastro",
  body("nome").trim().notEmpty().withMessage("*Campo obrigatório!").isLength({ min: 3 }).withMessage("*Mínimo 3 caracteres!"),
  body("email").trim().notEmpty().withMessage("*Campo obrigatório!").isEmail().withMessage("*Email inválido!"),
  body("senha").notEmpty().withMessage("*Campo obrigatório!").isLength({ min: 6 }).withMessage("*Mínimo 8 caracteres!"),
  body("confirmarSenha").notEmpty().withMessage("*Campo obrigatório!").custom((valor, { req }) => {
    if (valor !== req.body.senha) throw new Error("Senhas não coincidem!");
    return true;
  }),
  cadastroController
);

router.post(
  "/login",
  body("usuarioDigitado").notEmpty().withMessage("*Informe o usuário/email!"),
  body("senhaDigitada").notEmpty().withMessage("*Informe a senha!"),
  loginController
);

module.exports = router;
