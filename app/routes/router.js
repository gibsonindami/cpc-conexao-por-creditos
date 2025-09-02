var express = require("express");
var router = express.Router();
router.post("/html", function (req, res) {
    res.json(req.body);
})

 main
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

router.get("/login", function (req, res) {
    res.render("pages/login")
});
router.get("/cadastro", function (req, res) {
    res.render("pages/cadastro")
});
router.get("/home", function (req, res) {
    res.render("pages/home")

});
router.get("/serviços", function (req, res) {
    res.render("pages/serviços")
});
router.get("/todos", function (req, res) {
main
    res.render("pages/todos")
});
router.get("/doe", function (req, res) {
    res.render("pages/doe")
});

module.exports = router;