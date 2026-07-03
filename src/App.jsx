import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";

// ── Court constants ──────────────────────────────────────────────────
const C = { w: 620, h: 640 };
const RIM = { x: C.w / 2, y: 70 };
const HTW_GREEN = "#96BE0D";

// ── Formations ──────────────────────────────────────────────────────
const FORMATIONS = {
  "5v5": {
    A: [
      { id: "A1", label: "1", x: 310, y: 500, role: "D" },
      { id: "A2", label: "2", x: 140, y: 380, role: "3" },
      { id: "A3", label: "3", x: 480, y: 380, role: "3" },
      { id: "A4", label: "4", x: 200, y: 210, role: "M" },
      { id: "A5", label: "5", x: 420, y: 210, role: "P" },
    ],
    B: [
      { id: "B1", label: "1", x: 310, y: 420 },
      { id: "B2", label: "2", x: 190, y: 320 },
      { id: "B3", label: "3", x: 430, y: 320 },
      { id: "B4", label: "4", x: 250, y: 180 },
      { id: "B5", label: "5", x: 370, y: 180 },
    ],
    ball: "A1",
  },
  "4v4": {
    A: [
      { id: "A1", label: "1", x: 310, y: 500, role: "D" },
      { id: "A2", label: "2", x: 150, y: 360, role: "3" },
      { id: "A3", label: "3", x: 470, y: 360, role: "M" },
      { id: "A4", label: "4", x: 310, y: 230, role: "P" },
    ],
    B: [
      { id: "B1", label: "1", x: 310, y: 420 },
      { id: "B2", label: "2", x: 200, y: 310 },
      { id: "B3", label: "3", x: 420, y: 310 },
      { id: "B4", label: "4", x: 310, y: 210 },
    ],
    ball: "A1",
  },
};

// ── Plays (note keys reference i18n translation paths) ──────────────
const PLAYS = {
  "-": null,
  "Pick & Roll": {
    mode: "5v5",
    steps: [
      { noteKey: "plays.pickAndRoll.step1", pos: { A5: { x: 360, y: 470 } }, ball: "A1", dur: 1100 },
      { noteKey: "plays.pickAndRoll.step2", pos: { A1: { x: 370, y: 350 }, B1: { x: 350, y: 400 }, B5: { x: 390, y: 320 } }, ball: "A1", dribble: true, dur: 1300 },
      { noteKey: "plays.pickAndRoll.step3", pos: { A5: { x: 340, y: 180 } }, ball: "A5", dur: 1300 },
      { noteKey: "plays.pickAndRoll.step4", pos: { A5: { x: 316, y: 120 } }, ball: "A5", dribble: true, dur: 900 },
    ],
  },
  "Drive & Kick": {
    mode: "5v5",
    steps: [
      { noteKey: "plays.driveAndKick.step1", pos: { A1: { x: 330, y: 300 } }, ball: "A1", dribble: true, dur: 1200 },
      { noteKey: "plays.driveAndKick.step2", pos: { A1: { x: 320, y: 220 }, B2: { x: 250, y: 280 }, B3: { x: 380, y: 280 } }, ball: "A1", dribble: true, dur: 1200 },
      { noteKey: "plays.driveAndKick.step3", pos: { A2: { x: 100, y: 300 } }, ball: "A2", dur: 1100 },
      { noteKey: "plays.driveAndKick.step4", ball: "A2", dur: 700 },
    ],
  },
  "Give & Go": {
    mode: "5v5",
    steps: [
      { noteKey: "plays.giveAndGo.step1", ball: "A3", dur: 900 },
      { noteKey: "plays.giveAndGo.step2", pos: { A1: { x: 340, y: 230 }, B1: { x: 300, y: 330 } }, ball: "A3", dur: 1300 },
      { noteKey: "plays.giveAndGo.step3", pos: { A1: { x: 320, y: 140 } }, ball: "A1", dur: 1100 },
    ],
  },
  "Horns Set": {
    mode: "5v5",
    steps: [
      { noteKey: "plays.hornsSet.step1", pos: { A4: { x: 240, y: 300 }, A5: { x: 380, y: 300 } }, dur: 1200 },
      { noteKey: "plays.hornsSet.step2", pos: { A2: { x: 90, y: 260 }, A3: { x: 530, y: 260 } }, dur: 1200 },
      { noteKey: "plays.hornsSet.step3", pos: { A1: { x: 310, y: 400 } }, ball: "A1", dribble: true, dur: 1100 },
    ],
  },
  "Backdoor Cut": {
    mode: "5v5",
    steps: [
      { noteKey: "plays.backdoorCut.step1", pos: { A2: { x: 110, y: 420 }, B2: { x: 150, y: 400 } }, ball: "A1", dur: 1100 },
      { noteKey: "plays.backdoorCut.step2", pos: { A2: { x: 250, y: 150 } }, ball: "A1", dur: 1200 },
      { noteKey: "plays.backdoorCut.step3", ball: "A2", dur: 1000 },
    ],
  },
  "2-3 Zone (D)": {
    mode: "5v5",
    steps: [
      { noteKey: "plays.zone23.step1", pos: { B1: { x: 250, y: 340 }, B2: { x: 370, y: 340 }, B3: { x: 150, y: 200 }, B4: { x: 310, y: 150 }, B5: { x: 470, y: 200 } }, dur: 1400 },
      { noteKey: "plays.zone23.step2", pos: { A3: { x: 500, y: 330 }, B2: { x: 430, y: 330 }, B5: { x: 460, y: 220 }, B4: { x: 350, y: 170 } }, ball: "A3", dur: 1400 },
      { noteKey: "plays.zone23.step3", pos: { A5: { x: 540, y: 180 }, B5: { x: 510, y: 190 }, B4: { x: 400, y: 160 }, B3: { x: 220, y: 180 } }, ball: "A5", dur: 1400 },
    ],
  },
  "1-3-1 Zone (D)": {
    mode: "5v5",
    steps: [
      { noteKey: "plays.zone131.step1", pos: { B1: { x: 310, y: 420 }, B2: { x: 170, y: 300 }, B3: { x: 310, y: 260 }, B4: { x: 450, y: 300 }, B5: { x: 310, y: 140 } }, dur: 1400 },
      { noteKey: "plays.zone131.step2", pos: { A2: { x: 150, y: 350 }, B1: { x: 210, y: 380 }, B2: { x: 160, y: 320 } }, ball: "A2", dur: 1400 },
    ],
  },
  "Man-to-Man (D)": {
    mode: "5v5",
    steps: [
      { noteKey: "plays.manToMan.step1", pos: { B1: { x: 310, y: 460 }, B2: { x: 160, y: 380 }, B3: { x: 460, y: 380 }, B4: { x: 220, y: 230 }, B5: { x: 400, y: 230 } }, dur: 1400 },
      { noteKey: "plays.manToMan.step2", pos: { B1: { x: 280, y: 400 }, B4: { x: 250, y: 250 } }, ball: "A3", dur: 1300 },
    ],
  },
};

const ARROW = { pass: "#0A84FF", run: "#FF453A", dribble: "#FF9F0A", screen: "#6E6E73" };
const ROLE_COLOR = { D: "#FF9F0A", "3": "#30D158", M: "#0A84FF", P: "#BF5AF2" };
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const lerp = (a, b, t) => a + (b - a) * t;
const ease = (t) => 1 - Math.pow(1 - t, 3);

function wavyPath(x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const n = Math.max(4, Math.floor(len / 22));
  const ux = dx / len, uy = dy / len;
  const px = -uy, py = ux;
  let d = `M ${x1} ${y1}`;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const amp = i === n ? 0 : 6 * (i % 2 === 0 ? 1 : -1);
    const mx = x1 + dx * (t - 0.5 / n) + px * amp;
    const my = y1 + dy * (t - 0.5 / n) + py * amp;
    d += ` Q ${mx} ${my} ${x1 + dx * t} ${y1 + dy * t}`;
  }
  return d;
}

function Player({ p, team, tool, animating, ballOwner, ballFlying, showRoles, onStartDrag }) {
  const color = team === "A" ? "#FF453A" : "#0A84FF";
  const hasBall = ballOwner === p.id && !ballFlying;
  return (
    <g onMouseDown={(e) => onStartDrag(e, team, p.id)} onTouchStart={(e) => onStartDrag(e, team, p.id)}
       style={{ cursor: tool === "move" && !animating ? "grab" : "default" }}>
      <circle cx={p.x} cy={p.y} r="28" fill="transparent" />
      <circle cx={p.x} cy={p.y + 2} r="16" fill="rgba(0,0,0,0.12)" />
      {hasBall && <circle cx={p.x} cy={p.y} r="21" fill="none" stroke="#FF9F0A" strokeWidth="2.5" opacity="0.9" />}
      <circle cx={p.x} cy={p.y} r="16" fill={color} stroke="#FFFFFF" strokeWidth="2.5" />
      <text x={p.x} y={p.y + 5} textAnchor="middle" fill="#FFFFFF" fontSize="14" fontWeight="700"
            style={{ pointerEvents: "none", userSelect: "none", fontFamily: FONT }}>{p.label}</text>
      {showRoles && team === "A" && p.role && (
        <g style={{ pointerEvents: "none" }}>
          <circle cx={p.x + 13} cy={p.y - 13} r="8.5" fill={ROLE_COLOR[p.role]} stroke="#FFF" strokeWidth="1.8" />
          <text x={p.x + 13} y={p.y - 9.5} textAnchor="middle" fill="#FFF" fontSize="9.5" fontWeight="800"
                style={{ fontFamily: FONT, userSelect: "none" }}>{p.role}</text>
        </g>
      )}
    </g>
  );
}

function Arrow({ a, tool, onErase }) {
  const stroke = ARROW[a.type];
  const isScreen = a.type === "screen";
  const isDribble = a.type === "dribble";
  const ang = Math.atan2(a.y2 - a.y1, a.x2 - a.x1);
  return (
    <g onClick={() => onErase(a.id)} style={{ cursor: tool === "erase" ? "pointer" : "default" }} opacity="0.9">
      {isDribble ? (
        <path d={wavyPath(a.x1, a.y1, a.x2, a.y2)} fill="none" stroke={stroke} strokeWidth="2.5"
              strokeLinecap="round" markerEnd="url(#h-dribble)" />
      ) : (
        <line x1={a.x1} y1={a.y1} x2={a.x2} y2={a.y2} stroke={stroke} strokeWidth="2.5"
              strokeDasharray={a.type === "pass" ? "7 6" : "none"}
              markerEnd={isScreen ? "" : `url(#h-${a.type})`} strokeLinecap="round" />
      )}
      {isScreen && (
        <line x1={a.x2 - Math.sin(ang) * 11} y1={a.y2 + Math.cos(ang) * 11}
              x2={a.x2 + Math.sin(ang) * 11} y2={a.y2 - Math.cos(ang) * 11}
              stroke={stroke} strokeWidth="3.5" strokeLinecap="round" />
      )}
    </g>
  );
}

export default function App() {
  const { t, i18n } = useTranslation();

  const [wide, setWide] = useState(typeof window !== "undefined" ? window.innerWidth >= 900 : false);
  useEffect(() => {
    const onResize = () => setWide(window.innerWidth >= 900);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const [mode, setMode] = useState("5v5");
  const [teamA, setTeamA] = useState(() => FORMATIONS["5v5"].A.map((p) => ({ ...p })));
  const [teamB, setTeamB] = useState(() => FORMATIONS["5v5"].B.map((p) => ({ ...p })));
  const [ballPos, setBallPos] = useState({ x: 310, y: 524 });
  const [ballOwner, setBallOwner] = useState("A1");
  const [ballFlying, setBallFlying] = useState(false);

  const [tool, setTool] = useState("move");
  const [annotations, setAnnotations] = useState([]);
  const [drawing, setDrawing] = useState(null);
  const [showZones, setShowZones] = useState(true);
  const [showRoles, setShowRoles] = useState(true);
  const [viewTeam, setViewTeam] = useState("both");

  const [play, setPlay] = useState("-");
  const [stepIdx, setStepIdx] = useState(-1);
  const [noteKey, setNoteKey] = useState(null);
  const [animating, setAnimating] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);

  const svgRef = useRef(null);
  const dragRef = useRef(null);
  const rafRef = useRef(null);
  const autoRef = useRef(false);

  const ownerPlayer = ballOwner ? [...teamA, ...teamB].find((p) => p.id === ballOwner) : null;
  const displayBallPos = !animating && ownerPlayer ? { x: ownerPlayer.x, y: ownerPlayer.y + 24 } : ballPos;

  useEffect(() => () => cancelAnimationFrame(rafRef.current), []);

  const noteText = () => {
    if (!noteKey) return t("hint");
    if (noteKey === "base") return t("baseFormation");
    if (noteKey === "select") return t("afterSelect");
    const p = PLAYS[noteKey.play];
    if (!p) return t("hint");
    const s = p.steps[noteKey.idx];
    return `${noteKey.idx + 1}/${p.steps.length} · ${t(s.noteKey)}`;
  };

  const toSvg = useCallback((e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    const s = e.touches ? e.touches[0] : e;
    pt.x = s.clientX; pt.y = s.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: Math.max(16, Math.min(C.w - 16, p.x)), y: Math.max(16, Math.min(C.h - 16, p.y)) };
  }, []);

  const loadFormation = useCallback((m) => {
    setTeamA(FORMATIONS[m].A.map((p) => ({ ...p })));
    setTeamB(FORMATIONS[m].B.map((p) => ({ ...p })));
    setBallOwner(FORMATIONS[m].ball);
    setAnnotations([]);
    setStepIdx(-1);
    setNoteKey(null);
  }, []);

  const changeMode = (m) => {
    if (animating) return;
    autoRef.current = false; setAutoPlaying(false);
    setMode(m); setPlay("-"); loadFormation(m);
  };

  const animateTo = (targetA, targetB, ballFrom, ballTo, isPass, targetOwner, arrows, dur, onDone) => {
    setAnnotations(arrows);
    setAnimating(true);
    setBallFlying(isPass);
    const fromA = teamA.map((p) => ({ ...p }));
    const fromB = teamB.map((p) => ({ ...p }));
    const start = performance.now();
    const dist = Math.hypot(ballTo.x - ballFrom.x, ballTo.y - ballFrom.y);
    const arcH = isPass ? Math.min(90, 25 + dist * 0.25) : 0;

    const tick = (now) => {
      const raw = Math.min(1, (now - start) / dur);
      const tt = ease(raw);
      setTeamA(fromA.map((p) => {
        const tg = targetA.find((q) => q.id === p.id) || p;
        return { ...p, x: lerp(p.x, tg.x, tt), y: lerp(p.y, tg.y, tt) };
      }));
      setTeamB(fromB.map((p) => {
        const tg = targetB.find((q) => q.id === p.id) || p;
        return { ...p, x: lerp(p.x, tg.x, tt), y: lerp(p.y, tg.y, tt) };
      }));
      const bx = lerp(ballFrom.x, ballTo.x, tt);
      const by = lerp(ballFrom.y, ballTo.y, tt) - arcH * Math.sin(Math.PI * tt);
      setBallPos({ x: bx, y: by });
      if (raw < 1) rafRef.current = requestAnimationFrame(tick);
      else {
        setTeamA(targetA.map((p) => ({ ...p })));
        setTeamB(targetB.map((p) => ({ ...p })));
        setBallPos(ballTo);
        setBallOwner(targetOwner);
        setBallFlying(false);
        setAnimating(false);
        onDone && onDone();
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const layoutAtStep = (playObj, idx) => {
    const A = FORMATIONS[playObj.mode].A.map((p) => ({ ...p }));
    const B = FORMATIONS[playObj.mode].B.map((p) => ({ ...p }));
    let owner = FORMATIONS[playObj.mode].ball;
    for (let i = 0; i <= idx; i++) {
      const step = playObj.steps[i];
      if (step.pos) Object.entries(step.pos).forEach(([id, xy]) => {
        const pl = (id[0] === "A" ? A : B).find((q) => q.id === id);
        if (pl) { pl.x = xy.x; pl.y = xy.y; }
      });
      if (step.ball) owner = step.ball;
    }
    return { A, B, owner };
  };

  const arrowsForStep = (prevAll, nextAll, step, prevOwner) => {
    const arrows = [];
    if (step.pos) Object.keys(step.pos).forEach((id) => {
      const p0 = prevAll.find((q) => q.id === id);
      const p1 = nextAll.find((q) => q.id === id);
      if (p0 && p1 && (p0.x !== p1.x || p0.y !== p1.y)) {
        const isBallCarrier = step.dribble && id === prevOwner;
        arrows.push({
          id: `${id}-${Math.round(p0.x)}-${Math.round(p0.y)}-${Math.round(p1.x)}-${Math.round(p1.y)}`,
          type: isBallCarrier ? "dribble" : (id[0] === "A" ? "run" : "screen"),
          x1: p0.x, y1: p0.y, x2: p1.x, y2: p1.y,
        });
      }
    });
    if (step.ball && step.ball !== prevOwner) {
      const from = prevAll.find((q) => q.id === prevOwner);
      const to = nextAll.find((q) => q.id === step.ball);
      if (from && to) arrows.push({
        id: `ball-${prevOwner}-${step.ball}`, type: "pass",
        x1: from.x, y1: from.y + 24, x2: to.x, y2: to.y + 24,
      });
    }
    return arrows;
  };

  const goToStep = (targetIdx, chain) => {
    const playObj = PLAYS[play];
    if (!playObj || animating) return;
    if (targetIdx < -1 || targetIdx >= playObj.steps.length) { autoRef.current = false; setAutoPlaying(false); return; }

    if (targetIdx === -1) {
      const base = layoutAtStep(playObj, -1);
      const bp = base.A.concat(base.B).find((p) => p.id === base.owner);
      animateTo(base.A, base.B, displayBallPos, { x: bp.x, y: bp.y + 24 }, false, base.owner, [], 800, () => {
        setStepIdx(-1); setNoteKey("base");
      });
      return;
    }

    const prev = layoutAtStep(playObj, targetIdx - 1);
    const next = layoutAtStep(playObj, targetIdx);
    const step = playObj.steps[targetIdx];
    const prevAll = prev.A.concat(prev.B);
    const nextAll = next.A.concat(next.B);
    const isPass = !!(step.ball && step.ball !== prev.owner);
    const bF = prevAll.find((p) => p.id === prev.owner);
    const bT = nextAll.find((p) => p.id === next.owner);
    const ballFrom = bF ? { x: bF.x, y: bF.y + 24 } : ballPos;
    const ballTo = bT ? { x: bT.x, y: bT.y + 24 } : ballPos;
    const arrows = arrowsForStep(prevAll, nextAll, step, prev.owner);

    animateTo(next.A, next.B, ballFrom, ballTo, isPass, next.owner, arrows, step.dur || 1100, () => {
      setStepIdx(targetIdx);
      setNoteKey({ play, idx: targetIdx });
      if (chain && autoRef.current) {
        if (targetIdx + 1 < playObj.steps.length) setTimeout(() => goRef.current(targetIdx + 1, true), 500);
        else { autoRef.current = false; setAutoPlaying(false); }
      }
    });
  };
  const goRef = useRef(goToStep);
  useEffect(() => {
    goRef.current = goToStep;
  });

  const autoPlay = () => {
    if (play === "-" || animating) return;
    autoRef.current = true;
    setAutoPlaying(true);
    goToStep(stepIdx + 1 < (PLAYS[play]?.steps.length || 0) ? stepIdx + 1 : 0, true);
  };
  const stopAuto = () => { autoRef.current = false; setAutoPlaying(false); };

  const selectPlay = (name) => {
    if (animating) return;
    stopAuto();
    setPlay(name);
    const playObj = PLAYS[name];
    if (!playObj) { loadFormation(mode); return; }
    if (playObj.mode !== mode) setMode(playObj.mode);
    loadFormation(playObj.mode);
    setNoteKey("select");
  };

  const startDrag = (e, kind, id) => {
    if (tool !== "move" || animating) return;
    e.stopPropagation();
    dragRef.current = { kind, id };
  };
  const onMove = (e) => {
    if (dragRef.current && tool === "move") {
      const p = toSvg(e);
      const { kind, id } = dragRef.current;
      if (kind === "A") setTeamA((tm) => tm.map((x) => (x.id === id ? { ...x, ...p } : x)));
      else if (kind === "B") setTeamB((tm) => tm.map((x) => (x.id === id ? { ...x, ...p } : x)));
      else if (kind === "ball") { setBallPos(p); setBallOwner(null); }
      return;
    }
    if (drawing) { const p = toSvg(e); setDrawing((d) => ({ ...d, x2: p.x, y2: p.y })); }
  };
  const endDrag = () => {
    dragRef.current = null;
    if (drawing) {
      if (Math.hypot(drawing.x2 - drawing.x1, drawing.y2 - drawing.y1) > 14)
        setAnnotations((a) => [...a, { ...drawing, id: Date.now() }]);
      setDrawing(null);
    }
  };
  const startDraw = (e) => {
    if (animating) return;
    if (["pass", "run", "dribble", "screen"].includes(tool)) {
      const p = toSvg(e);
      setDrawing({ type: tool, x1: p.x, y1: p.y, x2: p.x, y2: p.y });
    }
  };
  const eraseAnn = (id) => { if (tool === "erase") setAnnotations((a) => a.filter((x) => x.id !== id)); };

  const pill = (active) => ({
    padding: "11px 16px", borderRadius: 22, border: "none", minHeight: 44,
    background: active ? "#1D1D1F" : "#FFFFFF",
    color: active ? "#FFFFFF" : "#1D1D1F",
    fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: FONT,
    boxShadow: active ? "0 2px 8px rgba(0,0,0,0.18)" : "0 1px 3px rgba(0,0,0,0.08)",
    transition: "all .25s cubic-bezier(.25,.1,.25,1)",
    touchAction: "manipulation", WebkitTapHighlightColor: "transparent",
  });

  const playObj = PLAYS[play];
  const totalSteps = playObj ? playObj.steps.length : 0;
  const currentLang = i18n.language?.slice(0, 2);

  return (
    <div style={{ fontFamily: FONT, background: "#F5F5F7", minHeight: "100%", padding: "24px 16px",
                  color: "#1D1D1F", boxSizing: "border-box" }}>
      <div style={{ maxWidth: wide ? 1120 : 700, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
          <div>
            <h1 style={{ margin: "0 0 2px", fontSize: 26, fontWeight: 700, letterSpacing: -0.6 }}>{t("title")}</h1>
            <p style={{ margin: "0 0 4px", fontSize: 14, color: "#86868B" }}>{t("subtitle")}</p>
            <p style={{ margin: "0 0 16px", fontSize: 12, color: "#AEAEB2" }}>{t("credit")}</p>
          </div>
          {/* language switch */}
          <div style={{ display: "flex", background: "#FFFFFF", borderRadius: 20, padding: 3,
                        boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}>
            {["en", "de"].map((l) => (
              <button key={l} onClick={() => i18n.changeLanguage(l)} style={{
                padding: "6px 14px", borderRadius: 17, border: "none",
                background: currentLang === l ? "#1D1D1F" : "transparent",
                color: currentLang === l ? "#FFF" : "#86868B",
                fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: FONT,
                transition: "all .25s" }}>{l.toUpperCase()}</button>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gap: 16, alignItems: "start",
                      gridTemplateColumns: wide ? "minmax(360px, 1fr) minmax(300px, 420px)" : "1fr" }}>

          {/* mode + tools */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap",
                        gridColumn: wide ? 2 : "auto", gridRow: wide ? 1 : "auto" }}>
            {["5v5", "4v4"].map((m) => (
              <button key={m} onClick={() => changeMode(m)} style={pill(mode === m)}>{m}</button>
            ))}
            <div style={{ width: 1, background: "#D2D2D7", margin: "4px 2px" }} />
            {[["move", t("move")], ["pass", t("pass")], ["run", t("run")], ["dribble", t("dribble")], ["screen", t("screen")], ["erase", t("erase")]].map(([id, label]) => (
              <button key={id} onClick={() => setTool(id)} style={pill(tool === id)}>{label}</button>
            ))}
            <button onClick={() => setAnnotations([])} style={{ ...pill(false), color: "#86868B" }}>{t("clear")}</button>
            <div style={{ width: 1, background: "#D2D2D7", margin: "4px 2px" }} />
            <button onClick={() => setShowZones((z) => !z)} style={pill(showZones)}>{t("zones")}</button>
            <button onClick={() => setShowRoles((r) => !r)} style={pill(showRoles)}>{t("roles")}</button>
            <div style={{ width: 1, background: "#D2D2D7", margin: "4px 2px" }} />
            {[["both", t("viewBoth")], ["A", t("viewA")], ["B", t("viewB")]].map(([id, label]) => (
              <button key={id} onClick={() => setViewTeam(id)}
                      style={{ ...pill(viewTeam === id),
                               color: viewTeam === id ? "#FFF" : (id === "A" ? "#FF453A" : id === "B" ? "#0A84FF" : "#1D1D1F") }}>
                {label}
              </button>
            ))}
          </div>

          {/* court */}
          <div style={{ background: "#FFFFFF", borderRadius: 20, padding: 14,
                        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
                        gridColumn: wide ? 1 : "auto", gridRow: wide ? "1 / span 4" : "auto" }}>
            <svg ref={svgRef} viewBox={`0 0 ${C.w} ${C.h}`}
                 style={{ width: "100%", maxWidth: wide ? 560 : 470, margin: "0 auto", height: "auto",
                          touchAction: "none", display: "block" }}
                 onMouseMove={onMove} onMouseUp={endDrag} onMouseLeave={endDrag} onMouseDown={startDraw}
                 onTouchMove={onMove} onTouchEnd={endDrag} onTouchStart={startDraw}>
              <defs>
                <marker id="h-run" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#FF453A" /></marker>
                <marker id="h-pass" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#0A84FF" /></marker>
                <marker id="h-dribble" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#FF9F0A" /></marker>
                <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#EDD9BF" /><stop offset="100%" stopColor="#E3CBA9" />
                </linearGradient>
                <clipPath id="arcClip">
                  <path d={`M ${RIM.x - 220} 12 L ${RIM.x - 220} 120 A 220 220 0 0 0 ${RIM.x + 220} 120 L ${RIM.x + 220} 12 Z`} />
                </clipPath>
              </defs>

              <rect x="0" y="0" width={C.w} height={C.h} fill="url(#wood)" rx="14" />

              {showZones && (
                <g style={{ pointerEvents: "none" }}>
                  <rect x="12" y="12" width={C.w - 24} height={C.h - 24} fill="rgba(10,132,255,0.10)" clipPath="url(#arcClip)" />
                  <rect x={RIM.x - 70} y="12" width="140" height="188" fill="rgba(191,90,242,0.16)" />
                  <text x={RIM.x + 150} y="80" textAnchor="middle" fill="#0A84FF" opacity="0.55" fontSize="13"
                        fontWeight="800" letterSpacing="2" style={{ fontFamily: FONT }}>{t("zoneMid")}</text>
                  <text x={RIM.x} y="185" textAnchor="middle" fill="#BF5AF2" opacity="0.6" fontSize="13"
                        fontWeight="800" letterSpacing="2" style={{ fontFamily: FONT }}>{t("zonePaint")}</text>
                  <text x={90} y="120" textAnchor="middle" fill="#30D158" opacity="0.7" fontSize="13"
                        fontWeight="800" letterSpacing="2" style={{ fontFamily: FONT }}>{t("zone3")}</text>
                  <text x={C.w - 90} y="120" textAnchor="middle" fill="#30D158" opacity="0.7" fontSize="13"
                        fontWeight="800" letterSpacing="2" style={{ fontFamily: FONT }}>{t("zone3")}</text>
                </g>
              )}

              <rect x="12" y="12" width={C.w - 24} height={C.h - 24} fill="none" stroke="#C9A87C" strokeWidth="3" rx="6" />

              <text x={C.w / 2} y={C.h / 2 + 36} textAnchor="middle" fill={HTW_GREEN} opacity="0.8"
                    fontSize="36" fontWeight="800" letterSpacing="6"
                    style={{ fontFamily: FONT, userSelect: "none", pointerEvents: "none" }}>HTW BERLIN</text>
              <text x={C.w / 2} y={C.h / 2 + 68} textAnchor="middle" fill={HTW_GREEN} opacity="0.6"
                    fontSize="16" fontWeight="600" letterSpacing="8"
                    style={{ fontFamily: FONT, userSelect: "none", pointerEvents: "none" }}>COURT · SPORTHALLE</text>

              <line x1={RIM.x - 45} y1="48" x2={RIM.x + 45} y2="48" stroke="#C9A87C" strokeWidth="4" />
              <circle cx={RIM.x} cy={RIM.y} r="10" fill="none" stroke="#FF9F0A" strokeWidth="3" />
              <rect x={RIM.x - 70} y="12" width="140" height="188" fill="none" stroke="#C9A87C" strokeWidth="3" />
              <circle cx={RIM.x} cy="200" r="60" fill="none" stroke="#C9A87C" strokeWidth="3" />
              <path d={`M ${RIM.x - 220} 12 L ${RIM.x - 220} 120 A 220 220 0 0 0 ${RIM.x + 220} 120 L ${RIM.x + 220} 12`}
                    fill="none" stroke="#C9A87C" strokeWidth="3" />
              <path d={`M ${RIM.x - 90} ${C.h - 12} A 90 90 0 0 1 ${RIM.x + 90} ${C.h - 12}`}
                    fill="none" stroke="#C9A87C" strokeWidth="3" />

              {annotations
                .filter((a) => viewTeam === "both"
                  || (viewTeam === "A" && (a.type === "run" || a.type === "pass" || a.type === "dribble"))
                  || (viewTeam === "B" && a.type === "screen"))
                .map((a) => <Arrow key={a.id} a={a} tool={tool} onErase={eraseAnn} />)}
              {drawing && <Arrow a={{ ...drawing, id: "preview" }} tool={tool} onErase={eraseAnn} />}

              {viewTeam !== "A" && teamB.map((p) => (
                <Player key={p.id} p={p} team="B" tool={tool} animating={animating} ballOwner={ballOwner}
                        ballFlying={ballFlying} showRoles={showRoles} onStartDrag={startDrag} />
              ))}
              {viewTeam !== "B" && teamA.map((p) => (
                <Player key={p.id} p={p} team="A" tool={tool} animating={animating} ballOwner={ballOwner}
                        ballFlying={ballFlying} showRoles={showRoles} onStartDrag={startDrag} />
              ))}

              {viewTeam !== "B" && (
                <g onMouseDown={(e) => startDrag(e, "ball", "ball")} onTouchStart={(e) => startDrag(e, "ball", "ball")}
                   style={{ cursor: tool === "move" && !animating ? "grab" : "default" }}>
                  <circle cx={displayBallPos.x} cy={displayBallPos.y} r="22" fill="transparent" />
                  <ellipse cx={displayBallPos.x} cy={displayBallPos.y + (ballFlying ? 16 : 4)} rx={ballFlying ? 6 : 8} ry="3"
                           fill="rgba(0,0,0,0.15)" />
                  <circle cx={displayBallPos.x} cy={displayBallPos.y} r={ballFlying ? 10 : 8.5} fill="#FF9F0A"
                          stroke="#C97B10" strokeWidth="2" />
                  <line x1={displayBallPos.x - 8} y1={displayBallPos.y} x2={displayBallPos.x + 8} y2={displayBallPos.y} stroke="#C97B10" strokeWidth="1.4" />
                  <line x1={displayBallPos.x} y1={displayBallPos.y - 8} x2={displayBallPos.x} y2={displayBallPos.y + 8} stroke="#C97B10" strokeWidth="1.4" />
                </g>
              )}
            </svg>
          </div>

          {/* play controls */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center",
                        marginTop: wide ? 0 : 16,
                        gridColumn: wide ? 2 : "auto", gridRow: wide ? 2 : "auto" }}>
            <select value={play} onChange={(e) => selectPlay(e.target.value)} disabled={animating || autoPlaying}
                    style={{ padding: "12px 14px", borderRadius: 12, background: "#FFFFFF", color: "#1D1D1F",
                             border: "none", boxShadow: "0 1px 3px rgba(0,0,0,0.08)", fontSize: 15,
                             minWidth: 200, minHeight: 44, fontFamily: FONT, fontWeight: 500 }}>
              {Object.keys(PLAYS).map((k) => <option key={k} value={k}>{k === "-" ? t("selectPlay") : k}</option>)}
            </select>

            {!autoPlaying ? (
              <button onClick={autoPlay} disabled={play === "-" || animating}
                      style={{ padding: "10px 20px", borderRadius: 20, border: "none",
                               background: play === "-" ? "#D2D2D7" : "#1D1D1F", color: "#FFF",
                               fontWeight: 700, fontSize: 14, fontFamily: FONT,
                               cursor: play === "-" || animating ? "default" : "pointer",
                               boxShadow: "0 2px 10px rgba(0,0,0,0.15)", transition: "all .25s" }}>{t("playBtn")}</button>
            ) : (
              <button onClick={stopAuto}
                      style={{ padding: "10px 20px", borderRadius: 20, border: "none",
                               background: "#FF453A", color: "#FFF", fontWeight: 700, fontSize: 14,
                               fontFamily: FONT, cursor: "pointer" }}>{t("stop")}</button>
            )}

            <button onClick={() => goToStep(stepIdx - 1)} disabled={play === "-" || animating || autoPlaying || stepIdx <= -1}
                    style={pill(false)}>◀</button>
            <button onClick={() => goToStep(stepIdx + 1)} disabled={play === "-" || animating || autoPlaying || stepIdx >= totalSteps - 1}
                    style={pill(false)}>▶</button>
            <button onClick={() => goToStep(-1)} disabled={play === "-" || animating || autoPlaying}
                    style={{ ...pill(false), color: "#86868B" }}>↺</button>
          </div>

          {/* note */}
          <div style={{ marginTop: wide ? 0 : 12, fontSize: 14.5, color: "#1D1D1F", background: "#FFFFFF",
                        borderRadius: 14, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        minHeight: 48, lineHeight: 1.55,
                        gridColumn: wide ? 2 : "auto", gridRow: wide ? 3 : "auto" }}>
            {noteText()}
          </div>

          {/* legend */}
          <div style={{ gridColumn: wide ? 2 : "auto", gridRow: wide ? 4 : "auto" }}>
            <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: wide ? 0 : 14, fontSize: 12.5, color: "#86868B", alignItems: "center" }}>
              <Legend color="#FF453A" label={t("offense")} />
              <Legend color="#0A84FF" label={t("defense")} />
              <Legend color="#FF9F0A" label={t("ball")} />
              <span>
                <b style={{ color: "#FF453A" }}>→</b> · <b style={{ color: "#0A84FF" }}>⇢</b> · <b style={{ color: "#FF9F0A" }}>∿</b> · <b style={{ color: "#6E6E73" }}>⊤</b> {t("legendArrows")}
              </span>
            </div>
            {showRoles && (
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8, fontSize: 12.5, color: "#86868B" }}>
                <RoleChip c={ROLE_COLOR.D} k="D" label={t("roleD")} />
                <RoleChip c={ROLE_COLOR["3"]} k="3" label={t("role3")} />
                <RoleChip c={ROLE_COLOR.M} k="M" label={t("roleM")} />
                <RoleChip c={ROLE_COLOR.P} k="P" label={t("roleP")} />
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 11, height: 11, borderRadius: "50%", background: color, display: "inline-block" }} />
      {label}
    </span>
  );
}

function RoleChip({ c, k, label }) {
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 16, height: 16, borderRadius: "50%", background: c, color: "#FFF",
                     fontSize: 9.5, fontWeight: 800, display: "inline-flex",
                     alignItems: "center", justifyContent: "center" }}>{k}</span>
      {label}
    </span>
  );
}
