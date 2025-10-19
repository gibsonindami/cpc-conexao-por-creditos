const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const { append } = require("express/lib/response");
 
 
router.get("/login", function (req, res) {
    res.render("pages/login")
});
router.get("/cadastro", function (req, res) {
    res.render("pages/cadastro")
});
router.get("/", function (req, res) {
    res.render("pages/home")
});
router.get("/home2", function (req, res) {
    res.render("pages/home2")
});
router.get("/saibamais", function (req, res) {
    res.render("pages/saibamais")
});
router.get("/servicos", function (req, res) {
    res.render("pages/servicos")
});
router.get("/noticia", function (req, res) {
    res.render("pages/noticia")
});
router.get("/sobrenos", function (req, res) {
    res.render("pages/sobrenos")
});
router.get("/comofunciona", function (req, res) {
    res.render("pages/comofunciona")
});
router.get("/conta", function (req, res) {
    res.render("pages/conta")
});
router.get("/doe", function (req, res) {
    res.render("pages/doe")
});
router.get("/todos", function (req, res) {
    res.render("pages/todos")
});
router.get("/kids", function (req, res) {
    res.render("pages/infantil")
});
router.get("/alimentos", function (req, res) {
    res.render("pages/alimentos")});

const usuarios = [];

// -------------------- ROTAS GET --------------------
router.get("/login", (req, res) => {
  res.render("pages/login", {
    erro: null,
    valores: {
      usuarioDigitado: "",
      senhaDigitada: "",
    },
  });
});
 
router.get("/cadastro", (req, res) => {
  res.render("pages/cadastro", {
    erros: null,
    valores: {
      nome: "",
      email: "",
      senha: "",
      confirmarSenha: "",
    },
    retorno: null,
    erroValidacao: {},
    msgErro: {},
  });
});
 
router.get("/", (req, res) => res.render("pages/home"));
router.get("/home-doe", (req, res) => res.render("pages/home2"));
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
 
// -------------------- CADASTRO --------------------
router.post(
  "/cadastro",
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("*Campo obrigatório!")
    .bail()
    .isLength({ min: 3, max: 50 })
    .withMessage("*O Nome de usuário deve conter entre 3 e 50 caracteres!")
    .matches(/^[A-Za-zÀ-ú\s]+$/)
    .withMessage("*O nome deve conter apenas letras!"),
 
  body("email")
    .notEmpty()
    .withMessage("*Campo obrigatório!")
    .bail()
    .isEmail()
    .withMessage("*Endereço de email inválido!"),
 
  body("senha")
    .notEmpty()
    .withMessage("*Campo obrigatório!")
    .bail()
    .isStrongPassword({
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "*Sua senha deve conter pelo menos: uma letra maiúscula, um número e um caractere especial!"
    ),
 
  body("confirmarSenha")
    .notEmpty()
    .withMessage("*Campo obrigatório!")
    .custom((value, { req }) => {
      if (value !== req.body.senha) {
        throw new Error("*As senhas não conferem!");
      }
      return true;
    }),
 
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const erroValidacao = {};
      const msgErro = {};
 
      errors.array().forEach((erro) => {
        erroValidacao[erro.path] = "erro";
        msgErro[erro.path] = erro.msg;
      });
 
      return res.render("pages/cadastro", {
        erros: errors,
        valores: req.body,
        retorno: null,
        erroValidacao,
        msgErro,
      });
    }
 
    usuarios.push({
      nome: req.body.nome,
      email: req.body.email,
      senha: req.body.senha,
    });
 
    res.redirect("/");
  }
);
 
// -------------------- LOGIN --------------------
router.post("/login", (req, res) => {
  const { usuarioDigitado, senhaDigitada } = req.body;
 
  const usuarioEncontrado = usuarios.find(
    (u) => u.email === usuarioDigitado && u.senha === senhaDigitada
  );
 
  if (usuarioEncontrado) {
    return res.render("pages/home");
  } else {
    return res.render("pages/login", {
      erro: "*Não reconhecemos estas credenciais. Tente novamente.",
      sucesso: false,
      valores: {
        usuarioDigitado: usuarioDigitado,
        senhaDigitada: senhaDigitada,
      }})
    }
    });


    module.exports = router;