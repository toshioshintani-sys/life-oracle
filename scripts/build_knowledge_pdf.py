# -*- coding: utf-8 -*-
"""相談員ナレッジベース(集大成) の Markdown 3ファイルを 1冊の日本語埋め込みPDF に変換。
Yu Gothic を埋め込むため、どのビューア(Google Drive プレビュー含む)でも文字化けしない。
再利用可: MD を編集したら `python -X utf8 scripts/build_knowledge_pdf.py` で再生成。
"""
import os, re, html, sys
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (BaseDocTemplate, PageTemplate, Frame, Paragraph,
                                Spacer, Table, TableStyle, PageBreak, HRFlowable)

BASE = os.path.join(os.path.dirname(__file__), "..", "docs", "相談員ナレッジベース")
OUT = os.path.join(BASE, "相談員ナレッジベース_集大成.pdf")
FILES = ["README.md", "バイアス事典.md", "関連記事索引.md"]

# --- 日本語フォント埋め込み(Yu Gothic) ---
pdfmetrics.registerFont(TTFont("JP", "C:/Windows/Fonts/YuGothR.ttc", subfontIndex=0))
pdfmetrics.registerFont(TTFont("JP-B", "C:/Windows/Fonts/YuGothB.ttc", subfontIndex=0))
pdfmetrics.registerFontFamily("JP", normal="JP", bold="JP-B", italic="JP", boldItalic="JP-B")

AMBER = colors.HexColor("#b8833f")
DARK = colors.HexColor("#2d2318")
GRAY = colors.HexColor("#6b6b6b")
LIGHT = colors.HexColor("#f3ece2")

def S(name, **kw):
    kw.setdefault("fontName", "JP"); kw.setdefault("wordWrap", "CJK")
    kw.setdefault("textColor", DARK)
    return ParagraphStyle(name, **kw)

ST = {
    "title": S("title", fontName="JP-B", fontSize=22, leading=30, alignment=1, textColor=AMBER, spaceAfter=6),
    "subtitle": S("subtitle", fontSize=11, leading=18, alignment=1, textColor=GRAY, spaceAfter=4),
    "h1": S("h1", fontName="JP-B", fontSize=17, leading=24, textColor=AMBER, spaceBefore=18, spaceAfter=8),
    "h2": S("h2", fontName="JP-B", fontSize=14, leading=20, textColor=colors.HexColor("#8c5f28"), spaceBefore=15, spaceAfter=6),
    "h3": S("h3", fontName="JP-B", fontSize=12, leading=18, textColor=DARK, spaceBefore=10, spaceAfter=4),
    "h4": S("h4", fontName="JP-B", fontSize=10.5, leading=16, textColor=GRAY, spaceBefore=8, spaceAfter=3),
    "body": S("body", fontSize=9.5, leading=16, spaceAfter=4),
    "bullet": S("bullet", fontSize=9.5, leading=16, leftIndent=12, bulletIndent=2, spaceAfter=2),
    "quote": S("quote", fontSize=9.5, leading=16, leftIndent=10, textColor=GRAY, spaceAfter=4),
    "cell": S("cell", fontSize=8.5, leading=13),
    "cellh": S("cellh", fontName="JP-B", fontSize=8.8, leading=13, textColor=colors.white),
}

EMOJI = {"✅":"○ ","❌":"× ","⚠️":"! ","⚠":"! ","👉":"→ ","💡":"* ","🛑":"■ ","📁":"","🔧":"","🤖":"","→":"→"}

def inline(t):
    t = html.unescape(t)                       # &gt; 等を実体に戻す
    for e, r in EMOJI.items(): t = t.replace(e, r)
    t = re.sub(r"[\U0001F000-\U0001FAFF☀-➿️]", "", t)  # 残った絵文字除去
    t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")  # XMLエスケープ
    t = re.sub(r"`([^`]+)`", r"\1", t)         # inline code のバッククォート除去
    t = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", t)  # 太字
    t = re.sub(r"\[(.+?)\]\([^)]*\)", r"\1", t)    # リンクはテキストのみ
    return t

def build_flowables():
    flow = []
    # 表紙
    flow += [Spacer(1, 60*mm),
             Paragraph("相談員ナレッジベース", ST["title"]),
             Paragraph("— 集大成 —", ST["title"]),
             Spacer(1, 8*mm),
             Paragraph("行動経済学バイアス × ユング認知機能(光と影)", ST["subtitle"]),
             Paragraph("全35効果 / 運用方法論 / 逆引き索引 / 関連記事索引", ST["subtitle"]),
             Paragraph("ライフオラクル 500+記事・処方箋2016件の集大成", ST["subtitle"]),
             Spacer(1, 6*mm),
             Paragraph("2026-06-18", ST["subtitle"]),
             PageBreak()]
    for fi, fn in enumerate(FILES):
        path = os.path.join(BASE, fn)
        lines = open(path, encoding="utf-8").read().splitlines()
        if fi > 0: flow.append(PageBreak())
        i = 0
        while i < len(lines):
            ln = lines[i].rstrip()
            # テーブル
            if ln.startswith("|") and i+1 < len(lines) and re.match(r"^\|[\s:\-|]+\|?\s*$", lines[i+1]):
                rows = []
                while i < len(lines) and lines[i].lstrip().startswith("|"):
                    cells = [c.strip() for c in lines[i].strip().strip("|").split("|")]
                    rows.append(cells); i += 1
                rows = [rows[0]] + rows[2:]  # 区切り行を除去
                ncol = max(len(r) for r in rows)
                data = []
                for ri, r in enumerate(rows):
                    r = r + [""]*(ncol-len(r))
                    style = ST["cellh"] if ri == 0 else ST["cell"]
                    data.append([Paragraph(inline(c), style) for c in r])
                tw = 170*mm
                t = Table(data, colWidths=[tw/ncol]*ncol, repeatRows=1)
                t.setStyle(TableStyle([
                    ("BACKGROUND",(0,0),(-1,0),AMBER),
                    ("ROWBACKGROUNDS",(0,1),(-1,-1),[colors.white, LIGHT]),
                    ("GRID",(0,0),(-1,-1),0.4,colors.HexColor("#d8ccb8")),
                    ("VALIGN",(0,0),(-1,-1),"TOP"),
                    ("LEFTPADDING",(0,0),(-1,-1),5),("RIGHTPADDING",(0,0),(-1,-1),5),
                    ("TOPPADDING",(0,0),(-1,-1),4),("BOTTOMPADDING",(0,0),(-1,-1),4)]))
                flow += [Spacer(1,3), t, Spacer(1,6)]
                continue
            # 見出し
            m = re.match(r"^(#{1,6})\s+(.*)$", ln)
            if m:
                lvl = len(m.group(1)); txt = inline(m.group(2))
                flow.append(Paragraph(txt, ST.get("h%d"%min(lvl,4), ST["h4"])))
                i += 1; continue
            # 水平線
            if re.match(r"^---+\s*$", ln) or re.match(r"^\*\*\*+\s*$", ln):
                flow.append(HRFlowable(width="100%", thickness=0.6, color=colors.HexColor("#d8ccb8"), spaceBefore=4, spaceAfter=6))
                i += 1; continue
            # 引用
            if ln.startswith(">"):
                buf = []
                while i < len(lines) and lines[i].lstrip().startswith(">"):
                    buf.append(re.sub(r"^\s*>\s?", "", lines[i])); i += 1
                flow.append(Table([[Paragraph(inline(" ".join(buf)), ST["quote"])]],
                                  colWidths=[170*mm],
                                  style=TableStyle([("BACKGROUND",(0,0),(-1,-1),LIGHT),
                                                    ("LINEBEFORE",(0,0),(0,-1),2.5,AMBER),
                                                    ("LEFTPADDING",(0,0),(-1,-1),8),
                                                    ("TOPPADDING",(0,0),(-1,-1),5),("BOTTOMPADDING",(0,0),(-1,-1),5)])))
                flow.append(Spacer(1,4)); continue
            # 箇条書き(- / 数字.)
            mb = re.match(r"^(\s*)([-*]|\d+\.)\s+(.*)$", ln)
            if mb:
                indent = len(mb.group(1)); txt = inline(mb.group(3))
                bul = "・" if mb.group(2) in ("-","*") else mb.group(2)
                st = ParagraphStyle("b", parent=ST["bullet"], leftIndent=12+indent*6)
                flow.append(Paragraph(bul+" "+txt, st)); i += 1; continue
            # 空行
            if not ln.strip():
                i += 1; continue
            # 通常段落
            flow.append(Paragraph(inline(ln), ST["body"])); i += 1
    return flow

def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("JP", 8); canvas.setFillColor(GRAY)
    canvas.drawCentredString(A4[0]/2, 12*mm, "相談員ナレッジベース 集大成 — ライフオラクル")
    canvas.drawRightString(A4[0]-18*mm, 12*mm, str(doc.page))
    canvas.restoreState()

def main():
    doc = BaseDocTemplate(OUT, pagesize=A4,
                          leftMargin=18*mm, rightMargin=18*mm, topMargin=18*mm, bottomMargin=20*mm,
                          title="相談員ナレッジベース 集大成", author="ライフオラクル")
    frame = Frame(doc.leftMargin, doc.bottomMargin, doc.width, doc.height, id="main")
    doc.addPageTemplates([PageTemplate(id="main", frames=[frame], onPage=footer)])
    doc.build(build_flowables())
    print("PDF生成:", OUT, "/", os.path.getsize(OUT), "bytes")

if __name__ == "__main__":
    main()
