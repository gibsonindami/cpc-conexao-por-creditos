// ============================================
// 👤 Controllers - Login e Cadastro
// Integração com Banco de Dados
// ============================================

const usuariosModel = require("../models/models");

// ============================================
// 📝 CADASTRO - POST
// ============================================
const cadastroController = async (req, res) => {
    const { nome, email, senha } = req.body;

    // Validar
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
        // Verificar se email já existe
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

        // Criar usuário no banco
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

    // Validar
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
        // Buscar usuário por email
        const usuario = await usuariosModel.findByEmail(usuarioDigitado);

        // Verificar credenciais
        if (usuario && usuario.senha === senhaDigitada) {
            // Login bem-sucedido
            req.session = req.session || {};
            req.session.usuarioId = usuario.id;
            req.session.usuarioNome = usuario.nome;
            
            console.log("✅ Login bem-sucedido:", usuario.nome);
            return res.redirect("/");
        }

        // Login falhou
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
};

module.exports = {
    cadastroController,
    loginController
};
