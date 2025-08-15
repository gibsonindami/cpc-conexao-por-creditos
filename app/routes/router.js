var express = require("express");
var router = express.Router();
router.post("/html", function (req, res) {
    res.json(req.body);
})

router.get("/banco-de-dados", function (req, res) {
    res.render("pages/login")
});
router.get("/home", function (req, res) {
    res.render("pages/home")
});
router.get("/", function (req, res) {
    res.render("pages/cadastro")
});
router.get("/sobre-api", function (req, res) {
    res.render("pages/doe")
});
router.get("/autenticacao", function (req, res) {
    res.render("pages/serviços")
});
router.get("/servidor", function (req, res) {
    res.render("pages/todos")
});

module.exports = router;