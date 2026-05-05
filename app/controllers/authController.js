// Controller dedicado para lógica de autenticação social
module.exports = {
  oauthCallback: (req, res) => {
    try {
      if (!req.user) {
        return res.redirect("/login");
      }

      req.session.usuarioId = req.user.id;
      req.session.usuario = {
        id: req.user.id,
        nome: req.user.nome,
        email: req.user.email,
        foto: req.user.foto || null,
      };

      return res.redirect("/home");
    } catch (err) {
      console.error("Falha no callback de OAuth:", err);
      return res.redirect("/login");
    }
  },
};
