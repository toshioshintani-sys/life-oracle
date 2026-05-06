# -*- coding: utf-8 -*-
"""Gachijin thumbnail generation.

Current policy:
- OpenAI gpt-image-1 generates a **complete text-included thumbnail**.
- Pillow is used only for resizing/cropping to note.com's required 1280x670
  and for dry-run placeholders. Production no longer does "photo + Pillow text
  overlay".

Artifacts:
- raw_dayN.png   : OpenAI source image resized to 1280x670. It already contains
                  all labels/copy in the image.
- final_dayN.png : validated final copy used for note eyecatch upload.
                  Usually byte-identical to raw_dayN.png after normalization.
"""
from __future__ import annotations

import base64
import io
import logging
import os
import re
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib import error, request

logger = logging.getLogger(__name__)

IMAGE_SIZE = (1280, 670)
OPENAI_IMAGE_MODEL = os.environ.get("GACHIJIN_IMAGE_MODEL", "gpt-image-1")
OPENAI_IMAGE_ENDPOINT = "https://api.openai.com/v1/images/generations"

# gpt-image-1 size choices are constrained. Generate landscape, then crop to
# note's 1280x670. Prompt asks the model to keep important text inside a safe
# horizontal band so center-crop does not cut labels.
OPENAI_REQUEST_SIZE = "1536x1024"

SERIES_LABEL = "ガチ人シリーズ"
DAY_LABELS = {
    1: "Day1 気づき",
    2: "Day2 現場",
    3: "Day3 対処",
}

THEME_NUMBERS = {
    "サンクコスト": 1,
    "損失回避": 2,
    "現在バイアス": 3,
    "アンカリング": 4,
    "フレーミング": 5,
    "保有効果": 6,
    "双曲割引": 7,
    "バンドワゴン": 8,
    "確証バイアス": 9,
    "現状維持": 10,
    "計画錯誤": 11,
    "ギャンブラー": 12,
    "ハロー": 13,
    "ピグマリオン": 14,
    "ゴーレム": 15,
    "ザイアンス": 16,
    "カリギュラ": 17,
    "バーナム": 18,
    "スポットライト": 19,
    "ツァイガルニク": 20,
    "プラシーボ": 21,
    "ウェブレン": 22,
    "スノッブ": 23,
    "ピーク": 24,
    "傍観者": 25,
    "同調圧力": 26,
    "権威": 27,
    "内集団": 28,
    "吊り橋": 29,
    "返報性": 30,
    "社会的証明": 31,
    "希少性": 32,
    "ステレオタイプ": 33,
    "ダニング": 34,
    "認知的不協和": 35,
    "コンコルド": 36,
    "利用可能性": 37,
    "代表性": 38,
    "感情ヒューリスティック": 39,
    "基本的帰属": 40,
    "自己奉仕": 41,
    "正常性": 42,
    "コントロール幻想": 43,
    "後知恵": 44,
    "ナラティブ": 45,
}

BOTTOM_COPY = {
    "サンクコスト": {
        1: "もう戻れない、もったいない。\nその思考が、あなたの選択を縛っている。",
        2: "誰もやめようと言えない。\n積み上げた時間が、判断を重くする。",
        3: "過去ではなく、これからを見る。\n判断の基準を、静かに戻す。",
    },
    "カリギュラ": {
        1: "禁止されるほど、気になる。\nその反応には、名前がある。",
        2: "見ないでと言われるほど、見たくなる。\n職場にも日常にも、よくある反応。",
        3: "隠すほど、燃える。\nならば見せ方を変えればいい。",
    },
    "ハロー": {
        1: "一つの印象が、全体をゆがめる。\n見た目だけで、決めていないか。",
        2: "肩書き、服装、話し方。\n最初の光が、判断を包み込む。",
        3: "印象を疑うだけで、見え方は変わる。\n評価を一度、分解してみる。",
    },
}


@dataclass
class ThumbnailArtifacts:
    raw_path: Path
    final_path: Path
    source: str  # "openai_integrated_text" / "dry_run"


def _theme_number(sub_text: str) -> int:
    for key, number in THEME_NUMBERS.items():
        if key in sub_text:
            return number
    return 1


def _bottom_copy(sub_text: str, day_no: int) -> str:
    for key, values in BOTTOM_COPY.items():
        if key in sub_text:
            return values.get(day_no, values.get(1, ""))
    if day_no == 1:
        return "その行動には、名前がある。\n気づいた瞬間、選び方が変わる。"
    if day_no == 2:
        return "職場で、日常で、何度も起きる。\n見えない心理が、場面を動かす。"
    return "いつもの反応を、少し変える。\n今日の選択から、流れは変わる。"


def _scene_description(moment: str, sub_text: str, day_no: int) -> str:
    """Bias-aware English scene description for the integrated prompt."""
    if "サンクコスト" in sub_text:
        if day_no == 1:
            return (
                "a Japanese man in his 30s in a softly lit morning cafe, hesitating over a cancellation decision, "
                "looking at a smartphone cancellation screen, receipts, bills, a notebook, a coffee cup, and documents "
                "that clearly suggest money and time already spent"
            )
        if day_no == 2:
            return (
                "a Japanese office worker in a quiet morning meeting room, sitting with failed project documents, "
                "red loss figures, printed reports, and a laptop on the table, unable to say they should stop the project"
            )
        return (
            "a Japanese man at a morning desk calmly rewriting a decision memo, separating past costs from future choices, "
            "with receipts pushed aside and a notebook open to a fresh page"
        )
    if "カリギュラ" in sub_text:
        return (
            "a Japanese person in a morning room reaching toward a phone or laptop screen that shows a forbidden or locked page, "
            "hesitating with quiet curiosity, no exaggerated expression"
        )
    if "ハロー" in sub_text:
        return (
            "a Japanese office worker reviewing profile photos, resumes, and evaluation notes in morning light, "
            "almost judging a person by one polished first impression"
        )
    return (
        f"{moment}, realistic Japanese morning lifestyle or workplace scene, concrete props that visually explain the behavioral psychology theme"
    )


def _build_integrated_prompt(
    *,
    moment: str,
    main_text: str,
    sub_text: str,
    action_type: str,
    day_no: int,
) -> str:
    number = f"#{_theme_number(sub_text)}-{day_no}"
    day_label = DAY_LABELS.get(day_no, f"Day{day_no}")
    bottom_copy = _bottom_copy(sub_text, day_no)
    scene = _scene_description(moment, sub_text, day_no)

    return f"""Create a polished Japanese note-thumbnail image, 1536x1024 horizontal source, designed so the central safe area can be cropped to 1280x670 without cutting any text or labels.

This is for the morning note series "ガチ人".
The style should be a morning-friendly cinematic editorial poster:
elegant, premium, slightly literary, with strong visual impact but not too dark or heavy.

Fully integrated thumbnail design.
Do not create a plain photo for later text overlay.

Left side:
- realistic Japanese person in a relatable morning scene
- soft natural morning light
- concrete props that visually explain the behavioral psychology theme

Right side:
- elegant dark-but-not-black title area
- deep brown / charcoal / dark taupe tones
- champagne gold and warm ivory typography
- thin gold frame lines
- restrained decorative accents

Required text:
- Top-left boxed label: {SERIES_LABEL}
- Number: {number}
- Top-right label: {day_label}
- Main title: {main_text}
- Subtitle: {sub_text}
- Bottom copy: {bottom_copy}

Scene:
{scene}

Typography:
- Top-left label is bold gothic
- Main title is strong Mincho / serif / literary display style
- Main title must be the dominant element
- Text must be accurate, readable, and not cropped

Avoid:
- pure black background
- gloomy night mood
- cheap YouTube style
- generic business stock photo
- excessive decoration
- chains or hourglasses
- random text
- misspelled Japanese
- cropped labels
"""


def _request_openai_image(prompt: str, api_key: str) -> bytes:
    body = {
        "model": OPENAI_IMAGE_MODEL,
        "prompt": prompt,
        "size": OPENAI_REQUEST_SIZE,
        "n": 1,
    }
    import json as _json

    req = request.Request(
        OPENAI_IMAGE_ENDPOINT,
        data=_json.dumps(body).encode("utf-8"),
        method="POST",
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
    )
    try:
        with request.urlopen(req, timeout=180) as res:
            payload = _json.loads(res.read().decode("utf-8"))
    except error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"OpenAI image API failed: {exc.code} {detail}") from exc

    item = payload["data"][0]
    if item.get("b64_json"):
        return base64.b64decode(item["b64_json"])
    if item.get("url"):
        with request.urlopen(item["url"], timeout=60) as res:
            return res.read()
    raise RuntimeError("OpenAI image response did not contain b64_json or url")


def _resize_to_thumbnail(image_bytes: bytes) -> bytes:
    from PIL import Image  # type: ignore

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    target_w, target_h = IMAGE_SIZE
    src_ratio = img.width / img.height
    tgt_ratio = target_w / target_h
    if src_ratio > tgt_ratio:
        new_w = int(img.height * tgt_ratio)
        offset = (img.width - new_w) // 2
        img = img.crop((offset, 0, offset + new_w, img.height))
    elif src_ratio < tgt_ratio:
        new_h = int(img.width / tgt_ratio)
        # Preserve the upper editorial labels a little better than a strict
        # center crop while still trimming bottom whitespace.
        offset = max(0, (img.height - new_h) // 2 - int(img.height * 0.03))
        img = img.crop((0, offset, img.width, offset + new_h))
    img = img.resize(IMAGE_SIZE, Image.LANCZOS)
    out = io.BytesIO()
    img.save(out, format="PNG")
    return out.getvalue()


def _font(size: int):
    from PIL import ImageFont  # type: ignore

    candidates = (
        "/usr/share/fonts/opentype/noto/NotoSerifCJK-Bold.ttc",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc",
        "C:\\Windows\\Fonts\\YuMincho.ttc",
        "C:\\Windows\\Fonts\\YuGothB.ttc",
        "C:\\Windows\\Fonts\\meiryob.ttc",
    )
    for path in candidates:
        if Path(path).exists():
            try:
                return ImageFont.truetype(path, size=size)
            except OSError:
                continue
    return ImageFont.load_default()


def _text_size(draw, text: str, font) -> tuple[int, int]:
    bbox = draw.textbbox((0, 0), text, font=font, stroke_width=0)
    return bbox[2] - bbox[0], bbox[3] - bbox[1]


def _wrap_by_width(draw, text: str, font, max_width: int) -> list[str]:
    if _text_size(draw, text, font)[0] <= max_width:
        return [text]
    lines: list[str] = []
    current = ""
    for ch in text:
        candidate = current + ch
        if current and _text_size(draw, candidate, font)[0] > max_width:
            lines.append(current)
            current = ch
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def _fit_lines(draw, text: str, max_width: int, max_height: int, start: int, minimum: int) -> tuple[Any, list[str], int]:
    size = start
    while size >= minimum:
        font = _font(size)
        lines = _wrap_by_width(draw, text, font, max_width)
        if len(lines) <= 2:
            line_h = _text_size(draw, "あ", font)[1] + max(8, size // 10)
            if line_h * len(lines) <= max_height:
                return font, lines, line_h
        size -= 4
    font = _font(minimum)
    lines = _wrap_by_width(draw, text, font, max_width)[:2]
    return font, lines, _text_size(draw, "あ", font)[1] + 8


def _generate_dry_run_poster(main_text: str, sub_text: str, day_no: int, moment: str) -> bytes:
    """API-free poster placeholder that follows the new fixed visual system."""
    from PIL import Image, ImageDraw, ImageFilter  # type: ignore

    w, h = IMAGE_SIZE
    img = Image.new("RGB", IMAGE_SIZE, (42, 34, 26))
    draw = ImageDraw.Draw(img)

    # Morning photo side base
    for x in range(w):
        t = x / w
        if x < int(w * 0.48):
            base = (228, 205, 166)
        else:
            base = (42, 34, 26)
        shade = int(30 * (1 - t))
        draw.line((x, 0, x, h), fill=(max(base[0] - shade, 0), max(base[1] - shade, 0), max(base[2] - shade, 0)))

    # Soft window light
    light = Image.new("RGBA", IMAGE_SIZE, (0, 0, 0, 0))
    ldraw = ImageDraw.Draw(light)
    ldraw.ellipse((-180, -220, 720, 480), fill=(255, 238, 190, 95))
    light = light.filter(ImageFilter.GaussianBlur(70))
    canvas = Image.alpha_composite(img.convert("RGBA"), light)
    draw = ImageDraw.Draw(canvas)

    gold = (224, 198, 138, 255)
    ivory = (250, 238, 208, 255)
    brown = (58, 42, 26, 230)

    # Person silhouette and props
    draw.ellipse((190, 128, 342, 286), fill=(65, 53, 42, 150))
    draw.rounded_rectangle((120, 260, 450, 720), radius=80, fill=(72, 61, 48, 135))
    draw.rectangle((260, 520, 560, 575), fill=(245, 236, 212, 180))
    draw.rectangle((315, 568, 510, 620), fill=(245, 236, 212, 150))
    draw.ellipse((92, 520, 178, 585), fill=(250, 242, 220, 210))

    # Right dark editorial area
    overlay = Image.new("RGBA", IMAGE_SIZE, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    for x in range(int(w * 0.44), w):
        t = (x - int(w * 0.44)) / (w - int(w * 0.44))
        alpha = int(70 + 150 * t)
        odraw.line((x, 0, x, h), fill=(22, 18, 14, alpha))
    canvas = Image.alpha_composite(canvas, overlay)
    draw = ImageDraw.Draw(canvas)

    # Frames and labels
    draw.rectangle((14, 14, w - 14, h - 14), outline=(224, 198, 138, 180), width=2)
    draw.rectangle((28, 30, 330, 92), outline=(224, 198, 138, 230), width=2, fill=(250, 238, 208, 210))
    draw.text((48, 44), SERIES_LABEL, font=_font(34), fill=(54, 39, 22, 255))
    number = f"#{_theme_number(sub_text)}-{day_no}"
    draw.text((370, 43), number, font=_font(38), fill=gold)
    draw.text((1040, 48), DAY_LABELS.get(day_no, f"Day{day_no}"), font=_font(34), fill=ivory)

    draw.line((640, 158, 1210, 158), fill=(224, 198, 138, 150), width=1)
    draw.line((640, 504, 1210, 504), fill=(224, 198, 138, 110), width=1)

    # Main title / subtitle / bottom copy
    title_x = 700
    title_max_w = 520
    main_font, main_lines, main_line_h = _fit_lines(draw, main_text, title_max_w, 190, 94, 48)
    sub_font = _font(42)
    bottom_font = _font(28)
    y = 220
    for line in main_lines:
        draw.text((title_x, y), line, font=main_font, fill=gold, stroke_width=1, stroke_fill=(45, 32, 18, 180))
        y += main_line_h
    draw.text((760, max(372, y + 12)), sub_text, font=sub_font, fill=ivory)
    copy = _bottom_copy(sub_text, day_no)
    y = 540
    for line in copy.splitlines()[:2]:
        draw.text((760, y), line, font=bottom_font, fill=(242, 226, 194, 240))
        y += 38

    out = io.BytesIO()
    canvas.convert("RGB").save(out, format="PNG")
    return out.getvalue()


def _validate_final(image_bytes: bytes) -> None:
    from PIL import Image  # type: ignore

    img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    if img.size != IMAGE_SIZE:
        raise ValueError(f"final image size {img.size} != {IMAGE_SIZE}")

    gray = img.convert("L").resize((64, 32))
    pixels = list(gray.getdata())
    mean = sum(pixels) / len(pixels)
    variance = sum((p - mean) ** 2 for p in pixels) / len(pixels)
    if variance < 40:
        raise ValueError(f"final image variance too low ({variance:.1f})")

    # The new integrated design should be dark enough on the right for title
    # typography but not pure black.
    right = img.crop((760, 80, 1240, 610)).convert("L").resize((24, 24))
    avg = sum(right.getdata()) / (24 * 24)
    if avg < 18:
        raise ValueError("right title area is too close to pure black")


def render_thumbnail(
    *,
    moment: str,
    main_text: str,
    sub_text: str,
    action_type: str,
    color_preset: str,
    raw_path: Path,
    final_path: Path,
    dry_run: bool,
    day_no: int,
) -> ThumbnailArtifacts:
    raw_path.parent.mkdir(parents=True, exist_ok=True)
    final_path.parent.mkdir(parents=True, exist_ok=True)

    api_key = os.environ.get("OPENAI_API_KEY")
    source = "dry_run"

    if dry_run:
        final_bytes = _generate_dry_run_poster(main_text, sub_text, day_no, moment)
    else:
        if not api_key:
            raise RuntimeError("OPENAI_API_KEY is not set; refusing to create a production placeholder thumbnail")
        prompt = _build_integrated_prompt(
            moment=moment,
            main_text=main_text,
            sub_text=sub_text,
            action_type=action_type,
            day_no=day_no,
        )
        generated = _request_openai_image(prompt, api_key)
        final_bytes = _resize_to_thumbnail(generated)
        source = "openai_integrated_text"

    _validate_final(final_bytes)
    raw_path.write_bytes(final_bytes)
    final_path.write_bytes(final_bytes)
    return ThumbnailArtifacts(raw_path=raw_path, final_path=final_path, source=source)
