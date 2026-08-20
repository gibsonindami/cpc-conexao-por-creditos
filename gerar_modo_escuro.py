import re, glob, os
from collections import OrderedDict

RAIZ = os.path.dirname(os.path.abspath(__file__))
PASTA_CSS = os.path.join(RAIZ, "app", "public", "css")
IGNORAR = {"acessibilidade.css", "chat-ia.css", "modo-escuro.css", "modo-escuro-gerado.css"}

# Selectors que sabemos ter fundo colorido definido em OUTRA regra/classe
# modificadora (não detectável automaticamente) — não inverter o texto.
EXCECOES_TEXTO = {
    ("como-funciona.css", ".btn"),
}

# Selectors onde "background-color" na verdade representa um ÍCONE/TRAÇO
# (ex.: as barrinhas do menu hambúrguer) que fica sobre um fundo colorido
# (o header verde) — não é uma "superfície" de página, não deve escurecer.
EXCECOES_BG = {
    ("header.css", ".hamburger span"),
}

NAMED = {"white": (255, 255, 255), "black": (0, 0, 0)}

def hex_to_rgb(h):
    h = h.lstrip('#')
    if len(h) == 3:
        h = ''.join(c * 2 for c in h)
    if len(h) not in (6, 8):
        return None
    try:
        return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
    except ValueError:
        return None

def is_grayscale(rgb, tol=10):
    r, g, b = rgb
    return (max(r, g, b) - min(r, g, b)) <= tol

def is_dark(rgb):
    return sum(rgb) / 3 < 160

def invert_channel(v):
    # Comprime a inversao para evitar fundos quase pretos e textos estourados.
    return round(32 + (223 * (255 - v) / 255))

def rgb_to_hex(rgb):
    return "#{:02x}{:02x}{:02x}".format(*rgb)

def extrair_cor(valor):
    valor = valor.strip()
    if re.fullmatch(r'#[0-9a-fA-F]{3}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}', valor):
        return hex_to_rgb(valor)
    if valor.lower() in NAMED:
        return NAMED[valor.lower()]
    return None

def remover_comentarios(conteudo):
    return re.sub(r'/\*.*?\*/', '', conteudo, flags=re.S)

def remover_media(conteudo):
    padrao = re.compile(r'@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}')
    return padrao.sub('', conteudo)

def extrair_ultima_cor_do_shorthand(valor):
    tokens = valor.strip().split()
    for tok in reversed(tokens):
        cor = extrair_cor(tok.rstrip(';'))
        if cor:
            return cor
    return None

PROP_BG = {"background-color"}
PROP_BORDA = {"border-color", "border-top-color", "border-bottom-color",
              "border-left-color", "border-right-color"}
PROP_TEXTO = {"color"}
PROP_SHORTHAND_BORDA = {"border", "border-top", "border-bottom", "border-left", "border-right"}

regras_regex = re.compile(r'([^{}]+)\{([^{}]*)\}')

agrupado = OrderedDict()
log = []

def processar_conteudo(conteudo, nome_origem):
    varredura = remover_media(remover_comentarios(conteudo))

    for m in regras_regex.finditer(varredura):
        seletor = m.group(1).strip()
        corpo = m.group(2)
        if not seletor or seletor.startswith("@") or seletor.startswith(":root"):
            continue

        declaracoes = [d.strip() for d in corpo.split(";") if d.strip()]

        # 1ª passada: existe fundo colorido OU não-resolvível (var/gradient/url)
        # nesta MESMA regra? Se sim, não mexemos no texto dela (ex.: texto
        # branco/preto combinado propositalmente com um botão colorido).
        fundo_colorido_ou_desconhecido = False
        for decl in declaracoes:
            if ":" not in decl:
                continue
            prop, _, valor = decl.partition(":")
            prop = prop.strip().lower()
            valor = valor.strip()
            if prop in ("background", "background-color"):
                if "var(" in valor or "gradient" in valor or "url(" in valor:
                    fundo_colorido_ou_desconhecido = True
                else:
                    cor_bg = extrair_cor(valor)
                    if cor_bg is not None and not is_grayscale(cor_bg):
                        fundo_colorido_ou_desconhecido = True

        overrides_da_regra = {}
        for decl in declaracoes:
            if ":" not in decl:
                continue
            prop, _, valor = decl.partition(":")
            prop = prop.strip().lower()
            valor = valor.strip()

            cor = None
            prop_final = None
            categoria = None

            if prop in PROP_BG:
                cor = extrair_cor(valor)
                prop_final = "background-color"
                categoria = "bg"
            elif prop == "background":
                if "gradient" not in valor and "url(" not in valor and "var(" not in valor:
                    cor = extrair_cor(valor)
                    prop_final = "background-color"
                    categoria = "bg"
            elif prop in PROP_BORDA:
                cor = extrair_cor(valor)
                prop_final = prop
                categoria = "borda"
            elif prop in PROP_SHORTHAND_BORDA:
                cor = extrair_ultima_cor_do_shorthand(valor)
                prop_final = "border-color" if prop == "border" else prop + "-color"
                categoria = "borda"
            elif prop in PROP_TEXTO:
                cor = extrair_cor(valor)
                prop_final = "color"
                categoria = "texto"

            if cor is None or not is_grayscale(cor):
                continue

            if categoria == "bg" and (nome_origem, seletor) in EXCECOES_BG:
                continue

            if categoria == "texto":
                if not is_dark(cor):
                    continue  # texto já claro -> provavelmente proposital sobre fundo colorido
                if fundo_colorido_ou_desconhecido:
                    continue  # fundo colorido/desconhecido na mesma regra -> não mexe no texto
                if (nome_origem, seletor) in EXCECOES_TEXTO:
                    continue

            if categoria == "borda" and sum(cor) / 3 >= 250:
                continue  # borda branca pura -> destaque proposital sobre fundo colorido/escuro

            novo_rgb = tuple(invert_channel(c) for c in cor)
            novo_hex = rgb_to_hex(novo_rgb)
            if novo_hex.lower() == rgb_to_hex(cor).lower():
                continue

            overrides_da_regra[prop_final] = novo_hex
            log.append(f"{nome_origem}: {seletor} {{ {prop_final}: {rgb_to_hex(cor)} -> {novo_hex} }}")

        if overrides_da_regra:
            chave = (nome_origem, seletor)
            agrupado.setdefault(chave, {}).update(overrides_da_regra)

# --- 1) Arquivos CSS normais ---
for caminho in sorted(glob.glob(os.path.join(PASTA_CSS, "*.css"))):
    nome = os.path.basename(caminho)
    if nome in IGNORAR:
        continue
    with open(caminho, encoding="utf-8") as f:
        processar_conteudo(f.read(), nome)

# --- 2) Blocos <style> embutidos em .ejs (ex.: novo-anuncio.ejs) ---
PASTA_VIEWS = os.path.join(RAIZ, "app", "views")
for caminho in glob.glob(os.path.join(PASTA_VIEWS, "**", "*.ejs"), recursive=True):
    with open(caminho, encoding="utf-8") as f:
        conteudo_ejs = f.read()
    for bloco in re.findall(r'<style[^>]*>(.*?)</style>', conteudo_ejs, flags=re.S):
        nome_rel = os.path.relpath(caminho, RAIZ)
        processar_conteudo(bloco, nome_rel)

print(f"Total de declaracoes neutras encontradas: {len(log)}")
print(f"Total de seletores com override: {len(agrupado)}")
print("\n".join(log))

def prefixar_seletor(sel):
    partes = [p.strip() for p in sel.split(",")]
    novas = []
    for p in partes:
        if p == "html":
            novas.append("html.a11y-dark")
        elif p == "*":
            novas.append("html.a11y-dark *")
        else:
            novas.append(f"html.a11y-dark {p}")
    return ", ".join(novas)

linhas = [
    "/* Arquivo GERADO automaticamente por gerar_modo_escuro.py - nao editar a mao.",
    "   Mapeia cores neutras (branco/preto/cinza) do site para equivalentes escuras",
    "   quando o modo escuro esta ativo. Cores da marca (verde, laranja, vermelho,",
    "   azul etc.) e textos/bordas claros propositais sobre fundo colorido NAO",
    "   sao alterados. */",
    "",
]
arquivo_atual = None
for (nome, seletor), props in agrupado.items():
    if nome != arquivo_atual:
        arquivo_atual = nome
        linhas.append(f"\n/* origem: {nome} */")
    seletor_novo = prefixar_seletor(seletor)
    decls = " ".join(f"{p}: {v} !important;" for p, v in props.items())
    linhas.append(f"{seletor_novo} {{ {decls} }}")

# --- Overrides manuais de variáveis CSS (:root) ---
# Estes dois arquivos usam var(--nome) para cor, o que o regex de cores
# não enxerga. Sobrescrevemos só as variáveis NEUTRAS (fundo/texto/borda);
# as variáveis de marca (verde, amarelo, laranja) ficam de fora de propósito.
linhas.append("""
/* origem: variáveis CSS (:root) - resumo-troca.css */
html.a11y-dark {
    --bg-page: #202020;
    --bg-card: #2a2a2a;
    --text-dark: #e1e1e1;
    --text-mid: #c7c7c7;
    --text-light: #b0b0b0;
    --border: #4d4d4d;
}

/* origem: variáveis CSS (:root) - contato-troca.css
   (--color-text-light não é sobrescrito de propósito: é usado só no
   botão "Iniciar Troca", que tem fundo laranja fixo em --color-secondary,
   então o texto precisa continuar escuro para manter contraste ali) */
html.a11y-dark {
    --color-text-dark: #e1e1e1;
}

/* O botão do banner mantém o verde da marca sobre o fundo claro. */
html.a11y-dark .btn-banner,
html.a11y-dark .btn-banner:hover {
    color: #065f46 !important;
}
""")

saida = os.path.join(PASTA_CSS, "modo-escuro.css")
with open(saida, "w", encoding="utf-8") as f:
    f.write("\n".join(linhas).rstrip() + "\n")
print("\nGerado em:", saida)