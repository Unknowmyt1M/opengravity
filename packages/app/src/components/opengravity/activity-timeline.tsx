import { Component, createMemo, createSignal, For, JSX, Show } from "solid-js"
import type { Part, ToolPart } from "@opencode-ai/sdk/v2"
import { getFilename } from "@opencode-ai/core/util/path"

export type ActivityKind =
  | "plan"
  | "search"
  | "read"
  | "edit"
  | "bash"
  | "test"
  | "mcp"
  | "wait"
  | "generic"

export interface ActivityStep {
  id: string
  kind: ActivityKind
  title: string
  subtitle?: string
  status: "running" | "completed" | "failed" | "cancelled"
  durationMs?: number
  diffStats?: { add: number; del: number }
  rawOutput?: string
  filePath?: string
}

export function parseToolPartToActivity(part: any): ActivityStep {
  const toolName = (part.tool || part.callID || "tool") as string
  const name = toolName.toLowerCase()
  const state = part.state || {}
  const args = (state.input || part.input || {}) as Record<string, any>
  const partStatus = state.status || part.status || "completed"
  const output = state.output || part.output
  const status = partStatus === "running" ? "running" : partStatus === "error" ? "failed" : "completed"

  if (name.includes("plan") || name.includes("task")) {
    return {
      id: part.id || part.callID || String(Math.random()),
      kind: "plan",
      title: "Planning task execution",
      subtitle: args.prompt || args.task || "Structuring workflow",
      status,
      rawOutput: typeof output === "string" ? output : JSON.stringify(output, null, 2),
    }
  }

  if (name === "read" || name === "view_file" || name === "read_file") {
    const file = args.file || args.path || args.AbsolutePath || args.targetFile || "file"
    return {
      id: part.id || part.callID || String(Math.random()),
      kind: "read",
      title: `Reading ${getFilename(file)}`,
      subtitle: file,
      filePath: file,
      status,
      rawOutput: typeof output === "string" ? output : undefined,
    }
  }

  if (name === "grep" || name === "glob" || name === "search" || name === "find_by_name" || name === "grep_search") {
    const query = args.query || args.pattern || args.Pattern || args.Query || "search"
    return {
      id: part.id || part.callID || String(Math.random()),
      kind: "search",
      title: `Searching codebase`,
      subtitle: `"${query}"`,
      status,
      rawOutput: typeof output === "string" ? output : undefined,
    }
  }

  if (name === "write" || name === "edit" || name === "replace_file_content" || name === "write_to_file" || name === "apply_patch") {
    const file = args.file || args.path || args.TargetFile || args.targetFile || args.filePath || "file"
    const add = args.additions ?? 1
    const del = args.deletions ?? 0
    return {
      id: part.id || part.callID || String(Math.random()),
      kind: "edit",
      title: `Edited ${getFilename(file)}`,
      subtitle: file,
      filePath: file,
      status,
      diffStats: { add, del },
      rawOutput: typeof output === "string" ? output : undefined,
    }
  }

  if (name === "bash" || name === "sh" || name === "terminal" || name === "run_command") {
    const cmd = args.command || args.cmd || args.CommandLine || "command"
    const isTest = cmd.includes("test") || cmd.includes("check") || cmd.includes("lint")
    return {
      id: part.id || part.callID || String(Math.random()),
      kind: isTest ? "test" : "bash",
      title: isTest ? "Running tests & verification" : "Running command",
      subtitle: cmd,
      status,
      rawOutput: typeof output === "string" ? output : undefined,
    }
  }

  return {
    id: part.id || part.callID || String(Math.random()),
    kind: "generic",
    title: `Executed ${name}`,
    subtitle: typeof args === "object" ? JSON.stringify(args).slice(0, 60) : undefined,
    status,
    rawOutput: typeof output === "string" ? output : JSON.stringify(output, null, 2),
  }
}

export const ActivityItem: Component<{
  step: ActivityStep
  onOpenDiff?: (file: string) => void
  onOpenOutput?: () => void
}> = (props) => {
  const [expanded, setExpanded] = createSignal(false)

  const badgeColor = () => {
    switch (props.step.status) {
      case "running":
        return "text-blue-400 bg-blue-500/10 border-blue-500/30"
      case "failed":
        return "text-red-400 bg-red-500/10 border-red-500/30"
      default:
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
    }
  }

  return (
    <div class="group my-1.5 rounded-lg border border-[#272727] bg-[#1a1a1a] transition-all duration-150 hover:border-[#3a3a3a]">
      <div
        class="flex cursor-pointer items-center justify-between px-3 py-2 select-none"
        onClick={() => setExpanded(!expanded())}
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <div class={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border text-xs ${badgeColor()}`}>
            <Show
              when={props.step.status !== "running"}
              fallback={<span class="inline-block h-3 w-3 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />}
            >
              <Show when={props.step.status === "completed"}>
                <span class="text-xs">✓</span>
              </Show>
              <Show when={props.step.status === "failed"}>
                <span class="text-xs">✕</span>
              </Show>
            </Show>
          </div>

          <div class="flex flex-col min-w-0">
            <div class="flex items-center gap-2">
              <span class="text-xs font-medium text-[#e0e0e0] truncate">{props.step.title}</span>
              <Show when={props.step.diffStats}>
                <span class="flex items-center gap-1 text-[11px] font-mono">
                  <span class="text-emerald-400">+{props.step.diffStats?.add}</span>
                  <span class="text-red-400">-{props.step.diffStats?.del}</span>
                </span>
              </Show>
            </div>
            <Show when={props.step.subtitle}>
              <span class="text-[11px] text-[#808080] font-mono truncate">{props.step.subtitle}</span>
            </Show>
          </div>
        </div>

        <div class="flex items-center gap-1.5 shrink-0 ml-2">
          <Show when={props.step.filePath && props.onOpenDiff}>
            <button
              type="button"
              class="flex items-center gap-1 rounded bg-[#252525] px-2 py-0.5 text-[11px] text-[#a0a0a0] transition-colors hover:bg-[#333333] hover:text-white"
              onClick={(e) => {
                e.stopPropagation()
                props.onOpenDiff?.(props.step.filePath!)
              }}
            >
              <span>📋 Review</span>
            </button>
          </Show>
          <span class={`text-[11px] text-[#707070] transition-transform duration-200 ${expanded() ? "rotate-90" : ""}`}>
            ›
          </span>
        </div>
      </div>

      <Show when={expanded() && props.step.rawOutput}>
        <div class="border-t border-[#252525] bg-[#141414] p-2.5 rounded-b-lg font-mono text-[11px] text-[#b0b0b0] max-h-48 overflow-y-auto whitespace-pre-wrap leading-relaxed select-text">
          {props.step.rawOutput}
        </div>
      </Show>
    </div>
  )
}

export const OpenGravityActivityTimeline: Component<{
  parts: Part[]
  onOpenDiff?: (file: string) => void
}> = (props) => {
  const activitySteps = createMemo(() => {
    const steps: ActivityStep[] = []
    for (const part of props.parts) {
      if (part.type === "tool" || (part as any).tool) {
        steps.push(parseToolPartToActivity(part as ToolPart))
      }
    }
    return steps
  })

  return (
    <Show when={activitySteps().length > 0}>
      <div class="my-3 space-y-1.5">
        <div class="flex items-center justify-between px-1 text-[11px] font-semibold text-[#808080] uppercase tracking-wider">
          <span>Agent Activity</span>
          <span>{activitySteps().length} step{activitySteps().length === 1 ? "" : "s"}</span>
        </div>
        <For each={activitySteps()}>
          {(step) => <ActivityItem step={step} onOpenDiff={props.onOpenDiff} />}
        </For>
      </div>
    </Show>
  )
}
