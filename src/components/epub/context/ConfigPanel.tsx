import type { useRollingContext } from "@/core/hooks/epub/useRollingContext";

interface ConfigPanelProps {
  config: ReturnType<typeof useRollingContext>["config"];
  setConfig: ReturnType<typeof useRollingContext>["setConfig"];
  isRunning: boolean;
}

export function ConfigPanel({ config, setConfig, isRunning }: ConfigPanelProps) {
  return (
    <div className="bg-[#161925] rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Config</p>
      <div>
        <label className="text-xs text-gray-400 mb-1 block">Base Prompt</label>
        <textarea
          value={config.basePrompt}
          onChange={(e) => setConfig((c) => ({ ...c, basePrompt: e.target.value }))}
          rows={7}
          disabled={isRunning}
          className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 resize-y focus:outline-none focus:border-[#0E78F9] disabled:opacity-50 font-mono"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Word Threshold</label>
          <input
            type="number"
            value={config.threshold}
            onChange={(e) => setConfig((c) => ({ ...c, threshold: Number(e.target.value) }))}
            disabled={isRunning}
            className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#0E78F9] disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">API Key (optional)</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => setConfig((c) => ({ ...c, apiKey: e.target.value }))}
            placeholder="Server key nếu để trống"
            disabled={isRunning}
            className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#0E78F9] disabled:opacity-50"
          />
        </div>
      </div>
    </div>
  );
}
