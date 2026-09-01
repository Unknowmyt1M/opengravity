import { Component, createMemo, createSignal, For, Show } from "solid-js"
import { useTabs, tabHref } from "@/context/tabs"
import { useServer } from "@/context/server"
import { useLayout } from "@/context/layout"
import { useCommand } from "@/context/command"
import { getFilename } from "@opencode-ai/core/util/path"
import { useNavigate } from "@solidjs/router"

function formatRelativeTime(dateStr?: string | number): string {
  if (!dateStr) return "now"
  const timestamp = typeof dateStr === "string" ? new Date(dateStr).getTime() : dateStr
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.floor(diffMs / (1000 * 60))
  if (diffMinutes < 1) return "now"
  if (diffMinutes < 60) return `${diffMinutes}m`
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) return `${diffDays}d`
  const diffMonths = Math.floor(diffDays / 30)
  return `${diffMonths}mo`
}

export const OpenGravitySidebar: Component<{
  collapsed: boolean
  onToggleCollapse: () => void
  onOpenSettings: () => void
}> = (props) => {
  const tabs = useTabs()
  const server = useServer()
  const layout = useLayout()
  const command = useCommand()
  const navigate = useNavigate()

  const [projectsExpanded, setProjectsExpanded] = createSignal(true)
  const [conversationsExpanded, setConversationsExpanded] = createSignal(true)

  // Current project directory and name
  const projects = createMemo(() => {
    try {
      return layout.projects?.list?.() ?? []
    } catch {
      return []
    }
  })

  const currentProjectName = () => {
    try {
      const list = projects()
      if (list.length > 0) return list[0].name || getFilename(list[0].worktree) || "OpenGravity Workspace"
    } catch {
      // Fallback
    }
    return "OpenGravity Workspace"
  }

  // Open tabs / active session
  const openTabs = createMemo(() => {
    try {
      return tabs.store ?? []
    } catch {
      return []
    }
  })

  // Open directory picker
  const handleOpenFolder = () => {
    try {
      command.trigger("project.open")
    } catch (e) {
      console.error("Failed to open project folder", e)
    }
  }

  // Create new conversation
  const handleNewConversation = () => {
    try {
      const list = projects()
      const dir = list.length > 0 ? list[0].worktree : ""
      tabs.newDraft({ server: server.key, directory: dir })
    } catch {
      navigate("/")
    }
  }

  return (
    <aside
      class="flex flex-col border-r border-[#242424] bg-[#171717] text-[#cccccc] select-none transition-all duration-200 shrink-0 h-full"
      style={{ width: props.collapsed ? "52px" : "240px" }}
    >
      {/* Top bar with hamburger and history arrows */}
      <div class="flex h-11 items-center justify-between px-3 border-b border-[#242424] shrink-0">
        <button
          type="button"
          class="flex h-7 w-7 items-center justify-center rounded hover:bg-[#282828] text-[#a0a0a0] hover:text-white transition-colors"
          onClick={props.onToggleCollapse}
          title="Toggle Sidebar"
        >
          <span class="text-sm font-bold">≡</span>
        </button>

        <Show when={!props.collapsed}>
          <div class="flex items-center gap-1">
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded hover:bg-[#282828] text-[#808080] hover:text-white text-xs transition-colors"
              onClick={() => window.history.back()}
              title="Go Back"
            >
              ←
            </button>
            <button
              type="button"
              class="flex h-6 w-6 items-center justify-center rounded hover:bg-[#282828] text-[#808080] hover:text-white text-xs transition-colors"
              onClick={() => window.history.forward()}
              title="Go Forward"
            >
              →
            </button>
          </div>
        </Show>
      </div>

      <Show when={!props.collapsed}>
        {/* New Conversation Button */}
        <div class="p-2.5 shrink-0">
          <button
            type="button"
            class="flex w-full items-center justify-center gap-2 rounded-md border border-[#3b82f6]/40 bg-[#3b82f6]/10 px-3 py-2 text-xs font-medium text-[#60a5fa] hover:border-[#3b82f6] hover:bg-[#3b82f6]/20 transition-all shadow-sm"
            onClick={handleNewConversation}
          >
            <span class="text-sm leading-none">+</span>
            <span>New Conversation</span>
          </button>
        </div>

        {/* Quick Nav Links */}
        <div class="px-2 space-y-0.5 text-xs text-[#a0a0a0] shrink-0">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-[#222222] hover:text-white transition-colors text-left"
            onClick={() => command.trigger("session.history")}
          >
            <span class="text-sm">🕒</span>
            <span>Conversation History</span>
          </button>
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 hover:bg-[#222222] hover:text-white transition-colors text-left"
            onClick={() => command.trigger("session.history")}
          >
            <span class="text-sm">📅</span>
            <span>Scheduled Tasks</span>
          </button>
        </div>

        {/* Scrollable list of Projects and Conversations */}
        <div class="flex-1 overflow-y-auto px-2 py-2 space-y-4 text-xs scrollbar-thin">
          {/* Projects Section */}
          <div>
            <div
              class="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#808080] uppercase tracking-wider cursor-pointer select-none group"
              onClick={() => setProjectsExpanded(!projectsExpanded())}
            >
              <div class="flex items-center gap-1.5">
                <span>Projects</span>
                <span class="text-[9px] text-[#606060]">{projectsExpanded() ? "▼" : "▶"}</span>
              </div>
              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  class="h-4 w-4 rounded hover:bg-[#303030] text-[#a0a0a0] flex items-center justify-center"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleOpenFolder()
                  }}
                  title="Open Project Folder"
                >
                  📁+
                </button>
              </div>
            </div>

            <Show when={projectsExpanded()}>
              <div class="mt-1 space-y-0.5">
                <For
                  each={projects()}
                  fallback={
                    <div class="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs bg-[#242424] text-white font-medium">
                      <div class="flex items-center gap-2 truncate">
                        <span>📁</span>
                        <span class="truncate">{currentProjectName()}</span>
                      </div>
                      <span class="text-[10px] text-[#3b82f6] font-mono">active</span>
                    </div>
                  }
                >
                  {(project) => (
                    <div
                      class="flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs bg-[#242424] text-white font-medium cursor-pointer hover:bg-[#2c2c2c] transition-colors"
                      onClick={() => {
                        tabs.newDraft({ server: server.key, directory: project.worktree })
                      }}
                    >
                      <div class="flex items-center gap-2 truncate">
                        <span>📁</span>
                        <span class="truncate">{project.name || getFilename(project.worktree)}</span>
                      </div>
                      <span class="text-[10px] text-[#3b82f6] font-mono">active</span>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </div>

          {/* Conversations Section */}
          <div>
            <div
              class="flex items-center justify-between px-2 py-1 text-[11px] font-semibold text-[#808080] uppercase tracking-wider cursor-pointer select-none group"
              onClick={() => setConversationsExpanded(!conversationsExpanded())}
            >
              <div class="flex items-center gap-1.5">
                <span>Conversations</span>
                <span class="text-[9px] text-[#606060]">{conversationsExpanded() ? "▼" : "▶"}</span>
              </div>
              <button
                type="button"
                class="h-4 w-4 rounded hover:bg-[#303030] text-[#a0a0a0] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  handleNewConversation()
                }}
                title="New Conversation"
              >
                +
              </button>
            </div>

            <Show when={conversationsExpanded()}>
              <div class="mt-1 space-y-0.5">
                <For
                  each={openTabs()}
                  fallback={
                    <div class="px-2.5 py-2 text-[11px] text-[#606060] italic">
                      No active conversations
                    </div>
                  }
                >
                  {(tab) => {
                    const title = () => (tab.type === "session" ? `Session ${tab.sessionId.slice(0, 8)}` : "New Session Draft")
                    const href = () => tabHref(tab)

                    return (
                      <button
                        type="button"
                        class="flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors group text-[#a0a0a0] hover:bg-[#1f1f1f] hover:text-[#e0e0e0]"
                        onClick={() => {
                          navigate(href())
                        }}
                      >
                        <div class="flex items-center gap-1.5 min-w-0 pr-2">
                          <span class="h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span class="truncate">{title()}</span>
                        </div>
                        <span class="text-[10px] text-[#666666] shrink-0 font-mono">
                          active
                        </span>
                      </button>
                    )
                  }}
                </For>
              </div>
            </Show>
          </div>
        </div>

        {/* Bottom Settings Button */}
        <div class="border-t border-[#242424] p-2 shrink-0">
          <button
            type="button"
            class="flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-xs text-[#909090] hover:bg-[#222222] hover:text-white transition-colors"
            onClick={props.onOpenSettings}
          >
            <span>⚙</span>
            <span>Settings</span>
          </button>
        </div>
      </Show>

      {/* Collapsed Icon Bar Mode */}
      <Show when={props.collapsed}>
        <div class="flex flex-1 flex-col items-center justify-between py-3">
          <div class="space-y-3">
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-md border border-[#3b82f6]/40 bg-[#3b82f6]/10 text-[#60a5fa] hover:bg-[#3b82f6]/20 transition-colors"
              onClick={handleNewConversation}
              title="New Conversation"
            >
              +
            </button>
            <button
              type="button"
              class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#242424] text-[#a0a0a0] transition-colors"
              onClick={handleOpenFolder}
              title="Open Folder"
            >
              📁
            </button>
          </div>

          <button
            type="button"
            class="flex h-8 w-8 items-center justify-center rounded-md hover:bg-[#242424] text-[#a0a0a0] transition-colors"
            onClick={props.onOpenSettings}
            title="Settings"
          >
            ⚙
          </button>
        </div>
      </Show>
    </aside>
  )
}
