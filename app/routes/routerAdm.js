const express = require("express");
const router = express.Router();
const anunciosModel = require("../models/anunciosModel");
const trocasModel = require("../models/trocasModel");
const usuariosModel = require("../models/models");

// ============================================
// 🔒 MIDDLEWARE — só admin entra
// ============================================
const isAdmin = (req, res, next) => {
    if (req.session && req.session.usuario && req.session.usuario.perfil === "admin") {
        return next();
    }
    res.redirect("/login");
};

// ============================================
// 📊 DASHBOARD — GET /adm
// ============================================
router.get("/", isAdmin, async (req, res) => {
    try {
        const stats         = trocasModel.getStats();
        const todosAnuncios = anunciosModel.findAll();
        const contagem      = anunciosModel.contarPorCategoria();
        const ultimasTrocas = trocasModel.findAll().slice(0, 4);

        // Anúncios pendentes = os que não têm campo ativo ainda (legado) ou ativo === true mas sem status — adapte se adicionar campo status futuramente
        // Por ora, exibe os 3 mais recentes como "aguardando revisão"
        const pendentes = todosAnuncios.slice(0, 3);

        // Percentuais de categoria
        const total          = contagem.total || 1;
        const catAlimentos   = Math.round((contagem.alimentos    / total) * 100);
        const catProfissionais = Math.round((contagem.profissionais / total) * 100);
        const catInfantil    = Math.round((contagem.infantil     / total) * 100);
        const catOutros      = 100 - catAlimentos - catProfissionais - catInfantil;

        // Trocas hoje
        const hoje        = new Date().toISOString().slice(0, 10);
        const ontem       = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const trocasHoje  = trocasModel.findAll().filter(t => t.dataSolicitacao && t.dataSolicitacao.startsWith(hoje)).length;
        const trocasOntem = trocasModel.findAll().filter(t => t.dataSolicitacao && t.dataSolicitacao.startsWith(ontem)).length || 1;
        const deltaPercent = Math.round(((trocasHoje - trocasOntem) / trocasOntem) * 100);

        // Formata as últimas trocas com campo "data" legível
        const ultimasTrocasFormatadas = ultimasTrocas.map(t => ({
            ...t,
            data: t.dataSolicitacao
                ? new Date(t.dataSolicitacao).toLocaleDateString('pt-BR')
                : '—'
        }));

        res.render("pages/adm/dashboard", {
            stats,
            pendentes,
            ultimasTrocas:    ultimasTrocasFormatadas,
            totalAnuncios:    contagem.total,
            trocasHoje,
            deltaPercent,
            novosEssaSemana:  0,
            novosHoje:        0,
            denuncias:        0,
            doacoesHoje:      0,
            picoDia:          trocasHoje,
            catAlimentos,
            catProfissionais,
            catInfantil,
            catOutros: Math.max(catOutros, 0),
        });
    } catch (err) {
        console.error("Erro no dashboard admin:", err);
        res.status(500).send("Erro ao carregar painel admin: " + err.message);
    }
});

// ============================================
// 📋 ANÚNCIOS — GET /adm/anuncios
// ============================================
router.get("/anuncios", isAdmin, (req, res) => {
    const anuncios = anunciosModel.findAll();
    res.render("pages/adm/anuncios", { anuncios });
});

// ============================================
// 🗑️  DELETAR anúncio — POST /adm/anuncios/deletar/:id
// ============================================
router.post("/anuncios/deletar/:id", isAdmin, (req, res) => {
    anunciosModel.delete(Number(req.params.id));
    res.redirect("/adm");
});

// ============================================
// 🔄 TROCAS — GET /adm/trocas
// ============================================
router.get("/trocas", isAdmin, (req, res) => {
    const trocas = trocasModel.findAll();
    res.render("pages/adm/trocas", { trocas });
});

// ============================================
// ✅ CONFIRMAR troca — POST /adm/trocas/confirmar/:id
// ============================================
router.post("/trocas/confirmar/:id", isAdmin, (req, res) => {
    trocasModel.confirmar(Number(req.params.id));
    res.redirect("/adm/trocas");
});

// ============================================
// 👥 USUÁRIOS — GET /adm/usuarios
// ============================================
router.get("/usuarios", isAdmin, async (req, res) => {
    const usuarios = await usuariosModel.findAll();
    res.render("pages/adm/usuarios", { usuarios });
});

module.exports = router;