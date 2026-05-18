"use client";

import { useState } from "react";

const SECTIONS = [
  {
    title: "Variants",
    items: [
      {
        label: "Primary",
        preview: <button className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors active:scale-95">Primary</button>,
        code: `.btn-primary {
  padding: 8px 20px;
  border-radius: 12px;
  background: #2563eb;
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-primary:hover { background: #3b82f6; }
.btn-primary:active { transform: scale(0.95); }`,
      },
      {
        label: "Secondary",
        preview: <button className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200 text-sm font-medium transition-colors active:scale-95">Secondary</button>,
        code: `.btn-secondary {
  padding: 8px 20px;
  border-radius: 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #cbd5e1;
  transition: background 0.2s;
}
.btn-secondary:hover { background: rgba(255,255,255,0.1); }`,
      },
      {
        label: "Outline",
        preview: <button className="px-5 py-2 rounded-xl border border-blue-500/50 hover:bg-blue-500/10 text-blue-400 text-sm font-medium transition-colors active:scale-95">Outline</button>,
        code: `.btn-outline {
  padding: 8px 20px;
  border-radius: 12px;
  background: transparent;
  border: 1px solid rgba(59,130,246,0.5);
  color: #60a5fa;
  transition: background 0.2s;
}
.btn-outline:hover { background: rgba(59,130,246,0.1); }`,
      },
      {
        label: "Ghost",
        preview: <button className="px-5 py-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-slate-200 text-sm font-medium transition-colors active:scale-95">Ghost</button>,
        code: `.btn-ghost {
  padding: 8px 20px;
  border-radius: 12px;
  background: transparent;
  border: none;
  color: #94a3b8;
  transition: background 0.2s, color 0.2s;
}
.btn-ghost:hover { background: rgba(255,255,255,0.05); color: #e2e8f0; }`,
      },
      {
        label: "Danger",
        preview: <button className="px-5 py-2 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors active:scale-95">Danger</button>,
        code: `.btn-danger {
  background: rgba(239,68,68,0.15);
  border: 1px solid rgba(239,68,68,0.3);
  color: #f87171;
}
.btn-danger:hover { background: rgba(239,68,68,0.25); }`,
      },
      {
        label: "Success",
        preview: <button className="px-5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-400 text-sm font-medium transition-colors active:scale-95">Success</button>,
        code: `.btn-success {
  background: rgba(16,185,129,0.15);
  border: 1px solid rgba(16,185,129,0.3);
  color: #34d399;
}
.btn-success:hover { background: rgba(16,185,129,0.25); }`,
      },
      {
        label: "Warning",
        preview: <button className="px-5 py-2 rounded-xl bg-amber-500/20 border border-amber-500/30 hover:bg-amber-500/30 text-amber-400 text-sm font-medium transition-colors active:scale-95">Warning</button>,
        code: `.btn-warning {
  background: rgba(245,158,11,0.15);
  border: 1px solid rgba(245,158,11,0.3);
  color: #fbbf24;
}
.btn-warning:hover { background: rgba(245,158,11,0.25); }`,
      },
    ],
  },
  {
    title: "Gradient",
    items: [
      {
        label: "Blue → Indigo",
        preview: <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-900/40">Blue → Indigo</button>,
        code: `.btn-grad-blue {
  background: linear-gradient(to right, #2563eb, #4f46e5);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 14px rgba(79,70,229,0.3);
  transition: transform 0.15s;
}
.btn-grad-blue:hover {
  background: linear-gradient(to right, #3b82f6, #6366f1);
  transform: scale(1.05);
}`,
      },
      {
        label: "Purple → Pink",
        preview: <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-900/40">Purple → Pink</button>,
        code: `.btn-grad-purple {
  background: linear-gradient(to right, #7c3aed, #db2777);
  color: #fff;
  box-shadow: 0 4px 14px rgba(219,39,119,0.3);
}`,
      },
      {
        label: "Emerald → Teal",
        preview: <button className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-900/40">Emerald → Teal</button>,
        code: `.btn-grad-green {
  background: linear-gradient(to right, #059669, #0d9488);
  color: #fff;
  box-shadow: 0 4px 14px rgba(13,148,136,0.3);
}`,
      },
      {
        label: "Rainbow ✨",
        preview: (
          <>
            <style>{`@keyframes grad-shift{to{background-position:200% center}}.btn-rainbow{background:linear-gradient(90deg,#2563eb,#7c3aed,#db2777,#2563eb);background-size:200% auto;animation:grad-shift 3s linear infinite}`}</style>
            <button className="btn-rainbow px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95 border border-white/20">Rainbow ✨</button>
          </>
        ),
        code: `@keyframes grad-shift {
  to { background-position: 200% center; }
}
.btn-rainbow {
  background: linear-gradient(
    90deg, #2563eb, #7c3aed, #db2777, #2563eb
  );
  background-size: 200% auto;
  color: #fff;
  animation: grad-shift 3s linear infinite;
}`,
      },
    ],
  },
  {
    title: "Glow on hover",
    items: [
      {
        label: "Blue Glow",
        preview: <button className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95" onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 0 22px 5px rgba(59,130,246,.55)")} onMouseLeave={e=>(e.currentTarget.style.boxShadow="none")}>Blue Glow</button>,
        code: `.btn-glow-blue { background: #2563eb; color: #fff; }
.btn-glow-blue:hover {
  box-shadow: 0 0 22px 5px rgba(59,130,246,0.55);
  transform: scale(1.05);
}`,
      },
      {
        label: "Purple Glow",
        preview: <button className="px-5 py-2.5 rounded-xl bg-purple-600 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95" onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 0 22px 5px rgba(168,85,247,.55)")} onMouseLeave={e=>(e.currentTarget.style.boxShadow="none")}>Purple Glow</button>,
        code: `.btn-glow-purple { background: #7c3aed; color: #fff; }
.btn-glow-purple:hover {
  box-shadow: 0 0 22px 5px rgba(168,85,247,0.55);
  transform: scale(1.05);
}`,
      },
      {
        label: "Green Glow",
        preview: <button className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95" onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 0 22px 5px rgba(16,185,129,.55)")} onMouseLeave={e=>(e.currentTarget.style.boxShadow="none")}>Green Glow</button>,
        code: `.btn-glow-green { background: #059669; color: #fff; }
.btn-glow-green:hover {
  box-shadow: 0 0 22px 5px rgba(16,185,129,0.55);
  transform: scale(1.05);
}`,
      },
      {
        label: "Red Glow",
        preview: <button className="px-5 py-2.5 rounded-xl bg-rose-600 text-white text-sm font-semibold transition-all hover:scale-105 active:scale-95" onMouseEnter={e=>(e.currentTarget.style.boxShadow="0 0 22px 5px rgba(244,63,94,.55)")} onMouseLeave={e=>(e.currentTarget.style.boxShadow="none")}>Red Glow</button>,
        code: `.btn-glow-red { background: #e11d48; color: #fff; }
.btn-glow-red:hover {
  box-shadow: 0 0 22px 5px rgba(244,63,94,0.55);
  transform: scale(1.05);
}`,
      },
    ],
  },
  {
    title: "Animations",
    items: [
      {
        label: "Pulse",
        preview: (
          <>
            <style>{`@keyframes btn-pulse{0%,100%{opacity:1}50%{opacity:.55}}.btn-pulse{animation:btn-pulse 2s ease-in-out infinite}.btn-pulse:hover{animation:none}`}</style>
            <button className="btn-pulse px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium">Pulse</button>
          </>
        ),
        code: `@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.55; }
}
.btn-pulse {
  animation: pulse 2s ease-in-out infinite;
}
.btn-pulse:hover { animation: none; }`,
      },
      {
        label: "Bounce on hover",
        preview: (
          <>
            <style>{`@keyframes btn-bounce{0%,100%{transform:translateY(0)}35%{transform:translateY(-7px)}70%{transform:translateY(-2px)}}.btn-bounce:hover{animation:btn-bounce .45s ease}`}</style>
            <button className="btn-bounce px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors">Bounce on hover</button>
          </>
        ),
        code: `@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  35%      { transform: translateY(-7px); }
  70%      { transform: translateY(-2px); }
}
.btn-bounce:hover {
  animation: bounce 0.45s ease;
}`,
      },
      {
        label: "Fill up ↑",
        preview: (
          <>
            <style>{`.btn-fill{position:relative;overflow:hidden;border:1px solid #3b82f6;color:#60a5fa;background:transparent;padding:9px 20px;border-radius:12px;font-size:14px;cursor:pointer;transition:color .2s}.btn-fill::before{content:'';position:absolute;inset:0;background:#2563eb;transform:translateY(100%);transition:transform .22s ease;z-index:0}.btn-fill:hover::before{transform:translateY(0)}.btn-fill:hover{color:#fff}.btn-fill span{position:relative;z-index:1}`}</style>
            <button className="btn-fill"><span>Fill up ↑</span></button>
          </>
        ),
        code: `.btn-fill {
  position: relative;
  overflow: hidden;
  border: 1px solid #3b82f6;
  color: #60a5fa;
  background: transparent;
}
.btn-fill::before {
  content: '';
  position: absolute;
  inset: 0;
  background: #2563eb;
  transform: translateY(100%);
  transition: transform 0.22s ease;
  z-index: 0;
}
.btn-fill:hover::before { transform: translateY(0); }
.btn-fill:hover { color: #fff; }
.btn-fill span { position: relative; z-index: 1; }`,
      },
      {
        label: "Slide in →",
        preview: (
          <>
            <style>{`.btn-slide{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.15);color:#cbd5e1;background:transparent;padding:9px 20px;border-radius:12px;font-size:14px;cursor:pointer}.btn-slide::before{content:'';position:absolute;inset:0;background:rgba(255,255,255,.08);transform:translateX(-100%);transition:transform .28s ease;z-index:0}.btn-slide:hover::before{transform:translateX(0)}.btn-slide span{position:relative;z-index:1}`}</style>
            <button className="btn-slide"><span>Slide in →</span></button>
          </>
        ),
        code: `.btn-slide {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(255,255,255,0.15);
  color: #cbd5e1;
  background: transparent;
}
.btn-slide::before {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0.08);
  transform: translateX(-100%);
  transition: transform 0.28s ease;
  z-index: 0;
}
.btn-slide:hover::before { transform: translateX(0); }
.btn-slide span { position: relative; z-index: 1; }`,
      },
    ],
  },
];

/* ── Stateful components ── */
function ToggleBtn({ labelOn, labelOff, colorOn }: { labelOn: string; labelOff: string; colorOn: string }) {
  const [on, setOn] = useState(false);
  return (
    <button
      onClick={() => setOn((o) => !o)}
      className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${
        on ? colorOn : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
      }`}
    >
      {on ? labelOn : labelOff}
    </button>
  );
}

function LoadBtn() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const click = () => {
    if (state !== "idle") return;
    setState("loading");
    setTimeout(() => setState("done"), 1800);
    setTimeout(() => setState("idle"), 3800);
  };
  return (
    <button
      onClick={click}
      disabled={state === "loading"}
      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-70 ${
        state === "done"
          ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
          : "bg-blue-600 hover:bg-blue-500 text-white"
      }`}
    >
      {state === "loading" && (
        <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      )}
      {state === "loading" ? "Đang gửi…" : state === "done" ? "✓ Đã gửi!" : "Gửi đi"}
    </button>
  );
}

function CopyBtn() {
  const [done, setDone] = useState(false);
  return (
    <button
      onClick={() => { setDone(true); setTimeout(() => setDone(false), 2000); }}
      className={`flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-medium border transition-all ${
        done
          ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
          : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"
      }`}
    >
      {done ? "✓ Copied!" : "📋 Copy code"}
    </button>
  );
}

function Counter() {
  const [n, setN] = useState(0);
  return (
    <div className="inline-flex">
      <button onClick={() => setN((c) => Math.max(0, c - 1))} className="px-3 py-2 rounded-l-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors text-sm font-bold">−</button>
      <span className="px-4 py-2 bg-white/5 border-y border-white/10 text-slate-200 text-sm font-mono min-w-[3rem] text-center">{n}</span>
      <button onClick={() => setN((c) => c + 1)} className="px-3 py-2 rounded-r-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors text-sm font-bold">+</button>
    </div>
  );
}

function RippleBtn({ children, className }: { children: React.ReactNode; className: string }) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);
  const add = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const id = Date.now();
    setRipples((p) => [...p, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setRipples((p) => p.filter((rp) => rp.id !== id)), 600);
  };
  return (
    <>
      <style>{`@keyframes ripple-anim{to{transform:scale(4);opacity:0}}.ripple-dot{position:absolute;border-radius:50%;background:rgba(255,255,255,.32);width:100px;height:100px;pointer-events:none;transform:scale(0);animation:ripple-anim .55s linear forwards}`}</style>
      <button onClick={add} className={`relative overflow-hidden ${className}`}>
        {ripples.map((rp) => (
          <span key={rp.id} className="ripple-dot" style={{ left: rp.x - 50, top: rp.y - 50 }} />
        ))}
        {children}
      </button>
    </>
  );
}

/* ── Reusable extra Card for stateful sections ── */
function StatefulCard({ label, code, children }: { label: string; code: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#161b22] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-center min-h-[90px] px-6 py-6">{children}</div>
      <div className="border-t border-white/[0.06]">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-slate-500 hover:text-slate-400 text-xs hover:bg-white/[0.02] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            {label}
          </span>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="transition-transform duration-200" style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: open ? 500 : 0 }}>
          <div className="border-t border-white/[0.06] bg-[#0d1117] px-4 py-3 overflow-x-auto">
            <pre className="text-[11.5px] leading-relaxed text-slate-400 font-mono whitespace-pre">{code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, preview, code }: { label: string; preview: React.ReactNode; code: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-[#161b22] border border-white/[0.08] rounded-2xl overflow-hidden">
      <div className="flex items-center justify-center min-h-[90px] px-6 py-6">
        {preview}
      </div>
      <div className="border-t border-white/[0.06]">
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-2.5 text-slate-500 hover:text-slate-400 text-xs hover:bg-white/[0.02] transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
            </svg>
            {label}
          </span>
          <svg
            width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className="transition-transform duration-200"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          >
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        <div
          className="overflow-hidden transition-all duration-300"
          style={{ maxHeight: open ? 500 : 0 }}
        >
          <div className="border-t border-white/[0.06] bg-[#0d1117] px-4 py-3 overflow-x-auto">
            <pre className="text-[11.5px] leading-relaxed text-slate-400 font-mono whitespace-pre">{code}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ButtonsPage() {
  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-200 px-6 py-14">
      <div className="max-w-4xl mx-auto space-y-14">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1.5">🧩 Button Showcase</h1>
          <p className="text-slate-500 text-sm">Các kiểu button và hiệu ứng. Click tên để xem code CSS.</p>
        </div>

        {SECTIONS.map((section) => (
          <section key={section.title}>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">{section.title}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {section.items.map((item) => (
                <Card key={item.label} {...item} />
              ))}
            </div>
          </section>
        ))}

        {/* ── Sizes ── */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Sizes</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[
              { label: "XSmall", cls: "px-2.5 py-1 text-[11px] rounded-lg", code: `.xs { padding: 4px 10px; border-radius: 8px; font-size: 11px; }` },
              { label: "Small",  cls: "px-3.5 py-1.5 text-xs rounded-xl",   code: `.sm { padding: 6px 14px; border-radius: 10px; font-size: 13px; }` },
              { label: "Medium", cls: "px-5 py-2 text-sm rounded-xl",       code: `.md { padding: 8px 20px; border-radius: 12px; font-size: 14px; }` },
              { label: "Large",  cls: "px-6 py-2.5 text-base rounded-xl",   code: `.lg { padding: 10px 24px; border-radius: 14px; font-size: 16px; }` },
              { label: "XLarge", cls: "px-8 py-3 text-lg rounded-2xl font-semibold", code: `.xl { padding: 12px 32px; border-radius: 16px; font-size: 18px; font-weight: 600; }` },
            ].map(({ label, cls, code }) => (
              <Card key={label} label={label} code={code}
                preview={<button className={`bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors active:scale-95 ${cls}`}>{label}</button>}
              />
            ))}
          </div>
        </section>

        {/* ── Toggle ── */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Toggle</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <StatefulCard label="Sound toggle" code={`/* Toggle state via JS class swap */
.toggle-off {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #94a3b8;
}
.toggle-on {
  background: rgba(59,130,246,0.2);
  border: 1px solid rgba(59,130,246,0.4);
  color: #60a5fa;
  transform: scale(1.05);
}`}>
              <ToggleBtn labelOn="🔊 Sound On" labelOff="🔇 Sound Off" colorOn="bg-blue-500/20 border border-blue-500/40 text-blue-400 scale-105" />
            </StatefulCard>

            <StatefulCard label="Dark mode toggle" code={`.toggle-dark {
  background: rgba(245,158,11,0.15);
  border: 1px solid rgba(245,158,11,0.3);
  color: #fbbf24;
  transform: scale(1.05);
}`}>
              <ToggleBtn labelOn="☀️ Light" labelOff="🌙 Dark" colorOn="bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 scale-105" />
            </StatefulCard>

            <StatefulCard label="Lock toggle" code={`.toggle-lock {
  background: rgba(16,185,129,0.15);
  border: 1px solid rgba(16,185,129,0.3);
  color: #34d399;
  transform: scale(1.05);
}`}>
              <ToggleBtn labelOn="🔓 Unlocked" labelOff="🔒 Locked" colorOn="bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 scale-105" />
            </StatefulCard>

            <StatefulCard label="Play/Pause toggle" code={`.toggle-play {
  background: rgba(168,85,247,0.15);
  border: 1px solid rgba(168,85,247,0.3);
  color: #c084fc;
  transform: scale(1.05);
}`}>
              <ToggleBtn labelOn="⏸ Playing" labelOff="▶ Paused" colorOn="bg-purple-500/20 border border-purple-500/40 text-purple-400 scale-105" />
            </StatefulCard>
          </div>
        </section>

        {/* ── Stateful ── */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Stateful</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <StatefulCard label="Loading button" code={`/* Spinner CSS */
.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.65s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
/* On success swap to .btn-success style */`}>
              <LoadBtn />
            </StatefulCard>

            <StatefulCard label="Copy button" code={`/* idle → success style after click */
.btn-copy-done {
  background: rgba(16,185,129,0.15);
  border: 1px solid rgba(16,185,129,0.3);
  color: #34d399;
}
/* Revert after 2000ms via setTimeout */`}>
              <CopyBtn />
            </StatefulCard>

            <StatefulCard label="Counter" code={`.counter { display: inline-flex; }
.counter-btn {
  padding: 8px 12px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  color: #cbd5e1;
  cursor: pointer;
}
.counter-btn-l { border-radius: 10px 0 0 10px; }
.counter-btn-r { border-radius: 0 10px 10px 0; }
.counter-val {
  padding: 8px 16px;
  border-top: 1px solid rgba(255,255,255,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.1);
  font-family: monospace;
  min-width: 48px; text-align: center;
}`}>
              <Counter />
            </StatefulCard>
          </div>
        </section>

        {/* ── Ripple ── */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Ripple effect</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[
              { label: "Blue ripple",   cls: "px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors",   text: "Click me 💧" },
              { label: "Purple ripple", cls: "px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors", text: "Ripple 🌊" },
              { label: "Ghost ripple",  cls: "px-5 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 text-sm font-medium transition-colors", text: "Ghost ripple" },
            ].map(({ label, cls, text }) => (
              <StatefulCard key={label} label={label} code={`/* Spawn a span at cursor position on click */
.ripple-dot {
  position: absolute;
  border-radius: 50%;
  background: rgba(255,255,255,0.32);
  width: 100px; height: 100px;
  pointer-events: none;
  transform: scale(0);
  animation: ripple 0.55s linear forwards;
}
@keyframes ripple {
  to { transform: scale(4); opacity: 0; }
}`}>
                <RippleBtn className={cls}>{text}</RippleBtn>
              </StatefulCard>
            ))}
          </div>
        </section>

        {/* ── Disabled ── */}
        <section>
          <p className="text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-4">Disabled</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            <Card label="Disabled primary" code={`.btn:disabled {
  opacity: 0.38;
  cursor: not-allowed;
  pointer-events: none;
}`}
              preview={<button disabled className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-medium opacity-40 cursor-not-allowed">Disabled</button>}
            />
            <Card label="Disabled secondary" code={`.btn-secondary:disabled {
  opacity: 0.38;
  cursor: not-allowed;
}`}
              preview={<button disabled className="px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm font-medium opacity-40 cursor-not-allowed">Disabled</button>}
            />
            <StatefulCard label="Loading disabled" code={`/* Disabled + spinner state */
button[disabled] {
  opacity: 0.7;
  cursor: not-allowed;
  pointer-events: none;
}`}>
              <button disabled className="flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600/60 text-white/70 text-sm font-medium cursor-not-allowed">
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Loading...
              </button>
            </StatefulCard>
          </div>
        </section>

      </div>
    </div>
  );
}
