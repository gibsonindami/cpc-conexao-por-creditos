const usuariosModel = require("../models/models");

// ============================================
// 📝 CADASTRO - POST
// ============================================
const cadastroController = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.render("pages/login", {
            erro: "Todos os campos são obrigatórios",
            sucesso: false,
            valores: req.body,
            erroValidacao: { nome: !nome ? "input-error" : "", email: !email ? "input-error" : "", senha: !senha ? "input-error" : "" },
            msgErro: { nome: !nome ? "*Campo obrigatório!" : "", email: !email ? "*Campo obrigatório!" : "", senha: !senha ? "*Campo obrigatório!" : "" },
        });
    }

    try {
        const usuarioExistente = await usuariosModel.findByEmail(email);
        if (usuarioExistente) {
            return res.render("pages/login", {
                valores: req.body,
                erroValidacao: { email: "input-error" },
                msgErro: { email: "*Email já cadastrado!" },
                erro: null,
                sucesso: false,
            });
        }

        await usuariosModel.create({
            nome: nome.trim(),
            email: email.toLowerCase(),
            senha: senha
        });

        return res.render("pages/login", {
            sucesso: "Cadastro realizado com sucesso!",
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
};

// ============================================
// 🔑 LOGIN - POST
// ============================================
const loginController = async (req, res) => {
    const { usuarioDigitado, senhaDigitada } = req.body;

    if (!usuarioDigitado || !senhaDigitada) {
        return res.render("pages/login", {
            erro: "*Preencha todos os campos!",
            sucesso: false,
            valores: req.body,
            erroValidacao: {
                usuarioDigitado: !usuarioDigitado ? "input-error" : "",
                senhaDigitada: !senhaDigitada ? "input-error" : "",
            },
            msgErro: {
                usuarioDigitado: !usuarioDigitado ? "*Campo obrigatório!" : "",
                senhaDigitada: !senhaDigitada ? "*Campo obrigatório!" : "",
            },
        });
    }

    try {
        const usuario = await usuariosModel.findByCredentials(usuarioDigitado, senhaDigitada);
        if (usuario) {
            // ✅ ALTERADO: salva objeto completo com perfil na sessão
            req.session.usuario = {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil || "user"
            };

            console.log("✅ Login bem-sucedido:", usuario.nome, "| perfil:", usuario.perfil || "user");

            // ✅ NOVO: redireciona admin direto para o painel
            if (usuario.perfil === "admin") {
                return res.redirect("/adm");
            }

            return res.redirect("/");
        }

        return res.render("pages/login", {
            erro: "Usuário ou senha incorretos!",
            sucesso: false,
            valores: req.body,
            erroValidacao: { usuarioDigitado: "input-error", senhaDigitada: "input-error" },
            msgErro: { usuarioDigitado: "", senhaDigitada: "" },
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
};

module.exports = {
    cadastroController,
    loginController
};