import { Component, createEffect, createMemo, createSignal, For, onCleanup, onMount, Show } from "solid-js"
import { usePrompt } from "@/context/prompt"
import { useModels } from "@/context/models"
import { useSDK } from "@/context/sdk"
import { usePlatform } from "@/context/platform"
import { useServerSync } from "@/context/server-sync"
import { useLanguage } from "@/context/language"
import type { Model } from "@opencode-ai/sdk/v2"

export const OpenGravityComposer: Component<{
  onSend: (text: string) => void
  onStop?: () => void
  isStreaming?: boolean
}> = (props) => {
  const prompt = usePrompt()
  const models = useModels()
  const sdk = useSDK()
  const platform = usePlatform()
  const sync = useServerSync()
  const language = useLanguage()

  const [inputVal, setInputVal] = createSignal("")
  const [modelDropdownOpen, setModelDropdownOpen] = createSignal(false)
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
    if (textareaRef) textareaRef.style.height = "auto"
  }

  // Model selection
  const currentModel = () => {
    const active = prompt.model()
    return active ? `${active.provider}/${active.model}` : "Gemini 3.5 Flash Low"
  }

  const availableModels = createMemo(() => {
    return models.data?.models ?? [
      { id: "google/gemini-2.5-flash", name: "Gemini 3.5 Flash", tier: "Low", speed: "Fast" },
      { id: "google/gemini-2.5-pro", name: "Gemini 3.1 Pro", tier: "Low", speed: "Fast" },
      { id: "anthropic/claude-3-7-sonnet", name: "Claude Sonnet 4.6 (Thinking)", tier: "Medium", speed: "Fast" },
      { id: "anthropic/claude-3-5-opus", name: "Claude Opus 4.6 (Thinking)", tier: "High", speed: "Standard" },
      { id: "openai/gpt-4o", name: "GPT-OSS 120B (Medium)", tier: "Medium", speed: "Fast" },
    ]
  })

  // Attachment handler
  const handlePickFile = async () => {
    await platform.openAttachmentPickerDialog?.({}, (file) => {
      prompt.attachments.add(file)
    })
  }

  // Check MCP status
  const mcpHasErrors = createMemo(() => {
    const mcpServers = sync.data.mcp ?? {}
    return Object.values(mcpServers).some((status) => status === "error" || (status as any)?.status === "error")
  })

  return (
    <div class="relative w-full max-w-3xl mx-auto px-4 py-3 select-none">
      <div
        class="relative flex flex-col rounded-xl border border-[#2e2e2e] bg-[#1e1e1e] shadow-lg transition-all focus-within:border-[#3b82f6] focus-within:shadow-[0_0_12px_rgba(59,130,246,0.15)]"
      >
        {/* Attachment Pills */}
        <Show when={prompt.attachments.files().length > 0}>
          <div class="flex flex-wrap gap-1.5 px-3.5 pt-2.5">
            <For each={prompt.attachments.files()}>
              {(file) => (
                <div class="flex items-center gap-1.5 rounded bg-[#2a2a2a] px-2 py-0.5 text-xs text-[#d0d0d0]">
                  <span>📄 {file.name}</span>
                  <button
                    type="button"
                    class="text-[#808080] hover:text-red-400"
                    onClick={() => prompt.attachments.remove(file)}
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
          class="w-full resize-none bg-transparent px-3.5 pt-3 pb-2 text-xs text-[#ededed] placeholder-[#707070] outline-none leading-relaxed select-text min-h-[38px] max-h-[180px]"
        />

        {/* Controls Bottom Row */}
        <div class="flex items-center justify-between px-3 py-2 border-t border-[#262626]">
          <div class="flex items-center gap-2">
            {/* Context/Attachment (+) Button */}
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded-md hover:bg-[#2c2c2c] text-[#909090] hover:text-white transition-colors"
              onClick={handlePickFile}
              title="Add Context / Attachment"
            >
              <span class="text-sm font-bold leading-none">+</span>
            </button>

            {/* Model Selector Pill */}
            <div class="relative">
              <button
                type="button"
                class="flex items-center gap-1.5 rounded-md bg-[#282828] hover:bg-[#323232] px-2.5 py-1 text-[11px] text-[#cccccc] hover:text-white transition-colors"
                onClick={() => setModelDropdownOpen(!modelDropdownOpen())}
              >
                <span class="truncate max-w-[160px] font-medium">{currentModel()}</span>
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
                          prompt.setModel({ provider: m.id.split("/")[0], model: m.id.split("/")[1] || m.id })
                          setModelDropdownOpen(false)
                        }}
                      >
                        <div class="flex flex-col min-w-0 pr-2">
                          <span class="font-medium truncate">{m.name || m.id}</span>
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
                <span class="flex items-center gap-1 text-[11px] text-amber-400 px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 font-medium">
                  <span>⚠</span>
                  <span>MCP Error</span>
                </span>
              </Show>
            </div>
          </div>

          <div class="flex items-center gap-2">
            {/* Microphone Voice Input */}
            <button
              type="button"
              class="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#2c2c2c] text-[#808080] hover:text-white transition-colors"
              title="Voice Input (Mic)"
            >
              🎤
            </button>

            {/* Send / Stop Button */}
            <Show
              when={!props.isStreaming}
              fallback={
                <button
                  type="button"
                  class="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors shadow-md"
                  onClick={props.onStop}
                  title="Stop Execution"
                >
                  <span class="h-2.5 w-2.5 bg-white rounded-sm" />
                </button>
              }
            >
              <button
                type="button"
                disabled={!inputVal().trim()}
                class="flex h-7 w-7 items-center justify-center rounded-full bg-[#3b82f6] hover:bg-[#2563eb] disabled:bg-[#2a2a2a] disabled:text-[#666666] text-white transition-all shadow-md active:scale-95"
                onClick={handleSubmit}
                title="Send Message (Enter)"
              >
                <span class="text-sm font-bold">→</span>
              </button>
            </Show>
          </div>
        </div>
      </div>
    </div>
  )
}
