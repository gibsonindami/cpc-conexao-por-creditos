const path = require("path");
const { validationResult } = require("express-validator");
const anunciosModel = require("../models/anunciosModel");
const imageService = require("../services/imageService");

const criarAnuncio = async (req, res) => {
  const erros = validationResult(req);

  if (erros && !erros.isEmpty()) {
    return res.render("pages/novo-anuncio", {
      erro: erros.array().map((erro) => erro.msg).join(" | "),
      sucesso: null,
      valores: req.body,
    });
  }

  try {
    const usuario = req.session.usuario;
    const imagens = [];
    const pastaDestino = path.join(__dirname, "../public/img/anuncios");

    for (const [indice, arquivo] of (req.files || []).entries()) {
      const nome = `${Date.now()}-${indice}-${Math.round(Math.random() * 1000000)}.webp`;
      await imageService.converterImagem(arquivo, pastaDestino, nome, {
        resize: { width: 1200, withoutEnlargement: true },
        quality: 80,
      });
      imagens.push(`/img/anuncios/${nome}`);
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
      foto: imagens[0] || "/img/img malcon.png",
    });

    return res.render("pages/novo-anuncio", {
      erro: null,
      sucesso: "Anúncio cadastrado com sucesso!",
      valores: {},
    });
  } catch (err) {
    (req.files || []).forEach(imageService.removerArquivoTemporario);
    console.error("Erro ao cadastrar anúncio:", err);
    return res.render("pages/novo-anuncio", {
      erro: "Erro ao cadastrar. Tente novamente.",
      sucesso: null,
      valores: req.body,
    });
  }
};

module.exports = { criarAnuncio };