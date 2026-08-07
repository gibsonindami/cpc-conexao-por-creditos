(function () {
  "use strict";

  var MENSAGEM_BOAS_VINDAS =
    "Olá! 👋 Eu sou o assistente virtual do CPC. Posso te ajudar a entender como doar ou trocar itens e serviços na plataforma. O que você gostaria de saber?";

  var historico = []; // { role: 'user'|'assistant', content: string }

  document.addEventListener("DOMContentLoaded", function () {
    var botao = document.getElementById("chatia-btn");
    var painel = document.getElementById("chatia-panel");
    var fechar = document.getElementById("chatia-close");
    var form = document.getElementById("chatia-form");
    var input = document.getElementById("chatia-input");
    var enviarBtn = document.getElementById("chatia-enviar");
    var mensagensEl = document.getElementById("chatia-mensagens");
    var sugestoesEl = document.getElementById("chatia-sugestoes");
    var badge = document.getElementById("chatia-badge");

    if (!botao || !painel) return;

    var jaAbriu = false;

    function adicionarMensagem(texto, tipo) {
      var div = document.createElement("div");
      div.className = "chatia-msg " + tipo;
      div.textContent = texto;
      mensagensEl.appendChild(div);
      mensagensEl.scrollTop = mensagensEl.scrollHeight;
      return div;
    }

    function mostrarDigitando() {
      var div = document.createElement("div");
      div.className = "chatia-msg bot chatia-digitando";
      div.innerHTML = "<span></span><span></span><span></span>";
      mensagensEl.appendChild(div);
      mensagensEl.scrollTop = mensagensEl.scrollHeight;
      return div;
    }

    function abrirPainel() {
      painel.classList.add("aberto");
      botao.setAttribute("aria-expanded", "true");
      if (badge) badge.style.display = "none";
      if (!jaAbriu) {
        jaAbriu = true;
        adicionarMensagem(MENSAGEM_BOAS_VINDAS, "bot");
        historico.push({ role: "assistant", content: MENSAGEM_BOAS_VINDAS });
      }
      input.focus();
    }

    function fecharPainel() {
      painel.classList.remove("aberto");
      botao.setAttribute("aria-expanded", "false");
    }

    botao.addEventListener("click", function () {
      painel.classList.contains("aberto") ? fecharPainel() : abrirPainel();
    });
    fechar.addEventListener("click", fecharPainel);

    document.addEventListener("keydown", function (evento) {
      if (evento.key === "Escape" && painel.classList.contains("aberto")) fecharPainel();
    });

    async function enviarMensagem(texto) {
      texto = texto.trim();
      if (!texto) return;

      adicionarMensagem(texto, "user");
      historico.push({ role: "user", content: texto });
      input.value = "";
      enviarBtn.disabled = true;
      if (sugestoesEl) sugestoesEl.style.display = "none";

      var indicador = mostrarDigitando();

      try {
        var resposta = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            mensagem: texto,
            // Envia só as últimas trocas para manter o contexto sem crescer demais
            historico: historico.slice(-10, -1),
          }),
        });

        indicador.remove();

        if (!resposta.ok) throw new Error("Falha na resposta do servidor");

        var dados = await resposta.json();
        var textoResposta = dados.resposta || "Desculpe, não consegui responder agora. Tente novamente em instantes.";
        adicionarMensagem(textoResposta, "bot");
        historico.push({ role: "assistant", content: textoResposta });
      } catch (erro) {
        indicador.remove();
        adicionarMensagem(
          "Não consegui me conectar ao assistente agora. Você pode conferir a página 'Como Funciona' ou tentar novamente em instantes.",
          "erro"
        );
      } finally {
        enviarBtn.disabled = false;
      }
    }

    form.addEventListener("submit", function (evento) {
      evento.preventDefault();
      enviarMensagem(input.value);
    });

    if (sugestoesEl) {
      sugestoesEl.querySelectorAll(".chatia-sugestao").forEach(function (btn) {
        btn.addEventListener("click", function () {
          enviarMensagem(btn.textContent);
        });
      });
    }
  });
})();