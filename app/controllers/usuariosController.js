const path = require("path");
const usuariosModel = require("../models/models");
const trocasModel = require("../models/trocasModel");
const anunciosModel = require("../models/anunciosModel");
const imageService = require("../services/imageService");

const anuncianteBase = "Malcolm Eliseu Ribeiro";

const exibirConta = async (req, res) => {
  if (req.session.usuario.perfil === "admin") return res.redirect("/adm");

  try {
    const usuario = await usuariosModel.findById(req.session.usuario.id);
    if (!usuario) return res.redirect("/login");

    const meusTrocas = trocasModel.findAll().filter(
      (troca) => troca.solicitanteEmail === usuario.email
    );
    const meusTrocasComPerfil = await Promise.all(meusTrocas.map(async (troca) => {
      const anuncio = anunciosModel.findById(troca.anuncioId);
      const anunciante = anuncio?.doadorId
        ? await usuariosModel.findById(anuncio.doadorId)
        : null;

      return {
        ...troca,
        fotoPerfil: troca.doadorNome === anuncianteBase
          ? (troca.foto || "/img/img malcon.png")
          : (anunciante?.foto || "/img/img perfil-white.png"),
      };
    }));
    const meusAnuncios = anunciosModel.findAll().filter(
      (anuncio) => String(anuncio.doadorId) === String(usuario.id)
    ).map((anuncio) => ({
      ...anuncio,
      fotoPerfil: anuncio.doadorNome === anuncianteBase
        ? (anuncio.foto || "/img/img malcon.png")
        : (usuario.foto || "/img/img perfil-white.png"),
    }));

    return res.render("pages/conta", {
      usuario,
      meusTrocas: meusTrocasComPerfil,
      meusAnuncios,
      totalTrocas: meusTrocasComPerfil.length,
      querySucesso: req.query.sucesso === "foto",
      queryErro: req.query.erro === "foto",
    });
  } catch (err) {
    console.error("Erro ao carregar conta:", err);
    return res.redirect("/login");
  }
};

const atualizarFoto = async (req, res) => {
  if (!req.file) return res.redirect("/conta?erro=foto");

  try {
    const pastaDestino = path.join(__dirname, "../public/img/perfis");
    const nome = `perfil-${req.session.usuario.id}-${Date.now()}.webp`;
    await imageService.converterImagem(req.file, pastaDestino, nome, {
      resize: { width: 600, height: 600, fit: "cover" },
      quality: 82,
    });

    const foto = `/img/perfis/${nome}`;
    await usuariosModel.updateFoto(req.session.usuario.id, foto);
    req.session.usuario.foto = foto;
    return res.redirect("/conta?sucesso=foto");
  } catch (err) {
    imageService.removerArquivoTemporario(req.file);
    console.error("Erro ao atualizar foto de perfil:", err);
    return res.redirect("/conta?erro=foto");
  }
};

module.exports = { exibirConta, atualizarFoto };