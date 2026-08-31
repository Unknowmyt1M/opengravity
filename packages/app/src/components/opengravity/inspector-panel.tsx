import { Component, createMemo, createSignal, For, Match, Show, Switch } from "solid-js"
import { useFile } from "@/context/file"
import { useTerminal } from "@/context/terminal"
import { useSDK } from "@/context/sdk"
import { useServerSync } from "@/context/server-sync"
import { TerminalPanelV2 } from "@/pages/session/terminal-panel-v2"
import { ReviewPanelV2 } from "@/pages/session/v2/review-panel-v2"
import type { VcsFileDiff } from "@opencode-ai/sdk/v2"

export type InspectorTab = "overview" | "review" | "terminal" | "tasks" | "files"

export const OpenGravityInspectorPanel: Component<{
  activeTab?: InspectorTab
  onTabChange?: (tab: InspectorTab) => void
  onClose?: () => void
  activeFileDiff?: string
}> = (props) => {
  const [selectedTab, setSelectedTab] = createSignal<InspectorTab>(props.activeTab ?? "overview")
  const file = useFile()
  const terminal = useTerminal()
  const sdk = useSDK()
  const sync = useServerSync()

  // Track active tab changes
  const currentTab = () => props.activeTab ?? selectedTab()

  const handleSelectTab = (tab: InspectorTab) => {
    setSelectedTab(tab)
    props.onTabChange?.(tab)
  }

  // Accordion state
  const [subagentsOpen, setSubagentsOpen] = createSignal(false)
  const [filesOpen, setFilesOpen] = createSignal(true)
  const [artifactsOpen, setArtifactsOpen] = createSignal(false)
  const [tasksOpen, setTasksOpen] = createSignal(true)
  const [terminalsOpen, setTerminalsOpen] = createSignal(false)
  const [skillsOpen, setSkillsOpen] = createSignal(true)

  // Data counts
  const changedFiles = createMemo(() => {
    return file.changedFiles?.() ?? []
  })

  const ptyList = createMemo(() => {
    return terminal.ptys ?? []
  })

  return (
    <div class="flex h-full flex-col border-l border-[#242424] bg-[#171717] text-[#cccccc] select-none min-w-[320px] max-w-[500px]">
      {/* Tab Header */}
      <div class="flex h-10 items-center justify-between border-b border-[#242424] px-2 bg-[#1b1b1b]">
        <div class="flex items-center gap-1">
          <button
            type="button"
            class={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              currentTab() === "overview"
                ? "bg-[#282828] text-white"
                : "text-[#888888] hover:bg-[#222222] hover:text-[#cccccc]"
            }`}
            onClick={() => handleSelectTab("overview")}
          >
            <span>Overview</span>
          </button>
          <button
            type="button"
            class={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              currentTab() === "review"
                ? "bg-[#282828] text-white"
                : "text-[#888888] hover:bg-[#222222] hover:text-[#cccccc]"
            }`}
            onClick={() => handleSelectTab("review")}
          >
            <span>📋 Review</span>
            <Show when={changedFiles().length > 0}>
              <span class="rounded-full bg-blue-500/20 px-1 text-[10px] text-blue-400 font-mono">
                {changedFiles().length}
              </span>
            </Show>
          </button>
          <button
            type="button"
            class={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              currentTab() === "terminal"
                ? "bg-[#282828] text-white"
                : "text-[#888888] hover:bg-[#222222] hover:text-[#cccccc]"
            }`}
            onClick={() => handleSelectTab("terminal")}
          >
            <span>>_ Terminal</span>
          </button>
        </div>

        <Show when={props.onClose}>
          <button
            type="button"
            class="flex h-6 w-6 items-center justify-center rounded hover:bg-[#282828] text-[#808080] hover:text-white text-xs transition-colors"
            onClick={props.onClose}
            title="Close Panel"
          >
            ✕
          </button>
        </Show>
      </div>

      {/* Main Content Pane */}
      <div class="flex-1 overflow-y-auto">
        <Switch>
          {/* Overview Tab (Antigravity Accordions) */}
          <Match when={currentTab() === "overview"}>
            <div class="p-3 space-y-2 text-xs">
              {/* Files Changed Accordion */}
              <div class="rounded-lg border border-[#252525] bg-[#1a1a1a] overflow-hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2 text-left font-medium hover:bg-[#222222] transition-colors select-none"
                  onClick={() => setFilesOpen(!filesOpen())}
                >
                  <div class="flex items-center gap-2">
                    <span>Files Changed</span>
                    <span class="rounded bg-[#282828] px-1.5 py-0.2 text-[10px] text-emerald-400 font-mono">
                      {changedFiles().length}
                    </span>
                  </div>
                  <span class={`text-[10px] text-[#707070] transition-transform ${filesOpen() ? "rotate-90" : ""}`}>
                    ›
                  </span>
                </button>
                <Show when={filesOpen()}>
                  <div class="border-t border-[#252525] bg-[#141414] p-2 space-y-1">
                    <For
                      each={changedFiles()}
                      fallback={
                        <div class="text-[11px] text-[#606060] italic py-1 px-2">No modified files</div>
                      }
                    >
                      {(fileItem: any) => (
                        <button
                          type="button"
                          class="flex w-full items-center justify-between rounded px-2 py-1 text-left text-[11px] hover:bg-[#202020] text-[#b0b0b0] hover:text-white transition-colors group"
                          onClick={() => handleSelectTab("review")}
                        >
                          <div class="flex items-center gap-1.5 truncate">
                            <span class="text-amber-400 font-bold">•</span>
                            <span class="truncate">{fileItem.path || fileItem}</span>
                          </div>
                          <span class="text-[10px] text-blue-400 group-hover:underline">Diff</span>
                        </button>
                      )}
                    </For>
                  </div>
                </Show>
              </div>

              {/* Terminals Accordion */}
              <div class="rounded-lg border border-[#252525] bg-[#1a1a1a] overflow-hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2 text-left font-medium hover:bg-[#222222] transition-colors select-none"
                  onClick={() => setTerminalsOpen(!terminalsOpen())}
                >
                  <div class="flex items-center gap-2">
                    <span>Terminals</span>
                    <span class="rounded bg-[#282828] px-1.5 py-0.2 text-[10px] text-[#a0a0a0] font-mono">
                      {ptyList().length}
                    </span>
                  </div>
                  <span class={`text-[10px] text-[#707070] transition-transform ${terminalsOpen() ? "rotate-90" : ""}`}>
                    ›
                  </span>
                </button>
                <Show when={terminalsOpen()}>
                  <div class="border-t border-[#252525] bg-[#141414] p-2">
                    <button
                      type="button"
                      class="flex w-full items-center justify-center gap-1 rounded border border-[#333333] py-1.5 text-xs text-[#a0a0a0] hover:bg-[#202020] hover:text-white transition-colors"
                      onClick={() => handleSelectTab("terminal")}
                    >
                      <span>>_ Open Active Terminal</span>
                    </button>
                  </div>
                </Show>
              </div>

              {/* Subagents Accordion */}
              <div class="rounded-lg border border-[#252525] bg-[#1a1a1a] overflow-hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2 text-left font-medium hover:bg-[#222222] transition-colors select-none"
                  onClick={() => setSubagentsOpen(!subagentsOpen())}
                >
                  <div class="flex items-center gap-2">
                    <span>Subagents</span>
                    <span class="text-[10px] text-[#606060] font-mono">0</span>
                  </div>
                  <span class={`text-[10px] text-[#707070] transition-transform ${subagentsOpen() ? "rotate-90" : ""}`}>
                    ›
                  </span>
                </button>
              </div>

              {/* Skills Used Accordion */}
              <div class="rounded-lg border border-[#252525] bg-[#1a1a1a] overflow-hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2 text-left font-medium hover:bg-[#222222] transition-colors select-none"
                  onClick={() => setSkillsOpen(!skillsOpen())}
                >
                  <div class="flex items-center gap-2">
                    <span>Skills Used</span>
                    <span class="rounded bg-[#282828] px-1.5 py-0.2 text-[10px] text-[#a0a0a0] font-mono">1</span>
                  </div>
                  <span class={`text-[10px] text-[#707070] transition-transform ${skillsOpen() ? "rotate-90" : ""}`}>
                    ›
                  </span>
                </button>
                <Show when={skillsOpen()}>
                  <div class="border-t border-[#252525] bg-[#141414] p-2 space-y-1">
                    <div class="flex items-center gap-2 rounded px-2 py-1 text-[11px] text-[#a0a0a0]">
                      <span>⚡</span>
                      <span class="font-mono truncate">antigravity-guide</span>
                    </div>
                  </div>
                </Show>
              </div>
            </div>
          </Match>

          {/* Review Diff Tab */}
          <Match when={currentTab() === "review"}>
            <div class="h-full flex flex-col">
              <ReviewPanelV2 />
            </div>
          </Match>

          {/* Terminal Tab */}
          <Match when={currentTab() === "terminal"}>
            <div class="h-full flex flex-col">
              <TerminalPanelV2 />
            </div>
          </Match>
        </Switch>
      </div>
    </div>
  )
}
