var express = require("express");
var router = express.Router();

router.get("/banco-de-dados", function (req, res) {
    res.render("pages/login")
});
router.get("/banco-de-dados", function (req, res) {
    res.render("pages/cadastro")
});
router.get("/sobre-api", function (req, res) {
    res.render("pages/home")



});
router.get("/autenticacao", function (req, res) {
    res.render("pages/serviços")
});



router.get("/servidor", function (req, res) {
    res.render("pages/todos")
});
router.get("/servidor", function (req, res) {
    res.render("pages/doe")
});

module.exports = router;