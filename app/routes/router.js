var express = require("express");
var router = express.Router();

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
    res.render("pages/todos")
});
router.get("/doe", function (req, res) {
    res.render("pages/doe")
});

module.exports = router;