import re
import glob
import os
 
RAIZ = os.path.dirname(os.path.abspath(__file__))
 
PADRAO_CSS = re.compile(r'font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px\s*;')
PADRAO_INLINE = re.compile(r'font-size\s*:\s*([0-9]+(?:\.[0-9]+)?)px(?!\s*\*)')
 
ARQUIVOS_CSS_IGNORADOS = {"acessibilidade.css", "chat-ia.css"}
 
# Páginas com font-size dentro de atributos style="" ou <style> embutido
ARQUIVOS_EJS_COM_INLINE = [
    "app/views/pages/adm/dashboard.ejs",
    "app/views/pages/novo-anuncio.ejs",
    "app/views/pages/resumo-troca.ejs",
]
 
 
def converter_css():
    pasta_css = os.path.join(RAIZ, "app", "public", "css")
    total_arquivos = 0
    total_conversoes = 0
    for caminho in glob.glob(os.path.join(pasta_css, "*.css")):
        nome = os.path.basename(caminho)
        if nome in ARQUIVOS_CSS_IGNORADOS:
            continue
        with open(caminho, encoding="utf-8") as f:
            conteudo = f.read()
        novo, n = PADRAO_CSS.subn(r'font-size: calc(\1px * var(--a11y-escala, 1));', conteudo)
        if n > 0:
            with open(caminho, "w", encoding="utf-8") as f:
                f.write(novo)
            total_arquivos += 1
            total_conversoes += n
            print(f"  css/{nome}: {n} conversão(ões)")
    print(f"\nTotal CSS: {total_conversoes} conversões em {total_arquivos} arquivo(s).\n")
 
 
def converter_ejs_inline():
    total_conversoes = 0
    for relativo in ARQUIVOS_EJS_COM_INLINE:
        caminho = os.path.join(RAIZ, relativo)
        if not os.path.exists(caminho):
            print(f"  (aviso) não encontrado: {relativo}")
            continue
        with open(caminho, encoding="utf-8") as f:
            conteudo = f.read()
        novo, n = PADRAO_INLINE.subn(r'font-size: calc(\1px * var(--a11y-escala, 1))', conteudo)
        if n > 0:
            with open(caminho, "w", encoding="utf-8") as f:
                f.write(novo)
            total_conversoes += n
            print(f"  {relativo}: {n} conversão(ões)")
    print(f"\nTotal inline (EJS): {total_conversoes} conversões.\n")
 
 
if __name__ == "__main__":
    print("Convertendo font-size nos arquivos CSS...")
    converter_css()
    print("Convertendo font-size inline nas páginas EJS...")
    converter_ejs_inline()
    print("Concluído. Substitua também o arquivo app/public/css/acessibilidade.css")
    print("pelo arquivo corrigido enviado junto com este script.")