const faq = require("./database/faq.json");
const knowledge = require("./database/knowledge.json");

/**
 * Remove acentos
 */
function normalize(text = "") {

    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();

}

/**
 * Remove pontuação
 */
function clean(text = "") {

    return normalize(text)

        .replace(/[^\w\s]/g, "")

        .replace(/\s+/g, " ")

        .trim();

}

/**
 * Conta quantas palavras coincidem
 */
function similarity(question, faqQuestion) {

    const q1 = clean(question).split(" ");

    const q2 = clean(faqQuestion).split(" ");

    let score = 0;

    q2.forEach(word => {

        if (q1.includes(word)) {

            score++;

        }

    });

    return score;

}

/**
 * Busca inteligente no FAQ
 */
function searchFaq(question) {

    const pergunta = clean(question);

    let melhor = null;

    let maiorPontuacao = 0;

    faq.forEach(item => {

        const pontos = similarity(

            pergunta,

            item.pergunta

        );

        if (pontos > maiorPontuacao) {

            maiorPontuacao = pontos;

            melhor = item;

        }

    });

    if (

        melhor &&

        maiorPontuacao >= 2

    ) {

        return {

            found: true,

            source: "faq",

            answer: melhor.resposta

        };

    }

    return {

        found: false

    };

}

/**
 * Busca simples no knowledge
 */
function searchKnowledge(question) {

    const pergunta = clean(question);

    for (const chave in knowledge) {

        if (

            pergunta.includes(clean(chave))

        ) {

            const item = knowledge[chave];

            let texto = item.descricao;

            if (

                item.passos &&

                Array.isArray(item.passos)

            ) {

                texto +=

                    "\n\n" +

                    item.passos

                        .map(

                            (p, i) => `${i + 1}. ${p}`

                        )

                        .join("\n");

            }

            return {

                found: true,

                source: "knowledge",

                answer: texto

            };

        }

    }

    return {

        found: false

    };

}

/**
 * Busca geral
 */
function search(question) {

    const faqResult = searchFaq(question);

    if (faqResult.found) {

        return faqResult;

    }

    const knowledgeResult =

        searchKnowledge(question);

    if (knowledgeResult.found) {

        return knowledgeResult;

    }

    return {

        found: false

    };

}

module.exports = {

    search

};