"""Monta o .zip da entrega de TDD a partir do código atual do repositório.

Uso (na raiz do repositório):  python entrega-tdd/gerar_entrega.py
Saída: entrega-tdd/Grupo3-TDD-AgendarApresentacao.zip
"""

import html
import re
import shutil
import subprocess
import zipfile
from pathlib import Path

ENTREGA = Path(__file__).resolve().parent
RAIZ = ENTREGA.parent
API = RAIZ / "api-tcc-pro"
NOME = "Grupo3-TDD-AgendarApresentacao"
BUILD = ENTREGA / "_build" / NOME
EDGE = Path(r"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe")

DOCUMENTOS = [
    "README.md",
    "cenarios-testes-aceitacao.md",
    "diagrama-conceitual.png",
    "diagrama-conceitual.svg",
    "evolucao-tdd.md",
]

# Arquivos do sistema real que usam o domínio (o "depois").
INTEGRACAO = [
    "app/services/agenda_service.ts",
    "app/services/feriado_service.ts",
    "app/repositories/apresentacao_repository.ts",
    "app/controllers/apresentacao_controller.ts",
    "app/validators/agenda/apresentacao_validator.ts",
    "start/routes/apresentacao.ts",
    "database/migrations/1782696000000_add_professor_to_agenda_participante.ts",
]

# Arquivos que já existiam antes do trabalho e foram alterados.
ALTERADOS = ["app/services/agenda_service.ts", "app/services/feriado_service.ts"]

CSS = """
@page { size: A4; margin: 18mm 16mm; }
body { font-family: 'Segoe UI', Arial, sans-serif; color: #1e293b; font-size: 11pt; line-height: 1.45; }
h1 { font-size: 20pt; margin: 0 0 8pt; }
h2 { font-size: 14pt; margin: 18pt 0 6pt; border-bottom: 1px solid #cbd5e1; padding-bottom: 3pt; break-after: avoid; }
h3 { font-size: 12pt; margin: 12pt 0 4pt; break-after: avoid; }
table { border-collapse: collapse; width: 100%; margin: 6pt 0; font-size: 9.5pt; }
th, td { border: 1px solid #cbd5e1; padding: 4pt 6pt; text-align: left; vertical-align: top; }
th { background: #f1f5f9; }
code { font-family: Consolas, monospace; font-size: 9.5pt; background: #f1f5f9; padding: 0 2pt; }
blockquote { margin: 6pt 0; padding: 4pt 10pt; border-left: 3px solid #64748b; background: #f8fafc; }
img { max-width: 100%; }
ul { margin: 4pt 0; padding-left: 18pt; }
li { margin: 2pt 0; }
ul, table, blockquote, img { break-inside: avoid; }
"""


def rodar_git(*args: str) -> str:
    resultado = subprocess.run(
        ["git", *args], cwd=RAIZ, capture_output=True, text=True, encoding="utf-8", check=True
    )
    return resultado.stdout


def inline(texto: str) -> str:
    texto = html.escape(texto, quote=False)
    texto = re.sub(r"`([^`]+)`", r"<code>\1</code>", texto)
    texto = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", texto)
    texto = re.sub(r"(?<![*\w])\*([^*]+)\*(?![*\w])", r"<em>\1</em>", texto)
    return texto


def lista_para_html(itens: list[tuple[int, str]]) -> str:
    """Lista com até dois níveis (itens indentados viram sublista do item anterior)."""
    partes: list[str] = ["<ul>"]
    sublista_aberta = False
    for nivel, texto in itens:
        if nivel > 0 and not sublista_aberta:
            partes[-1] = partes[-1].removesuffix("</li>")
            partes.append("<ul>")
            sublista_aberta = True
        elif nivel == 0 and sublista_aberta:
            partes.append("</ul></li>")
            sublista_aberta = False
        partes.append(f"<li>{inline(texto)}</li>")
    if sublista_aberta:
        partes.append("</ul></li>")
    partes.append("</ul>")
    return "".join(partes)


def markdown_para_html(md: str) -> str:
    """Conversor mínimo para o subconjunto de markdown usado no documento."""
    saida: list[str] = []
    linhas = md.splitlines()
    i = 0
    while i < len(linhas):
        linha = linhas[i]
        if not linha.strip():
            i += 1
        elif m := re.match(r"(#{1,3}) (.*)", linha):
            nivel = len(m.group(1))
            saida.append(f"<h{nivel}>{inline(m.group(2))}</h{nivel}>")
            i += 1
        elif m := re.match(r"!\[(.*)\]\((.*)\)", linha):
            saida.append(f'<p><img alt="{html.escape(m.group(1))}" src="{m.group(2)}"></p>')
            i += 1
        elif linha.startswith(">"):
            bloco = []
            while i < len(linhas) and linhas[i].startswith(">"):
                bloco.append(inline(linhas[i].lstrip("> ")))
                i += 1
            saida.append("<blockquote>" + "<br>".join(bloco) + "</blockquote>")
        elif linha.startswith("|"):
            tabela = []
            while i < len(linhas) and linhas[i].startswith("|"):
                tabela.append([c.strip() for c in linhas[i].strip().strip("|").split("|")])
                i += 1
            cabecalho, corpo = tabela[0], tabela[2:]
            partes = ["<table><thead><tr>"]
            partes += [f"<th>{inline(c)}</th>" for c in cabecalho]
            partes.append("</tr></thead><tbody>")
            for celulas in corpo:
                partes.append("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in celulas) + "</tr>")
            partes.append("</tbody></table>")
            saida.append("".join(partes))
        elif re.match(r"\s*- ", linha):
            itens: list[tuple[int, str]] = []
            while i < len(linhas) and linhas[i].strip():
                if m := re.match(r"(\s*)- (.*)", linhas[i]):
                    itens.append((len(m.group(1)), m.group(2)))
                elif itens:
                    nivel, texto = itens[-1]
                    itens[-1] = (nivel, f"{texto} {linhas[i].strip()}")
                i += 1
            saida.append(lista_para_html(itens))
        else:
            paragrafo = []
            while (
                i < len(linhas)
                and linhas[i].strip()
                and not re.match(r"(#|\||>|\s*- |!\[)", linhas[i])
            ):
                paragrafo.append(linhas[i].strip())
                i += 1
            saida.append(f"<p>{inline(' '.join(paragrafo))}</p>")
    return "\n".join(saida)


def gerar_pdf(markdown: Path, pdf: Path) -> None:
    if not EDGE.exists():
        print(f"Aviso: Microsoft Edge não encontrado; {pdf.name} não foi gerado.")
        return
    pagina = markdown.with_suffix(".html")
    corpo = markdown_para_html(markdown.read_text(encoding="utf-8"))
    pagina.write_text(
        '<!doctype html><html lang="pt-BR"><meta charset="utf-8">'
        f"<style>{CSS}</style><body>{corpo}</body></html>",
        encoding="utf-8",
    )
    subprocess.run(
        [
            str(EDGE),
            "--headless=new",
            "--disable-gpu",
            "--no-pdf-header-footer",
            f"--print-to-pdf={pdf}",
            pagina.as_uri(),
        ],
        check=True,
        capture_output=True,
    )
    pagina.unlink()


def main() -> None:
    if BUILD.parent.exists():
        shutil.rmtree(BUILD.parent)
    BUILD.mkdir(parents=True)

    for nome in DOCUMENTOS:
        shutil.copy2(ENTREGA / nome, BUILD / nome)
    gerar_pdf(BUILD / "cenarios-testes-aceitacao.md", BUILD / "cenarios-testes-aceitacao.pdf")
    shutil.copytree(ENTREGA / "refatoracao", BUILD / "refatoracao")

    for caminho in ALTERADOS:
        destino = BUILD / "antes" / caminho
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(rodar_git("show", f"main:api-tcc-pro/{caminho}"), encoding="utf-8")

    projeto = BUILD / "projeto"
    shutil.copytree(ENTREGA / "projeto-base", projeto)
    shutil.copytree(API / "app/domain/apresentacao", projeto / "app/domain/apresentacao")
    shutil.copytree(API / "tests/unit/apresentacao", projeto / "tests/unit/apresentacao")

    for caminho in INTEGRACAO:
        destino = BUILD / "depois" / caminho
        destino.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(API / caminho, destino)

    diff = rodar_git("diff", "main", "--", *[f"api-tcc-pro/{c}" for c in ALTERADOS])
    (BUILD / "antes-depois.diff").write_text(diff, encoding="utf-8")

    zip_path = ENTREGA / f"{NOME}.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for arquivo in sorted(BUILD.rglob("*")):
            if arquivo.is_file():
                zf.write(arquivo, Path(NOME) / arquivo.relative_to(BUILD))

    shutil.rmtree(BUILD.parent)
    print(f"Gerado: {zip_path}")


if __name__ == "__main__":
    main()
