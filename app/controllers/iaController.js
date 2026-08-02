const aiService = require("../ai/aiService");
const history = require("../ai/historyManager");

/**
 * Controller oficial do chat IA
 * CPC - Conexão por Créditos
 */

async function responderDuvida(req, res) {

    try {

        const mensagem = String(

            req.body?.mensagem ||
            req.body?.message ||
            req.body?.pergunta ||
            ""

        ).trim();

        if (!mensagem) {

            return res.status(400).json({

                sucesso: false,

                resposta: "Digite uma pergunta."

            });

        }

        /*
         * Identificador da conversa.
         * Se houver login utiliza o id do usuário.
         * Caso contrário usa sessão.
         */

        const conversationId =

            req.session?.user?.id ||

            req.sessionID ||

            req.ip;

        const historico = history.get(conversationId);

        const resposta = await aiService.answer(

            mensagem,

            historico

        );

        history.add(

            conversationId,

            "user",

            mensagem

        );

        history.add(

            conversationId,

            "assistant",

            resposta

        );

        return res.json({

            sucesso: true,

            resposta

        });

    }

    catch (erro) {

        console.error("IA:", erro);

        return res.status(500).json({

            sucesso: false,

            resposta:

                "O assistente está temporariamente indisponível. Tente novamente em alguns instantes."

        });

    }

}

module.exports = {

    responderDuvida

};