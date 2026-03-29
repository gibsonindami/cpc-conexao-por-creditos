const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

// simulação de banco
const usuarios = [];

// ================= GET =================
router.get("/login", (req, res) => {
  res.render("pages/login", {
    erro: null,
    sucesso: null,
    valores: {},
    erroValidacao: {},
    msgErro: {},
  });
});

router.get("/cadastro", (req, res) => {
  res.render("pages/login", {
    erro: null,
    sucesso: null,
    valores: {},
    erroValidacao: {},
    msgErro: {},
  });
});

router.get("/", (req, res) => res.render("pages/home"));
router.get("/home2", (req, res) => res.render("pages/home2"));
router.get("/saibamais", (req, res) => res.render("pages/saibamais"));
router.get("/servicos", (req, res) => res.render("pages/servicos"));
router.get("/noticia", (req, res) => res.render("pages/noticia"));
router.get("/sobrenos", (req, res) => res.render("pages/sobrenos"));
router.get("/comofunciona", (req, res) => res.render("pages/comofunciona"));
router.get("/conta", (req, res) => res.render("pages/conta"));
router.get("/doe", (req, res) => res.render("pages/doe"));
router.get("/todos", (req, res) => res.render("pages/todos"));
router.get("/kids", (req, res) => res.render("pages/infantil"));
router.get("/alimentos", (req, res) => res.render("pages/alimentos"));
router.get("/profissionais", (req, res) => res.render("pages/profissionais"));
router.get("/contato", (req, res) => res.render("pages/contato-troca"));
router.get("/resumo", (req, res) => res.render("pages/resumo-troca"));
router.get("/obrigado", (req, res) => res.render("pages/obrigado"));


// ================= CADASTRO =================
router.post(
  "/cadastro",

  body("nome")
    .trim()
    .notEmpty().withMessage("*Campo obrigatório!")
    .isLength({ min: 3 }).withMessage("*Mínimo 3 caracteres!"),

  body("email")
    .trim()
    .notEmpty().withMessage("*Campo obrigatório!")
    .isEmail().withMessage("*Email inválido!"),

  body("senha")
    .notEmpty().withMessage("*Campo obrigatório!")
    .isLength({ min: 6 }).withMessage("*Mínimo 6 caracteres!"),

  body("confirmarSenha")
    .notEmpty().withMessage("*Campo obrigatório!")
    .custom((value, { req }) => {
      if (value !== req.body.senha) {
        throw new Error("");
      }
      return true;
    }),

  (req, res) => {
    const errors = validationResult(req);

    // erro de validação
    if (!errors.isEmpty()) {
      const erroValidacao = {};
      const msgErro = {};

      errors.array().forEach((erro) => {
        erroValidacao[erro.path] = "input-error";
        msgErro[erro.path] = erro.msg;
      });

      return res.render("pages/login", {
        valores: req.body,
        erroValidacao,
        msgErro,
        erro: null,
        sucesso: false,
      });
    }

    const usuarioExistente = usuarios.find(
      (u) => u.email === req.body.email
    );

    if (usuarioExistente) {
      return res.render("pages/login", {
        valores: req.body,
        erroValidacao: { email: "input-error" },
        msgErro: { email: "*Email já cadastrado!" },
        erro: null,
        sucesso: false,
      });
    }

    // salvar usuário
    usuarios.push({
      nome: req.body.nome.toLowerCase(),
      email: req.body.email.toLowerCase(),
      senha: req.body.senha,
    });

    console.log("USUÁRIOS:", usuarios);

    return res.render("pages/login", {
      sucesso: "Cadastro realizado com sucesso!",
      erro: null,
      valores: {},
      erroValidacao: {},
      msgErro: {},
    });
  }
);


// ================= LOGIN =================
router.post(
  "/login",

  body("usuarioDigitado")
    .notEmpty().withMessage("*Informe o usuário/email!"),

  body("senhaDigitada")
    .notEmpty().withMessage("*Informe a senha!"),

  (req, res) => {
    const errors = validationResult(req);

    // erro de campos vazios
    if (!errors.isEmpty()) {
      const erroValidacao = {};
      const msgErro = {};

      errors.array().forEach((erro) => {
        erroValidacao[erro.path] = "input-error";
        msgErro[erro.path] = erro.msg;
      });

      return res.render("pages/login", {
        erro: "*Preencha todos os campos!",
        sucesso: false,
        valores: req.body,
        erroValidacao,
        msgErro,
      });
    }

    const usuarioDigitado = req.body.usuarioDigitado.toLowerCase();
    const senhaDigitada = req.body.senhaDigitada;

    console.log("Tentativa:", usuarioDigitado, senhaDigitada);
    console.log("Banco:", usuarios);

    const usuarioEncontrado = usuarios.find(
      (u) =>
        (u.email === usuarioDigitado || u.nome === usuarioDigitado) &&
        u.senha === senhaDigitada
    );

    // SUCESSO
    if (usuarioEncontrado) {
      return res.redirect("/");
    }

    // ERRO
    return res.render("pages/login", {
      erro: "Usuário ou senha incorretos!",
      sucesso: false,
      valores: req.body,
      erroValidacao: {
        usuarioDigitado: "input-error",
        senhaDigitada: "input-error",
      },
      msgErro: {
        usuarioDigitado: "",
        senhaDigitada: "",
      },
    });
  }
);

module.exports = router;