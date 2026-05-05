# -*- coding: utf-8 -*-
"""Markdown to note.com HTML conversion.

A pared-down port of ``pipeline/step2_convert.py`` so the orchestrator does not
have to import from outside this repo (the ``pipeline/`` tree lives in the
parent workspace and is not shipped to GitHub Actions).
"""
from __future__ import annotations

import re


def _process_inline(text: str) -> str:
    def replace_link(m: re.Match) -> str:
        return f'<a href="{m.group(2)}">{m.group(1)}</a>'

    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", replace_link, text)
    text = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"\*([^*\n]+?)\*", r"<em>\1</em>", text)
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    return text


def _lines_to_html(lines: list[str]) -> str:
    parts: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]

        if line.startswith("### "):
            parts.append(f"<h3>{_process_inline(line[4:].strip())}</h3>")
            i += 1
            continue

        if line.startswith("## "):
            parts.append(f"<h2>{_process_inline(line[3:].strip())}</h2>")
            i += 1
            continue

        if line.startswith("# "):
            parts.append(f"<h2>{_process_inline(line[2:].strip())}</h2>")
            i += 1
            continue

        if re.match(r"^---+$", line.strip()):
            parts.append("<hr>")
            i += 1
            continue

        if line.startswith("> "):
            block_lines: list[str] = []
            while i < len(lines) and (lines[i].startswith("> ") or lines[i] == ">"):
                block_lines.append(lines[i][2:] if lines[i].startswith("> ") else "")
                i += 1
            parts.append(f"<blockquote>{_lines_to_html(block_lines)}</blockquote>")
            continue

        if line.startswith("- ") or line.startswith("* "):
            items: list[str] = []
            while i < len(lines) and (lines[i].startswith("- ") or lines[i].startswith("* ")):
                items.append(_process_inline(lines[i][2:].strip()))
                i += 1
            parts.append("<ul>" + "".join(f"<li>{x}</li>" for x in items) + "</ul>")
            continue

        if re.match(r"^\d+\.\s", line):
            items = []
            while i < len(lines) and re.match(r"^\d+\.\s", lines[i]):
                items.append(_process_inline(re.sub(r"^\d+\.\s*", "", lines[i]).strip()))
                i += 1
            parts.append("<ol>" + "".join(f"<li>{x}</li>" for x in items) + "</ol>")
            continue

        if line.startswith("```"):
            i += 1
            code_lines: list[str] = []
            while i < len(lines) and not lines[i].startswith("```"):
                code_lines.append(lines[i])
                i += 1
            i += 1
            parts.append("<pre><code>" + "\n".join(code_lines) + "</code></pre>")
            continue

        if not line.strip():
            i += 1
            continue

        para_lines: list[str] = []
        while i < len(lines) and lines[i].strip() and not (
            lines[i].startswith("#")
            or lines[i].startswith("> ")
            or lines[i].startswith("- ")
            or lines[i].startswith("* ")
            or re.match(r"^\d+\.\s", lines[i])
            or lines[i].startswith("```")
            or re.match(r"^---+$", lines[i].strip())
        ):
            para_lines.append(lines[i])
            i += 1
        if para_lines:
            parts.append("<p>" + "<br>".join(_process_inline(l) for l in para_lines) + "</p>")
        else:
            i += 1

    return "\n".join(parts)


def markdown_to_note_html(md: str) -> str:
    return _lines_to_html(md.splitlines())
