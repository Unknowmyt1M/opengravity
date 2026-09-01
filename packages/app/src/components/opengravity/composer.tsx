import { Component, createMemo, createSignal, For, Show } from "solid-js"
import { useModels } from "@/context/models"
import { usePlatform } from "@/context/platform"
import { useServerSync } from "@/context/server-sync"

export const OpenGravityComposer: Component<{
  onSend: (text: string) => void
  onStop?: () => void
  isStreaming?: boolean
}> = (props) => {
  const models = useModels()
  const platform = usePlatform()
  const sync = useServerSync()

  const [inputVal, setInputVal] = createSignal("")
  const [selectedModel, setSelectedModel] = createSignal("Gemini 3.5 Flash Low")
  const [modelDropdownOpen, setModelDropdownOpen] = createSignal(false)
  const [attachments, setAttachments] = createSignal<Array<{ name: string; path: string }>>([])
  let textareaRef: HTMLTextAreaElement | undefined

  // Auto-resize textarea
  const adjustHeight = () => {
    if (!textareaRef) return
    textareaRef.style.height = "auto"
    textareaRef.style.height = `${Math.min(textareaRef.scrollHeight, 180)}px`
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleSubmit = () => {
    const text = inputVal().trim()
    if (!text || props.isStreaming) return
    props.onSend(text)
    setInputVal("")
    setAttachments([])
    if (textareaRef) textareaRef.style.height = "auto"
  }

  const availableModels = createMemo(() => {
    try {
      const list = models.list?.()
      if (list && list.length > 0) {
        return list.map((m: any) => ({
          id: m.id,
          name: m.name || m.id,
          tier: m.family?.includes("pro") ? "Medium" : "Low",
          speed: "Fast",
        }))
      }
    } catch {
      // Fallback defaults
    }
    return [
      { id: "google/gemini-2.5-flash", name: "Gemini 3.5 Flash", tier: "Low", speed: "Fast" },
      { id: "google/gemini-2.5-pro", name: "Gemini 3.1 Pro", tier: "Low", speed: "Fast" },
      { id: "anthropic/claude-3-7-sonnet", name: "Claude Sonnet 4.6 (Thinking)", tier: "Medium", speed: "Fast" },
      { id: "anthropic/claude-3-5-opus", name: "Claude Opus 4.6 (Thinking)", tier: "High", speed: "Standard" },
      { id: "openai/gpt-4o", name: "GPT-OSS 120B (Medium)", tier: "Medium", speed: "Fast" },
    ]
  })

  // Attachment handler
  const handlePickFile = async () => {
    try {
      const chosen = await (platform as any).openDirectoryPickerDialog?.({ title: "Attach File" })
      if (chosen) {
        setAttachments([...attachments(), { name: chosen.split(/[\\/]/).pop() || chosen, path: chosen }])
      }
    } catch {
      // Ignore
    }
  }

  // Check MCP status
  const mcpHasErrors = createMemo(() => {
    try {
      const mcpServers = (sync()?.data as any)?.mcp ?? {}
      return Object.values(mcpServers).some((status) => status === "error" || (status as any)?.status === "error")
    } catch {
      return false
    }
  })

  return (
    <div class="relative w-full max-w-3xl mx-auto px-4 py-3 select-none">
      <div
        class="relative flex flex-col rounded-xl border border-[#2e2e2e] bg-[#1e1e1e] shadow-lg transition-all focus-within:border-[#3b82f6] focus-within:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
      >
        {/* Attachment Pills */}
        <Show when={attachments().length > 0}>
          <div class="flex flex-wrap gap-1.5 px-3.5 pt-2.5">
            <For each={attachments()}>
              {(file) => (
                <div class="flex items-center gap-1.5 rounded bg-[#2a2a2a] px-2 py-0.5 text-xs text-[#d0d0d0]">
                  <span>📄 {file.name}</span>
                  <button
                    type="button"
                    class="text-[#808080] hover:text-red-400"
                    onClick={() => setAttachments(attachments().filter((f) => f.path !== file.path))}
                  >
                    ×
                  </button>
                </div>
              )}
            </For>
          </div>
        </Show>

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          value={inputVal()}
          onInput={(e) => {
            setInputVal(e.currentTarget.value)
            adjustHeight()
          }}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything, @ to mention, / for actions"
          rows={1}
          class="w-full resize-none bg-transparent px-4 pt-3.5 pb-2 text-sm text-[#e6e6e6] placeholder-[#666666] outline-none font-sans leading-relaxed"
          style={{ "max-height": "180px", "min-height": "44px" }}
        />

        {/* Bottom Toolbar */}
        <div class="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-[#262626]/80 text-xs">
          <div class="flex items-center gap-2">
            {/* Context/Attach (+) Button */}
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-md border border-[#333333] hover:bg-[#282828] text-[#999999] hover:text-white transition-colors"
              onClick={handlePickFile}
              title="Add Context / Files"
            >
              <span class="text-sm font-semibold">+</span>
            </button>

            {/* Model Pill Dropdown */}
            <div class="relative">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-md bg-[#282828] hover:bg-[#323232] px-2.5 py-1 text-[11px] text-[#cccccc] hover:text-white transition-colors"
                onClick={() => setModelDropdownOpen(!modelDropdownOpen())}
              >
                <span class="truncate max-w-[160px] font-medium">{selectedModel()}</span>
                <span class="text-[9px] text-[#808080]">{modelDropdownOpen() ? "▲" : "▼"}</span>
              </button>

              {/* Model Dropdown Menu */}
              <Show when={modelDropdownOpen()}>
                <div
                  class="absolute bottom-full left-0 mb-1.5 w-64 rounded-lg border border-[#333333] bg-[#222222] p-1.5 shadow-2xl z-50 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150"
                >
                  <div class="px-2 py-1 text-[10px] font-semibold text-[#808080] uppercase tracking-wider">
                    Select Model
                  </div>
                  <For each={availableModels()}>
                    {(m: any) => (
                      <button
                        type="button"
                        class="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left hover:bg-[#2e2e2e] text-[#d0d0d0] hover:text-white transition-colors group"
                        onClick={() => {
                          setSelectedModel(m.name)
                          setModelDropdownOpen(false)
                        }}
                      >
                        <div class="flex flex-col min-w-0 pr-2">
                          <span class="font-medium truncate">{m.name}</span>
                          <Show when={m.tier}>
                            <span class="text-[10px] text-[#808080]">{m.tier} Tier</span>
                          </Show>
                        </div>
                        <Show when={m.speed}>
                          <span class="text-[10px] text-[#60a5fa] font-mono shrink-0">{m.speed}</span>
                        </Show>
                      </button>
                    )}
                  </For>
                </div>
              </Show>
            </div>

            {/* MCP Status Indicator */}
            <div class="flex items-center gap-1">
              <Show
                when={mcpHasErrors()}
                fallback={
                  <span class="flex items-center gap-1 text-[11px] text-emerald-400/80 px-1.5 py-0.5 rounded bg-emerald-500/10">
                    <span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    <span>MCP Active</span>
                  </span>
                }
              >
                <span class="flex items-center gap-1 text-[11px] text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                  <span>⚠</span>
                  <span>MCP Error</span>
                </span>
              </Show>
            </div>
          </div>

          {/* Right Action Controls */}
          <div class="flex items-center gap-1.5">
            {/* Voice Mic Input */}
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-md hover:bg-[#282828] text-[#888888] hover:text-white text-xs transition-colors"
              title="Voice Input"
            >
              🎤
            </button>

            {/* Submit / Stop Button */}
            <Show
              when={props.isStreaming}
              fallback={
                <button
                  type="button"
                  class={`flex h-7 w-7 items-center justify-center rounded-md transition-all ${
                    inputVal().trim()
                      ? "bg-blue-600 hover:bg-blue-500 text-white shadow-sm"
                      : "bg-[#282828] text-[#666666] cursor-not-allowed"
                  }`}
                  disabled={!inputVal().trim()}
                  onClick={handleSubmit}
                  title="Send Message"
                >
                  <span class="text-xs font-bold">↑</span>
                </button>
              }
            >
              <button
                type="button"
                class="flex h-7 w-7 items-center justify-center rounded-md bg-red-600 hover:bg-red-500 text-white transition-all shadow-sm"
                onClick={props.onStop}
                title="Stop Generation"
              >
                <span class="h-2.5 w-2.5 rounded-xs bg-white" />
              </button>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}
