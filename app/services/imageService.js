const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const garantirDiretorio = (diretorio) => {
  fs.mkdirSync(diretorio, { recursive: true });
};

const removerArquivoTemporario = (arquivo) => {
  if (arquivo?.path && fs.existsSync(arquivo.path)) {
    fs.unlinkSync(arquivo.path);
  }
};

const converterImagem = async (arquivo, diretorio, nome, opcoes = {}) => {
  garantirDiretorio(diretorio);

  const destino = path.join(diretorio, nome);
  const imagem = sharp(arquivo.path);
  if (opcoes.autoOrientar) imagem.rotate();

  if (opcoes.resize) {
    imagem.resize(opcoes.resize);
  }

  await imagem.webp({ quality: opcoes.quality || 80 }).toFile(destino);
  removerArquivoTemporario(arquivo);

  return destino;
};

module.exports = {
  converterImagem,
  removerArquivoTemporario,
};