var express = require("express");
var router = express.Router();

router.post("/html", function (req, res) {
    res.json(req.body);
});
router.get("/login", function (req, res) {
    res.render("pages/login");
});
router.get("/cadastro", function (req, res) {
    res.render("pages/cadastro");
});
router.get("/home", function (req, res) {
    res.render("pages/home");
});
router.get("/sobre-api", function (req, res) {
    res.render("pages/doe");
});
router.get("/autenticacao", function (req, res) {
    res.render("pages/serviços");
});
router.get("/servidor", function (req, res) {
    res.send("Página do servidor");
});
router.get("/todos", function (req, res) {
    res.render("pages/todos");
});

router.get("/doe", function (req, res) {
    res.render("pages/doe");
});
router.get("/banco-de-dados", function (req, res) {
    res.render("pages/login");
});

module.exports = router;