const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const usuariosModel = require("../models/models");

// Middleware para proteger rotas (requer autenticação)
const autenticado = (req, res, next) => {
  if (req.session && req.session.usuario) {
    next();
  } else {
    res.redirect("/login");
  }
};

// ================= GET =================
router.get("/login", (req, res) => {
  // Se já está logado, redireciona para home
  if (req.session && req.session.usuario) {
    return res.redirect("/");
  }
  
  res.render("pages/login", {
    erro: null,
    sucesso: null,
    valores: {},
    erroValidacao: {},
    msgErro: {},
  });
});

router.get("/cadastro", (req, res) => {
  // Se já está logado, redireciona para home
  if (req.session && req.session.usuario) {
    return res.redirect("/");
  }
  
  res.render("pages/login", {
    erro: null,
    sucesso: null,
    valores: {},
    erroValidacao: {},
    msgErro: {},
  });
});

// GET Páginas públicas
router.get("/", (req, res) => res.render("pages/home"));
router.get("/avaliacao", (req, res) => res.render("pages/avaliacao"));
router.get("/saibamais", (req, res) => res.render("pages/saibamais"));
router.get("/servicos", (req, res) => res.render("pages/servicos"));
router.get("/noticia", (req, res) => res.render("pages/noticia"));
router.get("/sobrenos", (req, res) => res.render("pages/sobrenos"));
router.get("/comofunciona", (req, res) => res.render("pages/comofunciona"));
router.get("/doe", (req, res) => res.render("pages/doe"));
router.get("/todos", (req, res) => res.render("pages/todos"));
router.get("/kids", (req, res) => res.render("pages/infantil"));
router.get("/alimentos", (req, res) => res.render("pages/alimentos"));
router.get("/profissionais", (req, res) => res.render("pages/profissionais"));
router.get("/contato", (req, res) => res.render("pages/contato-troca"));
router.get("/resumo", (req, res) => res.render("pages/resumo-troca"));
router.get("/obrigado", (req, res) => res.render("pages/obrigado"));

// GET Conta (protegida - requer login)
router.get("/conta", autenticado, (req, res) => {
  res.render("pages/conta", {
    usuario: req.session.usuario
  });
});

// GET Logout
router.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error("Erro ao destruir sessão:", err);
    res.redirect("/");
  });
});

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
 
  async (req, res) => {
    const errors = validationResult(req);
 
    // 🔴 erro de validação
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

    try {
      // Verificar se email já existe no banco
      const usuarioExistente = await usuariosModel.findByEmail(req.body.email);
 
      if (usuarioExistente) {
        return res.render("pages/login", {
          valores: req.body,
          erroValidacao: { email: "input-error" },
          msgErro: { email: "*Email já cadastrado!" },
          erro: null,
          sucesso: false,
        });
      }
 
      // Criar usuário no banco de dados
      const resultado = await usuariosModel.create({
        nome: req.body.nome.trim(),
        email: req.body.email.toLowerCase(),
        senha: req.body.senha
      });

      console.log("✅ Usuário cadastrado com sucesso:", req.body.nome);

      return res.render("pages/login", {
        sucesso: "Cadastro realizado com sucesso! Faça login agora.",
        erro: null,
        valores: {},
        erroValidacao: {},
        msgErro: {},
      });
    } catch (err) {
      console.error("Erro ao cadastrar:", err);
      return res.render("pages/login", {
        erro: "Erro ao cadastrar. Tente novamente.",
        sucesso: false,
        valores: req.body,
        erroValidacao: {},
        msgErro: {},
      });
    }
  }
);
 
 
// ================= LOGIN =================
router.post(
  "/login",
 
  body("usuarioDigitado")
    .notEmpty().withMessage("*Informe o usuário/email!"),
 
  body("senhaDigitada")
    .notEmpty().withMessage("*Informe a senha!"),
 
  async (req, res) => {
    const errors = validationResult(req);
 
    // 🔴 erro de campos vazios
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

    try {
      const usuarioDigitado = req.body.usuarioDigitado.toLowerCase();
      const senhaDigitada = req.body.senhaDigitada;
 
      // Procurar usuário por email OU nome (com a senha)
      const usuario = await usuariosModel.findByCredentials(usuarioDigitado, senhaDigitada);

      // 🟢 SUCESSO - Login com email ou nome
      if (usuario) {
        // Armazenar dados na sessão
        req.session.usuarioId = usuario.id;
        req.session.usuario = {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email
        };

        console.log("✅ Login bem-sucedido:", usuario.nome);
        return res.redirect("/");
      }

      // 🔴 ERRO - Credenciais incorretas
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

    } catch (err) {
      console.error("Erro ao fazer login:", err);
      return res.render("pages/login", {
        erro: "Erro ao fazer login. Tente novamente.",
        sucesso: false,
        valores: req.body,
        erroValidacao: {},
        msgErro: {},
      });
    }
  }
);
 
module.exports = router;