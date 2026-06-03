import type { useTranslation } from "@/core/hooks/epub/useTranslation";
import type { StoryContext } from "@/core/services/api/storyContexts";

interface TranslateConfigPanelProps {
  config: ReturnType<typeof useTranslation>["config"];
  setConfig: ReturnType<typeof useTranslation>["setConfig"];
  isRunning: boolean;
  contextLibrary?: StoryContext[];
}

export function TranslateConfigPanel({
  config, setConfig, isRunning, contextLibrary,
}: TranslateConfigPanelProps) {
  return (
    <div className="bg-[#161925] rounded-xl p-4 flex flex-col gap-3">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Config</p>

      {contextLibrary?.length ? (
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Story Context (optional)</label>
          <select
            onChange={(e) => {
              const selected = contextLibrary.find((c) => c.id === e.target.value);
              setConfig((c) => ({
                ...c,
                storyContext: selected ? JSON.stringify(selected) : null,
              }));
            }}
            disabled={isRunning}
            className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-[#0E78F9] disabled:opacity-50"
          >
            <option value="">Không dùng ngữ cảnh</option>
            {contextLibrary.map((c) => (
              <option key={c.id} value={c.id}>{c.title} — {c.author}</option>
            ))}
          </select>
          {config.storyContext && (
            <p className="text-[10px] text-green-400 mt-1">Ngữ cảnh đã chọn — prepend vào mỗi prompt.</p>
          )}
        </div>
      ) : null}

      <div>
        <label className="text-xs text-gray-400 mb-1 block">Translation Prompt</label>
        <textarea
          value={config.basePrompt}
          onChange={(e) => setConfig((c) => ({ ...c, basePrompt: e.target.value }))}
          rows={6}
          disabled={isRunning}
          className="w-full bg-[#1C1F2E] border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-200 resize-y focus:outline-none focus:border-[#0E78F9] disabled:opacity-50 font-mono"
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
  );
}
