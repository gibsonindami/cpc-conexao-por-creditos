const express = require("express");
const passport = require("passport");
const authController = require("../controllers/authController");

const router = express.Router();

// Inicia fluxo de autenticação Google
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

// Callback do Google
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: true,
  }),
  authController.oauthCallback
);

// Inicia fluxo de autenticação GitHub
router.get(
  "/github",
  passport.authenticate("github", {
    scope: ["user:email"],
  })
);

// Callback do GitHub
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: "/login",
    session: true,
  }),
  authController.oauthCallback
);

module.exports = router;
