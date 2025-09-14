var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
router.post("/html", function (req, res) {
    res.json(req.body);
})

router.get("/", function (req, res) {
    res.render("pages/login")
});
router.get("/cadastro", function (req, res) {
    res.render("pages/cadastro")
});
router.get("/home", function (req, res) {
    res.render("pages/home")
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
    res.render("pages/alimentos")
});
router.get("/profissionais", function (req, res) {
    res.render("pages/profissionais")
});


module.exports = router;