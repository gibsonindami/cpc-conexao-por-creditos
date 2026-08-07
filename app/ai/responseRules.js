/**
 * responseRules.js
 * ---------------------------------------------------
 * Regras auxiliares para melhorar as respostas da IA.
 * O objetivo é evitar que o Claude responda assuntos
 * que não fazem parte do CPC.
 */

const forbiddenTopics = [
    "programação",
    "javascript",
    "node",
    "python",
    "java",
    "c++",
    "php",
    "mysql",
    "sql",
    "api",
    "hack",
    "hacker",
    "invadir",
    "crack",
    "senha wifi",
    "cartão",
    "bitcoin",
    "criptomoeda",
    "ações",
    "investimento",
    "política",
    "presidente",
    "eleição",
    "religião",
    "igreja",
    "pastor",
    "padre",
    "medicina",
    "remédio",
    "doença",
    "advogado",
    "processo",
    "direito",
    "aposta",
    "cassino",
    "sexo",
    "pornografia"
];

const greetingWords = [
    "oi",
    "olá",
    "ola",
    "bom dia",
    "boa tarde",
    "boa noite",
    "e ai",
    "ei",
    "opa"
];

const thanksWords = [
    "obrigado",
    "obrigada",
    "valeu",
    "agradeço",
    "agradecido"
];

const siteTopics = [
    "cadastro",
    "login",
    "senha",
    "conta",
    "perfil",
    "crédito",
    "créditos",
    "troca",
    "trocas",
    "doação",
    "doações",
    "anúncio",
    "anuncios",
    "serviço",
    "serviços",
    "categoria",
    "categorias",
    "usuário",
    "usuarios",
    "avaliar",
    "avaliação",
    "como funciona",
    "publicar",
    "novo anúncio",
    "cpc"
];

function normalize(text) {
    return String(text)
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .trim();
}

function containsKeyword(message, list) {

    const text = normalize(message);

    return list.some(item => text.includes(normalize(item)));

}

function isGreeting(message){

    return containsKeyword(message,greetingWords);

}

function isThanks(message){

    return containsKeyword(message,thanksWords);

}

function isForbidden(message){

    return containsKeyword(message,forbiddenTopics);

}

function isAboutSite(message){

    return containsKeyword(message,siteTopics);

}

function getGreetingResponse(){

    return "Olá! 😊 Sou o assistente oficial do CPC - Conexão por Créditos. Posso ajudar com dúvidas sobre cadastro, anúncios, créditos, doações, trocas, serviços e funcionamento da plataforma.";

}

function getThanksResponse(){

    return "Fico feliz em ajudar! Sempre que precisar de informações sobre o CPC estarei à disposição.";

}

function getForbiddenResponse(){

    return "Posso ajudar apenas com assuntos relacionados ao funcionamento do CPC - Conexão por Créditos.";

}

module.exports = {

    normalize,

    isGreeting,

    isThanks,

    isForbidden,

    isAboutSite,

    getGreetingResponse,

    getThanksResponse,

    getForbiddenResponse

};