var express = require("express");
var router = express.Router();
const { body, validationResult } = require("express-validator");
router.post("/html", function (req, res) {
    res.json(req.body);
})
 
router.get("/login", function (req, res) {
    res.render("pages/login")
});
router.get("/", function (req, res) {
    res.render("pages/home")
});
router.get("/cadastro", function (req, res) {
    res.render("pages/cadastro")
});
router.get("/doe", function (req, res) {
    res.render("pages/doe")
});
router.get("/servicos", function (req, res) {
    res.render("pages/servicos")
});
router.get("/todos", function (req, res) {
    res.render("pages/todos")
});
 
 
module.exports = router;