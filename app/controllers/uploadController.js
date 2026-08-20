const path = require("path");
const imageService = require("../services/imageService");

const uploadImagem = async (req, res) => {
  if (!req.file) return res.status(400).send("Nenhuma imagem foi enviada.");

  try {
    const nomeBase = path.parse(req.file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, "-");
    const nomeArquivo = `${nomeBase}-${Date.now()}.webp`;
    const destino = path.join(__dirname, "../public/images");

    await imageService.converterImagem(req.file, destino, nomeArquivo, { quality: 80 });
    return res.send(`Imagem convertida com sucesso: ${nomeArquivo}`);
  } catch (error) {
    imageService.removerArquivoTemporario(req.file);
    console.error("Erro ao processar imagem:", error);
    return res.status(500).send("Erro ao processar imagem.");
  }
};

module.exports = { uploadImagem };