import type { TextOverlay } from './types';

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const char of text) {
    const test = line + char;
    if (ctx.measureText(test).width > maxWidth && line.length > 0) {
      lines.push(line);
      line = char;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function compositeTextOverlay(
  imageBase64: string,
  mimeType: string,
  overlay: TextOverlay,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) { reject(new Error('canvas context unavailable')); return; }

      ctx.drawImage(img, 0, 0);

      if (!overlay.title && !overlay.subtitle) {
        resolve(canvas.toDataURL('image/png').replace('data:image/png;base64,', ''));
        return;
      }

      const W = canvas.width;
      const H = canvas.height;
      const isTop = overlay.position === 'top';
      const scrimH = H * 0.32;
      const isDark = overlay.titleColor !== 'black';

      // Gradient scrim for readability
      const gradient = ctx.createLinearGradient(
        0, isTop ? 0 : H - scrimH,
        0, isTop ? scrimH : H,
      );
      const scrim = isDark ? 'rgba(0,0,0,' : 'rgba(255,255,255,';
      gradient.addColorStop(isTop ? 0 : 1, scrim + '0.78)');
      gradient.addColorStop(isTop ? 1 : 0, scrim + '0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, isTop ? 0 : H - scrimH, W, scrimH);

      const textColor =
        overlay.titleColor === 'yellow' ? '#FFD700'
        : overlay.titleColor === 'black' ? '#1a1a1a'
        : '#FFFFFF';

      ctx.fillStyle = textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';

      const titleSize = Math.round(H * 0.068);
      const subSize = Math.round(H * 0.038);
      const maxW = W * 0.88;
      const fontStack = '"Hiragino Sans", "Noto Sans JP", "Yu Gothic", "Meiryo", sans-serif';

      ctx.shadowColor = isDark ? 'rgba(0,0,0,0.95)' : 'rgba(255,255,255,0.9)';
      ctx.shadowBlur = titleSize * 0.35;

      ctx.font = `bold ${titleSize}px ${fontStack}`;
      const titleLines = wrapText(ctx, overlay.title, maxW);
      const titleBlockH = titleLines.length * titleSize * 1.3;

      ctx.font = `${subSize}px ${fontStack}`;
      const subtitleLines = overlay.subtitle ? wrapText(ctx, overlay.subtitle, maxW) : [];
      const subBlockH = subtitleLines.length * subSize * 1.35;

      const totalH = titleBlockH + (subtitleLines.length > 0 ? subSize * 0.6 + subBlockH : 0);
      const padding = H * 0.055;

      let curY: number;
      if (isTop) {
        curY = padding + titleSize;
      } else {
        curY = H - padding - totalH + titleSize;
      }

      ctx.font = `bold ${titleSize}px ${fontStack}`;
      ctx.shadowBlur = titleSize * 0.35;
      titleLines.forEach((line, i) => {
        ctx.fillText(line, W / 2, curY + i * titleSize * 1.3, maxW);
      });

      if (subtitleLines.length > 0) {
        ctx.font = `${subSize}px ${fontStack}`;
        ctx.shadowBlur = subSize * 0.3;
        const subStartY = curY + titleBlockH + subSize * 0.6;
        subtitleLines.forEach((line, i) => {
          ctx.fillText(line, W / 2, subStartY + i * subSize * 1.35, maxW);
        });
      }

      resolve(canvas.toDataURL('image/png').replace('data:image/png;base64,', ''));
    };
    img.onerror = reject;
    img.src = `data:${mimeType ?? 'image/png'};base64,${imageBase64}`;
  });
}
