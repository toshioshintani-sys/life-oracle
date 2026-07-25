import {interpolate, spring, useCurrentFrame, useVideoConfig, Easing} from 'remotion';

// ---- 入場 ---------------------------------------------------------------
// delay フレーム後に spring で立ち上げる。damping で性格が変わる：
//   8〜14  = 跳ねる（軽い・カジュアル）
//   18〜30 = 少し行き過ぎて戻る（自然）
//   40〜200 = ピタッと止まる（硬質・実務的）
export const useEnter = (delay = 0, {damping = 26, mass = 1, from = 40} = {}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = spring({frame: frame - delay, fps, config: {damping, mass}});
  return {
    p,
    opacity: interpolate(p, [0, 1], [0, 1]),
    y: interpolate(p, [0, 1], [from, 0]),
    x: interpolate(p, [0, 1], [from, 0]),
    scale: interpolate(p, [0, 1], [0.94, 1]),
  };
};

// ---- 線形の進行度 -------------------------------------------------------
// start フレームから duration フレームかけて 0→1。イージングは任意。
export const useProgress = (start, duration, easing = Easing.inOut(Easing.cubic)) => {
  const frame = useCurrentFrame();
  return interpolate(frame, [start, start + duration], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing,
  });
};

// ---- 数字を動かす -------------------------------------------------------
// 金額・件数は「書く」のではなく「動かす」。整数に丸めて返す。
export const useCount = ({from = 0, to = 100, start = 0, duration = 30, easing = Easing.out(Easing.cubic)} = {}) => {
  const p = useProgress(start, duration, easing);
  return Math.round(interpolate(p, [0, 1], [from, to]));
};

// ---- カメラ -------------------------------------------------------------
// 個々の要素ではなく画面全体を動かす。寄る＝集中、引く＝全体像。
// 返り値を AbsoluteFill の transform にそのまま入れる。
export const useCamera = ({at = 0, duration = 30, scaleTo = 1, xTo = 0, yTo = 0} = {}) => {
  const p = useProgress(at, duration);
  const scale = interpolate(p, [0, 1], [1, scaleTo]);
  const x = interpolate(p, [0, 1], [0, xTo]);
  const y = interpolate(p, [0, 1], [0, yTo]);
  return {transform: `translate(${x}px, ${y}px) scale(${scale})`};
};

// ---- 拍 -----------------------------------------------------------------
// 30fps なら every=15 で 0.5 秒ごとの拍。登場タイミングを拍に揃えると締まる。
export const useBeat = (every = 15) => Math.floor(useCurrentFrame() / every);

// ---- 小物 ---------------------------------------------------------------
export const yen = (n) => `¥${Math.round(n).toLocaleString('ja-JP')}`;
export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
export {Easing};
