/**
 * iaController.js
 * ------------------------------------------------------------------
 * Integração com a API da Anthropic (Claude) para o chat de dúvidas
 * do site CPC - Conexão por Créditos.
 *
 * O assistente responde apenas sobre o funcionamento do site
 * (doações, trocas, sistema de créditos, cadastro, categorias etc.).
 *
 * Requer a variável de ambiente ANTHROPIC_API_KEY (arquivo .env).
 * Obtenha uma chave em: https://console.anthropic.com/
 * ------------------------------------------------------------------
 */

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5";

// Contexto/base de conhecimento do site, usado para instruir o modelo.
// Mantenha isso atualizado se as regras da plataforma mudarem.
const SYSTEM_PROMPT = `
Você é o assistente virtual do site "CPC - Conexão por Créditos".

SOBRE O SITE:
O CPC é uma plataforma social sem fins lucrativos que conecta pessoas para
DOAR e TROCAR itens e serviços, sem uso de dinheiro. O objetivo é combater
a pobreza e a exclusão social através de uma rede colaborativa.

COMO FUNCIONA:
1. Cadastro: o usuário cria uma conta gratuita (nome, e-mail e senha).
2. Anunciar: o usuário publica um anúncio de um produto ou serviço que
   quer oferecer (doar ou trocar), escolhendo categoria: Profissionais
   (serviços), Alimentação ou Infantil (Kids).
3. Créditos: ao oferecer um item/serviço ou completar uma troca, o
   usuário acumula créditos dentro da plataforma. Esses créditos podem
   ser usados para obter outros itens/serviços de outros membros.
4. Buscar e trocar: qualquer pessoa pode navegar pelos anúncios (página
   "Todos os anúncios" ou pelas categorias), entrar em contato com quem
   anunciou e combinar a troca ou retirada da doação.
5. Avaliação: depois da troca, os usuários podem avaliar a experiência,
   o que fortalece a confiança na comunidade.
6. Doações: além das trocas por crédito, o usuário também pode doar
   diretamente um item ou seu tempo/habilidade para quem precisa, sem
   esperar nada em troca.

PÁGINAS PRINCIPAIS DO SITE:
- "/" (Início): apresentação do CPC e números de impacto.
- "/sobrenos" (Sobre nós): missão, valores e propósito da organização.
- "/comofunciona" (Como funciona): passo a passo detalhado e sistema de créditos.
- "/servicos" e "/todos": áreas de busca de anúncios (profissionais, alimentos, infantil).
- "/novo-anuncio": formulário para cadastrar um novo anúncio (doação ou troca).
- "/doe": página para quem quer doar um item, serviço ou seu tempo.
- "/login" e "/cadastro": criação de conta e login.
- "/conta": perfil do usuário logado, com histórico de trocas.

REGRAS DE RESPOSTA:
- Responda sempre em português do Brasil, de forma simples, calorosa e objetiva.
- Foque em dúvidas sobre o funcionamento do site: cadastro, doações, trocas,
  créditos, categorias, segurança e uso da plataforma.
- Se a pergunta não tiver relação com o site, explique educadamente que você
  só pode ajudar com dúvidas sobre o CPC, e sugira reformular a pergunta.
- Não invente funcionalidades que não foram descritas acima. Se não tiver
  certeza sobre algo específico (ex.: prazos, valores exatos), oriente o
  usuário a verificar a página "Como Funciona" ou entrar em contato com o
  anunciante/organização.
- Nunca peça ou processe dados sensíveis (senha, número de cartão, documentos).
- Seja breve: respostas de até 3-4 frases, exceto quando o usuário pedir mais detalhes.
`.trim();

/**
 * Envia a conversa para a API da Anthropic e retorna o texto de resposta.
 * @param {string} mensagem - mensagem atual do usuário
 * @param {Array<{role: 'user'|'assistant', content: string}>} historico - mensagens anteriores
 * @returns {Promise<string>}
 */
async function responderDuvida(mensagem, historico = []) {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Sem chave configurada: devolve uma resposta padrão para não quebrar o front-end.
    return (
      "O assistente de IA ainda não foi configurado neste ambiente. " +
      "Peça ao administrador do site para configurar a variável ANTHROPIC_API_KEY no arquivo .env. " +
      "Enquanto isso, você pode consultar a página 'Como Funciona' para tirar suas dúvidas."
    );
  }

  const mensagens = [
    ...historico
      .filter((m) => m && m.role && m.content)
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 2000) })),
    { role: "user", content: String(mensagem).slice(0, 2000) },
  ];

  const resposta = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 400,
      system: SYSTEM_PROMPT,
      messages: mensagens,
    }),
  });

  if (!resposta.ok) {
    const corpoErro = await resposta.text().catch(() => "");
    throw new Error(`Erro Anthropic API (${resposta.status}): ${corpoErro}`);
  }

  const dados = await resposta.json();
  const bloco = (dados.content || []).find((c) => c.type === "text");
  return bloco ? bloco.text : "Desculpe, não consegui gerar uma resposta agora.";
}

module.exports = { responderDuvida, SYSTEM_PROMPT };