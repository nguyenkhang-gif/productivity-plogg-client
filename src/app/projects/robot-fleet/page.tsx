"use client";

import React, { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from "lucide-react";

const MermaidChart = dynamic(() => import("@/components/ui/MermaidChart"), { ssr: false });

// ─── Diagram strings ───────────────────────────────────────────────────────────

const SYSTEM_OVERVIEW = `graph TB
    subgraph ROBOTS["🤖 Robot Simulators"]
        R1[Robot A]
        R2[Robot B]
        R3[Robot C]
    end
    subgraph BACKEND["Backend — Clean Architecture"]
        BE_WS[uWS WebSocket]
        BE_HTTP[uWS HTTP]
        BE_STORE[(MongoDB)]
        BE_REDIS[(Redis PubSub)]
        BE_CLUSTER[Cluster Workers]
    end
    subgraph FRONTEND["Frontend — Next.js 15"]
        FE_WS[useWebSocket]
        FE_REST[apiClient]
        FE_STORE[Zustand Store]
        FE_UI[Dashboard UI]
    end
    R1 -->|WebSocket telemetry| BE_WS
    R2 -->|WebSocket telemetry| BE_WS
    R3 -->|WebSocket telemetry| BE_WS
    BE_WS --> BE_CLUSTER
    BE_CLUSTER -->|Redis pub/sub| BE_REDIS
    BE_CLUSTER -->|persist| BE_STORE
    BE_HTTP -->|read| BE_STORE
    BE_CLUSTER -->|WS batch 5s| FE_WS
    BE_HTTP -->|REST| FE_REST
    FE_WS --> FE_STORE
    FE_REST --> FE_STORE
    FE_STORE --> FE_UI`;

const FE_LAYERS = `graph TB
    subgraph INFRA["Infrastructure / Config"]
        NC[next.config.js]
        LY[app/layout.tsx]
    end
    subgraph TYPES["Type / Contract Layer"]
        TP[src/types/robot.ts]
    end
    subgraph DATA["Data Access Layer"]
        AC[apiClient.ts]
        NW[native WebSocket]
    end
    subgraph STATE["State Layer"]
        RS[robotStore.ts — Zustand]
    end
    subgraph HOOKS["Hook Layer"]
        UR[useRobots.ts]
        UW[useWebSocket.ts]
    end
    subgraph PRES["Presentation Layer"]
        PG[page.tsx]
        RC[RobotCard.tsx]
        AT[AlertToast.tsx]
        AH[AlertHistoryDrawer.tsx]
    end
    INFRA --> TYPES --> DATA --> STATE --> HOOKS --> PRES`;

const DATA_FLOW = `sequenceDiagram
    participant BE as Backend
    participant AC as apiClient
    participant WS as useWebSocket
    participant ST as Zustand Store
    participant UI as Dashboard UI
    Note over AC,ST: Initial load (REST)
    AC->>BE: GET /robots
    BE-->>AC: { data: Robot[] }
    AC->>ST: setRobots()
    ST->>UI: render RobotCard[]
    Note over WS,UI: Live updates (WebSocket)
    BE-->>WS: batch { type:'batch', data }
    WS->>ST: applyTelemetry()
    ST->>UI: update RobotCard
    BE-->>WS: alert { type:'alert' }
    WS->>ST: addLiveAlert()
    ST->>UI: show AlertToast`;

const BE_LAYERS = `graph TB
    subgraph INFRA["Infrastructure"]
        UWS[uWSAdapter / uWSRouter]
        BB[BroadcastBuffer — coalesce 5s]
        RPS[RedisPubSub — optional]
        CRN[rollupCronJobs]
        CLU[cluster.js]
    end
    subgraph ADAPTERS["Adapters"]
        WSC[WebSocketController]
        HTC[RobotHttpController]
        MTR[MongoTelemetryRepository]
        MRR[MongoRobotRepository]
        MAR[MongoAlertRepository]
    end
    subgraph APP["Application — Use Cases"]
        PT[ProcessTelemetryUseCase]
        PB[ProcessBatchTelemetryUseCase]
        RR[RegisterRobotUseCase]
        GR[GetRobotsUseCase]
        GA[GetAllAlertsUseCase]
    end
    subgraph DOMAIN["Domain — zero deps"]
        TE[Telemetry entity]
        AL[Alert entity]
        AS[AlertService]
        IT[ITelemetryRepository]
        IR[IRobotRepository]
        IA[IAlertRepository]
    end
    INFRA --> ADAPTERS --> APP --> DOMAIN`;

const TIERED_STORAGE = `graph LR
    RAW["TelemetryRaw\nMongoDB Time Series\nper-second ticks"]
    MIN["TelemetryMinutely\n1 doc / robot / min"]
    HR["TelemetryHourly\nrollup @ :05 mỗi giờ"]
    DAY["TelemetryDaily\nrollup @ 00:10 UTC"]
    RAW -->|cron 5 * * * *| MIN
    MIN -->|cron 5 0 * * *| HR
    HR --> DAY
    QUERY["queryHistory()\nchọn tier theo time delta"] -.->|"< 2h"| RAW
    QUERY -.->|2h–24h| MIN
    QUERY -.->|24h–7d| HR
    QUERY -.->|"> 7d"| DAY`;

const INGESTION_FLOW = `sequenceDiagram
    participant RB as Robot
    participant WC as WebSocketController
    participant UC as ProcessTelemetryUseCase
    participant DOM as Domain
    participant DB as MongoDB
    participant BRD as BroadcastBuffer
    RB->>WC: JSON telemetry over WS
    WC->>UC: execute(parsed)
    UC->>DOM: Telemetry.create(raw)
    DOM-->>UC: ok / error
    UC-->>DB: repository.save() — fire & forget
    UC-->>DB: robotRepository.updateSnapshot() — fire & forget
    UC->>DOM: alertService.evaluate()
    DOM-->>UC: Alert[]
    UC-->>DB: alertRepository.save() — fire & forget
    UC-->>WC: telemetry + alerts
    WC->>BRD: broadcastBuffer.push() → flush 5s`;

const CLUSTER_FANOUT = `graph TB
    subgraph CLUSTER["Cluster Mode"]
        M[Master Process]
        W1[Worker 1]
        W2[Worker 2]
        W3[Worker N]
    end
    REDIS[(Redis fleet:broadcast)]
    R1[Robot A] -->|WS| W1
    R2[Robot B] -->|WS| W2
    W1 -->|publish| REDIS
    REDIS -->|subscribe| W2
    REDIS -->|subscribe| W3
    M -.->|IPC fallback| W2
    M -.->|IPC fallback| W3
    W1 -.->|IPC relay| M`;

const FE_CONNECTIONS = `graph LR
    subgraph FE["Frontend"]
        FE1[useRobots.ts]
        FE2[AlertHistoryDrawer]
        FE3[useWebSocket.ts]
    end
    subgraph BE_HTTP["Backend HTTP"]
        H1["GET /robots"]
        H2["GET /alerts"]
        H3["PATCH /alerts/:id/seen"]
        H4["GET /robots/:id/history"]
    end
    subgraph BE_WS["Backend WebSocket"]
        W1["BroadcastBuffer → dashboard"]
        W2["per-robot topic"]
        W3["robot_status: offline"]
    end
    FE1 --> H1
    FE2 --> H2
    FE2 --> H3
    FE1 --> H4
    W1 -->|WS batch| FE3
    W2 -->|WS alert| FE3
    W3 -->|WS status| FE3`;

// ─── Score data ─────────────────────────────────────────────────────────────

const scores = [
  { dim: "Correctness", fe: 5, be: 6 },
  { dim: "Type Safety", fe: 5, be: 7 },
  { dim: "Separation of Concerns", fe: 6, be: 7 },
  { dim: "Performance", fe: 7, be: 7 },
  { dim: "Scalability", fe: 6, be: 7 },
  { dim: "Maintainability", fe: 6, be: 7 },
  { dim: "Testability", fe: 3, be: 6 },
  { dim: "Reliability", fe: 5, be: 8 },
  { dim: "Security", fe: 5, be: 6 },
];

// ─── Issue data ─────────────────────────────────────────────────────────────

type Severity = "p1" | "p2" | "p3";

interface Issue {
  id: string;
  severity: Severity;
  location: string;
  description: string;
}

const feIssues: Issue[] = [
  { id: "F-1", severity: "p1", location: "apiClient.ts:3", description: "URL hardcoded localhost:9001 — env var bị ignore" },
  { id: "F-2", severity: "p1", location: "tsconfig.json", description: "strict: false — null-check toàn bộ tắt" },
  { id: "F-3", severity: "p1", location: "useRobots.ts", description: "isLoading false-negative khi robots Map rỗng" },
  { id: "F-4", severity: "p2", location: "useWebSocket.ts", description: "double-reconnect bug" },
  { id: "F-5", severity: "p2", location: "AlertHistoryDrawer", description: "direct apiClient import — vi phạm layer boundary" },
  { id: "F-6", severity: "p2", location: "robotStore.ts", description: "alert dedup fail on remount" },
  { id: "F-7", severity: "p3", location: "layout.tsx", description: "AntdRegistry là stub — ~500KB dead bundle" },
];

const beIssues: Issue[] = [
  { id: "B-1", severity: "p1", location: "cluster.js", description: "per-robot topic relay dropped — cả IPC lẫn Redis path" },
  { id: "B-2", severity: "p1", location: "AlertService", description: "state không clear khi disconnect → memory leak" },
  { id: "B-3", severity: "p2", location: "RobotHttpController", description: "inject alertRepository trực tiếp — vi phạm Clean Architecture" },
  { id: "B-4", severity: "p2", location: "onConnect", description: "không broadcast robot_status:online → hiển thị delay 5s" },
  { id: "B-5", severity: "p2", location: "ensureCollections", description: "dropCollection không reversible → mất data khi deploy" },
  { id: "B-6", severity: "p3", location: "ProcessBatchTelemetryUseCase", description: "O(N) sequential upsert — 100 robots = 200 DB round trips" },
  { id: "B-7", severity: "p3", location: "AlertService", description: "in-memory → split-brain trong cluster mode" },
];

// ─── Sub-components ─────────────────────────────────────────────────────────

function SeverityBadge({ s }: { s: Severity }) {
  const map: Record<Severity, { label: string; cls: string }> = {
    p1: { label: "P1", cls: "bg-red-500/20 text-red-400 border border-red-500/30" },
    p2: { label: "P2", cls: "bg-amber-500/20 text-amber-400 border border-amber-500/30" },
    p3: { label: "P3", cls: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  };
  const { label, cls } = map[s];
  return <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${cls}`}>{label}</span>;
}

function SeverityIcon({ s }: { s: Severity }) {
  if (s === "p1") return <AlertCircle size={14} className="text-red-400 shrink-0 mt-0.5" />;
  if (s === "p2") return <AlertTriangle size={14} className="text-amber-400 shrink-0 mt-0.5" />;
  return <Info size={14} className="text-yellow-400 shrink-0 mt-0.5" />;
}

function IssueTable({ issues }: { issues: Issue[] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-700">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
            <th className="px-4 py-2 text-left w-14">ID</th>
            <th className="px-4 py-2 text-left w-20">Severity</th>
            <th className="px-4 py-2 text-left">Location</th>
            <th className="px-4 py-2 text-left">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800">
          {issues.map((issue) => (
            <tr key={issue.id} className="bg-slate-900/60 hover:bg-slate-800/60 transition-colors">
              <td className="px-4 py-2.5 font-mono text-slate-300">{issue.id}</td>
              <td className="px-4 py-2.5"><SeverityBadge s={issue.severity} /></td>
              <td className="px-4 py-2.5 font-mono text-blue-300 text-xs">{issue.location}</td>
              <td className="px-4 py-2.5 text-slate-400 flex items-start gap-2">
                <SeverityIcon s={issue.severity} />
                {issue.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreBar({ value, max = 10, color }: { value: number; max?: number; color: string }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-mono text-slate-300 w-8 text-right">{value}/{max}</span>
    </div>
  );
}

interface CollapsibleSectionProps {
  title: string;
  badge?: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, badge, children, defaultOpen = true }: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden">
      <button
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="flex items-center gap-3">
          <h2 className="text-base font-bold text-slate-100">{title}</h2>
          {badge && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/20 font-mono">
              {badge}
            </span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>
      {open && <div className="px-6 pb-6 space-y-4">{children}</div>}
    </section>
  );
}

function DiagramCard({ title, chart, note }: { title: string; chart: string; note?: string }) {
  return (
    <div className="bg-slate-950/60 rounded-xl border border-slate-800 overflow-hidden">
      <div className="px-4 py-2 border-b border-slate-800 bg-slate-800/40">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</span>
      </div>
      <div className="p-4">
        <MermaidChart chart={chart} />
        {note && <p className="mt-3 text-xs text-slate-500 italic">{note}</p>}
      </div>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────────

export default function RobotFleetPage() {
  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div>
        <Link href="/projects" className="flex items-center gap-1 text-sm text-blue-400 hover:underline mb-6">
          <ArrowLeft size={14} /> Back to Projects
        </Link>
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">Robot Fleet Dashboard</h1>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Architecture Audit
          </span>
        </div>
        <p className="text-slate-400 text-base">
          Full-stack real-time robot telemetry dashboard. Frontend: Next.js 15 · Backend: Node.js + uWebSockets.js + MongoDB + Redis.
          Audit ngày 2026-05-23.
        </p>
      </div>

      {/* Score summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Frontend Score</p>
          <p className="text-4xl font-bold text-amber-400">54<span className="text-xl text-slate-500">/90</span></p>
          <p className="text-xs text-slate-500 mt-1">60% — Needs Work</p>
        </div>
        <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800">
          <p className="text-xs uppercase tracking-wider text-slate-500 mb-1">Backend Score</p>
          <p className="text-4xl font-bold text-green-400">75<span className="text-xl text-slate-500">/100</span></p>
          <p className="text-xs text-slate-500 mt-1">75% — Good</p>
        </div>
      </div>

      {/* 1. System Overview */}
      <CollapsibleSection title="1. Tổng quan hệ thống">
        <DiagramCard title="System Overview" chart={SYSTEM_OVERVIEW} />
      </CollapsibleSection>

      {/* 2. Frontend Architecture */}
      <CollapsibleSection title="2. Frontend Architecture" badge="54/90">
        <DiagramCard title="Layer Stack" chart={FE_LAYERS} />
        <DiagramCard
          title="Luồng dữ liệu — REST + WebSocket"
          chart={DATA_FLOW}
        />
      </CollapsibleSection>

      {/* 3. Backend Architecture */}
      <CollapsibleSection title="3. Backend Architecture" badge="75/100">
        <DiagramCard title="Clean Architecture (Onion)" chart={BE_LAYERS} />
        <DiagramCard
          title="Tiered Storage — MongoDB Time Series"
          chart={TIERED_STORAGE}
          note="queryHistory() tự chọn tier theo time delta: < 2h → Raw, 2h–24h → Minutely, 24h–7d → Hourly, > 7d → Daily"
        />
        <DiagramCard title="Telemetry Ingestion Flow" chart={INGESTION_FLOW} />
        <DiagramCard
          title="Cluster Fan-Out (Redis + IPC)"
          chart={CLUSTER_FANOUT}
          note="⚠️ Per-robot topic bị drop trong cả 2 path (IPC + Redis) — detail page không reliable trong cluster mode"
        />
      </CollapsibleSection>

      {/* 4. FE ↔ BE Connections */}
      <CollapsibleSection title="4. Frontend ↔ Backend Connections">
        <DiagramCard title="API & WebSocket Map" chart={FE_CONNECTIONS} />
      </CollapsibleSection>

      {/* 5. Score Breakdown */}
      <CollapsibleSection title="5. Score Breakdown — So sánh">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 mb-4">Frontend</h3>
            {scores.map((s) => (
              <div key={s.dim}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{s.dim}</span>
                </div>
                <ScoreBar value={s.fe} color="bg-blue-500" />
              </div>
            ))}
            <div className="pt-3 border-t border-slate-700 flex justify-between text-sm font-bold">
              <span className="text-slate-300">Total</span>
              <span className="text-amber-400">54/90 (60%)</span>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-green-400 mb-4">Backend</h3>
            {scores.map((s) => (
              <div key={s.dim}>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>{s.dim}</span>
                </div>
                <ScoreBar value={s.be} color="bg-green-500" />
              </div>
            ))}
            <div className="pt-3 border-t border-slate-700 flex justify-between text-sm font-bold">
              <span className="text-slate-300">Total</span>
              <span className="text-green-400">75/100 (75%)</span>
            </div>
          </div>
        </div>

        {/* Comparison table */}
        <div className="mt-4 overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-800/80 text-slate-400 text-xs uppercase tracking-wider">
                <th className="px-4 py-2 text-left">Dimension</th>
                <th className="px-4 py-2 text-center">Frontend</th>
                <th className="px-4 py-2 text-center">Backend</th>
                <th className="px-4 py-2 text-center">Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {scores.map((s) => {
                const delta = s.be - s.fe;
                return (
                  <tr key={s.dim} className="bg-slate-900/60 hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2.5 text-slate-300">{s.dim}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-blue-300">{s.fe}/10</td>
                    <td className="px-4 py-2.5 text-center font-mono text-green-300">{s.be}/10</td>
                    <td className={`px-4 py-2.5 text-center font-mono font-bold ${delta > 0 ? "text-green-400" : delta < 0 ? "text-red-400" : "text-slate-500"}`}>
                      {delta > 0 ? `+${delta}` : delta}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CollapsibleSection>

      {/* 6. Issues */}
      <CollapsibleSection title="6. Issues — Frontend">
        <div className="flex gap-4 mb-4 text-xs">
          <span className="flex items-center gap-1.5"><AlertCircle size={12} className="text-red-400" /> P1 Production Blocker</span>
          <span className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-400" /> P2 High Quality</span>
          <span className="flex items-center gap-1.5"><Info size={12} className="text-yellow-400" /> P3 Maintainability</span>
        </div>
        <IssueTable issues={feIssues} />
      </CollapsibleSection>

      <CollapsibleSection title="7. Issues — Backend">
        <div className="flex gap-4 mb-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><AlertCircle size={12} className="text-red-400" /> P1 Production Blocker</span>
          <span className="flex items-center gap-1.5"><AlertTriangle size={12} className="text-amber-400" /> P2 Architecture</span>
          <span className="flex items-center gap-1.5"><Info size={12} className="text-yellow-400" /> P3 Performance</span>
        </div>
        <IssueTable issues={beIssues} />
      </CollapsibleSection>

      {/* 8. Fix Priority */}
      <CollapsibleSection title="8. Ưu tiên Fix — Roadmap">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* P1 */}
          <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle size={16} className="text-red-400" />
              <h3 className="text-sm font-bold text-red-400">P1 — Fix ngay</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex gap-2"><span className="text-blue-400 font-mono shrink-0">[FE]</span> Fix URL hardcode trong apiClient.ts</li>
              <li className="flex gap-2"><span className="text-blue-400 font-mono shrink-0">[FE]</span> Bật TypeScript strict:true</li>
              <li className="flex gap-2"><span className="text-green-400 font-mono shrink-0">[BE]</span> Fix per-robot topic relay trong cluster</li>
              <li className="flex gap-2"><span className="text-green-400 font-mono shrink-0">[BE]</span> AlertService.resetState() khi disconnect</li>
            </ul>
          </div>
          {/* P2 */}
          <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={16} className="text-amber-400" />
              <h3 className="text-sm font-bold text-amber-400">P2 — High Quality</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex gap-2"><span className="text-blue-400 font-mono shrink-0">[FE]</span> Extract useAlertHistory hook</li>
              <li className="flex gap-2"><span className="text-blue-400 font-mono shrink-0">[FE]</span> Fix double-reconnect bug</li>
              <li className="flex gap-2"><span className="text-blue-400 font-mono shrink-0">[FE]</span> Fix isLoading false-negative</li>
              <li className="flex gap-2"><span className="text-green-400 font-mono shrink-0">[BE]</span> Tạo Alert Use Cases riêng</li>
              <li className="flex gap-2"><span className="text-green-400 font-mono shrink-0">[BE]</span> Broadcast robot_status:online onConnect</li>
            </ul>
          </div>
          {/* P3 */}
          <div className="bg-yellow-950/20 border border-yellow-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-yellow-400" />
              <h3 className="text-sm font-bold text-yellow-400">P3 — Maintainability</h3>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex gap-2"><span className="text-blue-400 font-mono shrink-0">[FE]</span> Remove dead deps (recharts, dayjs…)</li>
              <li className="flex gap-2"><span className="text-green-400 font-mono shrink-0">[BE]</span> Tối ưu batch upsert → bulkWrite</li>
              <li className="flex gap-2"><span className="text-slate-400 font-mono shrink-0">[ALL]</span> Thêm test infrastructure</li>
            </ul>
          </div>
        </div>

        <div className="mt-4 text-xs text-slate-500 text-right">
          Audit: 2026-05-23 · Updated: 2026-05-24
        </div>
      </CollapsibleSection>
    </div>
  );
}
