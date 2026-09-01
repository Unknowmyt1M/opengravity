import { Component, createMemo, createSignal, For, Match, Show, Switch } from "solid-js"
import { useTerminal } from "@/context/terminal"
import { useServerSync } from "@/context/server-sync"
import { TerminalPanelV2 } from "@/pages/session/terminal-panel-v2"

export type InspectorTab = "overview" | "review" | "terminal" | "tasks" | "files"

export const OpenGravityInspectorPanel: Component<{
  activeTab?: InspectorTab
  onTabChange?: (tab: InspectorTab) => void
  onClose?: () => void
  activeFileDiff?: string
  diffs?: any[]
}> = (props) => {
  const [selectedTab, setSelectedTab] = createSignal<InspectorTab>(props.activeTab ?? "overview")
  const terminal = useTerminal()
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
    return props.diffs ?? []
  })

  const ptyList = createMemo(() => {
    try {
      return terminal.all?.() ?? []
    } catch {
      return []
    }
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
              <span class="rounded-full bg-blue-500/20 px-1.5 py-0.2 text-[10px] text-blue-400 font-mono">
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
            <span>&gt;_ Terminal</span>
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

      {/* Main Drawer Body */}
      <div class="flex-1 overflow-y-auto p-3 text-xs scrollbar-thin">
        <Switch>
          {/* Overview Tab with Accordions */}
          <Match when={currentTab() === "overview"}>
            <div class="space-y-3">
              {/* Files Changed Accordion */}
              <div class="rounded-lg border border-[#252525] bg-[#1a1a1a] overflow-hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2 text-left font-medium hover:bg-[#202020] transition-colors"
                  onClick={() => setFilesOpen(!filesOpen())}
                >
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-[#777777]">{filesOpen() ? "▼" : "▶"}</span>
                    <span>Files Changed</span>
                  </div>
                  <span class="rounded bg-[#282828] px-1.5 py-0.5 text-[10px] text-[#999999] font-mono">
                    {changedFiles().length}
                  </span>
                </button>

                <Show when={filesOpen()}>
                  <div class="border-t border-[#252525] bg-[#141414] p-2 space-y-1">
                    <For
                      each={changedFiles()}
                      fallback={
                        <div class="py-2 text-center text-[#666666] text-[11px] italic">
                          No modified files
                        </div>
                      }
                    >
                      {(item: any) => (
                        <div class="flex items-center justify-between rounded px-2 py-1 hover:bg-[#202020] cursor-pointer group">
                          <span class="truncate text-[#d0d0d0] text-[11px]">{item.file || item.path || item}</span>
                          <span class="text-[10px] text-emerald-400 font-mono">+{item.additions || 1}</span>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>

              {/* Tasks Accordion */}
              <div class="rounded-lg border border-[#252525] bg-[#1a1a1a] overflow-hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2 text-left font-medium hover:bg-[#202020] transition-colors"
                  onClick={() => setTasksOpen(!tasksOpen())}
                >
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-[#777777]">{tasksOpen() ? "▼" : "▶"}</span>
                    <span>Active Tasks</span>
                  </div>
                  <span class="rounded bg-[#282828] px-1.5 py-0.5 text-[10px] text-[#999999] font-mono">
                    1
                  </span>
                </button>

                <Show when={tasksOpen()}>
                  <div class="border-t border-[#252525] bg-[#141414] p-2.5 space-y-1.5">
                    <div class="flex items-start gap-2">
                      <span class="h-2 w-2 rounded-full bg-blue-400 mt-1 shrink-0 animate-pulse" />
                      <div class="flex flex-col">
                        <span class="font-medium text-[#e0e0e0] text-[11px]">OpenGravity Agent Loop</span>
                        <span class="text-[10px] text-[#808080]">Durable session supervisor active</span>
                      </div>
                    </div>
                  </div>
                </Show>
              </div>

              {/* Skills Used Accordion */}
              <div class="rounded-lg border border-[#252525] bg-[#1a1a1a] overflow-hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2 text-left font-medium hover:bg-[#202020] transition-colors"
                  onClick={() => setSkillsOpen(!skillsOpen())}
                >
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-[#777777]">{skillsOpen() ? "▼" : "▶"}</span>
                    <span>Skills / Tool Capabilities</span>
                  </div>
                  <span class="rounded bg-[#282828] px-1.5 py-0.5 text-[10px] text-[#999999] font-mono">
                    Built-in
                  </span>
                </button>

                <Show when={skillsOpen()}>
                  <div class="border-t border-[#252525] bg-[#141414] p-2 space-y-1">
                    <div class="flex items-center justify-between rounded px-2 py-1 text-[11px] text-[#bbbbbb]">
                      <span>⚡ Filesystem Tools (view_file, write_to_file)</span>
                      <span class="text-[10px] text-emerald-400 font-mono">READY</span>
                    </div>
                    <div class="flex items-center justify-between rounded px-2 py-1 text-[11px] text-[#bbbbbb]">
                      <span>⚡ Search (grep_search, find_by_name)</span>
                      <span class="text-[10px] text-emerald-400 font-mono">READY</span>
                    </div>
                    <div class="flex items-center justify-between rounded px-2 py-1 text-[11px] text-[#bbbbbb]">
                      <span>⚡ Process Execution (run_command)</span>
                      <span class="text-[10px] text-emerald-400 font-mono">READY</span>
                    </div>
                  </div>
                </Show>
              </div>

              {/* Terminals Accordion */}
              <div class="rounded-lg border border-[#252525] bg-[#1a1a1a] overflow-hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2 text-left font-medium hover:bg-[#202020] transition-colors"
                  onClick={() => setTerminalsOpen(!terminalsOpen())}
                >
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-[#777777]">{terminalsOpen() ? "▼" : "▶"}</span>
                    <span>Terminals (ConPTY)</span>
                  </div>
                  <span class="rounded bg-[#282828] px-1.5 py-0.5 text-[10px] text-[#999999] font-mono">
                    {ptyList().length}
                  </span>
                </button>

                <Show when={terminalsOpen()}>
                  <div class="border-t border-[#252525] bg-[#141414] p-2">
                    <button
                      type="button"
                      class="flex w-full items-center justify-center gap-1 rounded border border-[#333333] py-1.5 text-xs text-[#a0a0a0] hover:bg-[#202020] hover:text-white transition-colors"
                      onClick={() => handleSelectTab("terminal")}
                    >
                      <span>&gt;_ Open Active Terminal</span>
                    </button>
                  </div>
                </Show>
              </div>

              {/* Subagents Accordion */}
              <div class="rounded-lg border border-[#252525] bg-[#1a1a1a] overflow-hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2 text-left font-medium hover:bg-[#202020] transition-colors"
                  onClick={() => setSubagentsOpen(!subagentsOpen())}
                >
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-[#777777]">{subagentsOpen() ? "▼" : "▶"}</span>
                    <span>Subagents</span>
                  </div>
                  <span class="rounded bg-[#282828] px-1.5 py-0.5 text-[10px] text-[#999999] font-mono">
                    0
                  </span>
                </button>

                <Show when={subagentsOpen()}>
                  <div class="border-t border-[#252525] bg-[#141414] p-2 text-center text-[#666666] text-[11px] italic">
                    No active subagents
                  </div>
                </Show>
              </div>

              {/* Artifacts Accordion */}
              <div class="rounded-lg border border-[#252525] bg-[#1a1a1a] overflow-hidden">
                <button
                  type="button"
                  class="flex w-full items-center justify-between px-3 py-2 text-left font-medium hover:bg-[#202020] transition-colors"
                  onClick={() => setArtifactsOpen(!artifactsOpen())}
                >
                  <div class="flex items-center gap-2">
                    <span class="text-[10px] text-[#777777]">{artifactsOpen() ? "▼" : "▶"}</span>
                    <span>Artifacts &amp; Diagrams</span>
                  </div>
                  <span class="rounded bg-[#282828] px-1.5 py-0.5 text-[10px] text-[#999999] font-mono">
                    0
                  </span>
                </button>

                <Show when={artifactsOpen()}>
                  <div class="border-t border-[#252525] bg-[#141414] p-2 text-center text-[#666666] text-[11px] italic">
                    No artifacts generated yet
                  </div>
                </Show>
              </div>
            </div>
          </Match>

          {/* Review Diff Tab */}
          <Match when={currentTab() === "review"}>
            <div class="h-full flex flex-col p-2 space-y-2">
              <div class="flex items-center justify-between pb-2 border-b border-[#252525]">
                <span class="font-semibold text-xs text-white">Pending Changes</span>
                <span class="text-[10px] text-[#888888]">{changedFiles().length} files</span>
              </div>
              <For
                each={changedFiles()}
                fallback={
                  <div class="h-40 flex flex-col items-center justify-center text-center text-[#666666] gap-2">
                    <span>No uncommitted changes in working tree</span>
                  </div>
                }
              >
                {(file: any) => (
                  <div class="flex items-center justify-between rounded bg-[#1f1f1f] p-2 text-xs">
                    <span class="font-mono text-[#d0d0d0]">{file.path || file}</span>
                    <span class="text-emerald-400 font-mono">+{file.additions || 1}</span>
                  </div>
                )}
              </For>
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
