const SYSTEM_PROMPT = require("./systemPrompt");
const rules = require("./responseRules");
const database = require("./databaseService");

const MODEL =
process.env.GEMINI_MODEL || "gemini-2.5-flash";

async function perguntarGemini(message, history = [], localContext = "") {

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error("GEMINI_API_KEY não encontrada.");
    }

    const contents = [];

    contents.push({
        role: "user",
        parts: [{
            text:
`${SYSTEM_PROMPT}

==========================
BASE DE CONHECIMENTO CPC
==========================

${localContext}

Sempre utilize primeiro a base de conhecimento acima.

Somente complemente a resposta caso necessário.

Nunca invente funcionalidades inexistentes.
`
        }]
    });

    history.forEach(item => {

        contents.push({

            role: item.role === "assistant"
                ? "model"
                : "user",

            parts: [{
                text: item.content
            }]

        });

    });

    contents.push({

        role: "user",

        parts: [{
            text: message
        }]

    });

    const response = await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,

        {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                contents,

                generationConfig: {

                    temperature: 0.2,

                    topP: 0.8,

                    topK: 30,

                    maxOutputTokens: 700

                }

            })

        }

    );

    if (!response.ok) {

        throw new Error(await response.text());

    }

    const json = await response.json();

    return json.candidates[0].content.parts[0].text;

}

async function answer(message, history = []) {

    if (!message) {

        return "Digite uma pergunta.";

    }

    if (rules.isGreeting(message)) {

        return rules.getGreetingResponse();

    }

    if (rules.isThanks(message)) {

        return rules.getThanksResponse();

    }

    if (rules.isForbidden(message)) {

        return rules.getForbiddenResponse();

    }

    const local = database.search(message);

    if (local.found && local.source === "faq") {

        return local.answer;

    }

    const contexto = local.found
        ? local.answer
        : "";

    return perguntarGemini(

        message,

        history,

        contexto

    );

}

module.exports = {

    answer

};