# OpenGravity — Phase 4: Antigravity UI Reconstruction & Feature Integration

> **Status:** Planning / implementation specification
>
> **Scope:** Phase 4 only
>
> **Rule:** Do not redesign the OpenCode backend/core unless a concrete integration blocker is discovered.
>
> **Primary objective:** Transform the existing OpenCode desktop/application UI into the OpenGravity agent-first experience using the Antigravity reconnaissance evidence, while preserving and correctly wiring the existing OpenCode functionality.

---

## 0. Core Principle

OpenGravity is **not** a visual mockup of Antigravity.

The target is:

```text
OpenCode engine + existing features
            ↓
      OpenGravity UI layer
            ↓
Antigravity-inspired interaction model
            ↓
Fully functional Windows AI coding IDE
```

The new UI must remain connected to the existing OpenCode functionality. A component is not considered complete merely because it visually resembles the reference.

Every important interaction must work end-to-end:

```text
User action
  ↓
UI state
  ↓
Existing SDK / store / event flow
  ↓
Existing OpenCode feature
  ↓
Result/event
  ↓
New OpenGravity UI state
```

Prefer **adapting the existing architecture** over duplicating functionality.

---

# Phase 4A — UI Reconstruction

## 1. Evidence Sources

The implementation agent will receive:

1. `storyboard_analysis.md`
2. The complete extracted-frame directory containing 7,000+ frames
3. The original `ui.mp4` recording when available
4. The existing OpenGravity repository
5. Existing OpenCode UI components and design system

### Evidence priority

Use this priority when deciding visual behavior:

```text
Actual Antigravity frame/video
        ↓
Multiple consecutive frames showing the same behavior
        ↓
Storyboard analysis
        ↓
Documented/researched behavior
        ↓
Inference
```

Do not blindly copy approximate values from the storyboard. If a color, spacing, timing, dimension, radius, or animation value can be verified from the frames, verify it visually.

### 7,000+ frame rule

Do **not** attempt to load all frames into context simultaneously.

Treat the frame directory as an on-demand visual dataset.

Workflow:

```text
Storyboard
 ↓
Identify component/state
 ↓
Locate relevant timestamp/frame range
 ↓
Inspect representative frame
 ↓
Inspect before/during/after frames for motion
 ↓
Implement
 ↓
Compare with reference
```

When a visual decision is uncertain, inspect additional nearby frames instead of guessing.

---

## 2. UI Inventory

Audit and reconstruct the major application regions:

- desktop shell
- titlebar
- application navigation
- workspace/project selector
- activity/navigation sidebar
- file explorer
- project tree
- agent/task area
- conversation/timeline
- prompt composer
- model/agent selector
- editor/code surface
- diff/review surface
- terminal
- bottom panel
- tabs
- command palette
- search
- settings
- dialogs
- popovers
- context menus
- tooltips
- notifications/toasts
- status indicators
- loading states
- empty states
- error states

For every component determine:

- dimensions
- position
- alignment
- padding
- margin
- typography
- iconography
- border/radius
- surface/background treatment
- hover state
- focus state
- active state
- disabled state
- selected state
- loading state
- error state
- transition
- keyboard behavior
- resize behavior
- collapse/expand behavior

---

## 3. Layout Reconstruction

Build the OpenGravity workspace around an agent-first layout.

The exact dimensions must be derived from the reference evidence rather than arbitrary hardcoding.

The layout must support:

- project/file navigation
- primary agent workspace
- code/diff inspection
- terminal usage
- responsive panel resizing
- persistent state where appropriate
- keyboard navigation

Do not destroy existing layout functionality simply to match a screenshot.

---

## 4. Design System

Extend the existing OpenCode UI primitives wherever possible.

Do not introduce a second unrelated design system.

Create/reuse tokens for:

- spacing
- typography
- surfaces
- borders
- radii
- shadows
- status colors
- focus rings
- animation timing
- transitions

If the reference uses subtle visual effects, reproduce them through reusable primitives rather than one-off CSS scattered throughout components.

---

## 5. Animation & Motion Reconstruction

Animations must be treated as part of the UI specification, not optional polish.

For each important transition determine from the reference:

- trigger
- initial state
- intermediate state
- final state
- approximate duration
- direction
- opacity change
- transform
- scale
- easing character
- whether the animation is interruptible
- whether it occurs on mount, state change, or user interaction

Implement reusable motion patterns where appropriate.

Never invent complex animation if the reference does not show it.

---

## 6. Agent Activity Timeline UI

Create the OpenGravity activity/timeline experience from the existing OpenCode session and tool events.

The UI should visually distinguish states such as:

- planning
- searching
- reading
- editing
- running commands
- waiting
- permission required
- tool completed
- error
- completed

The timeline must be **event-driven**, not a fake animation layer.

Existing event data should determine the actual state.

Example:

```text
session/tool event
       ↓
state mapping
       ↓
activity item
       ↓
loading/running state
       ↓
completion/error state
```

---

# Phase 4B — Existing Feature Integration

## 7. Integration Rule

Every redesigned UI feature must identify the existing OpenCode functionality it represents.

Before implementing a new service, inspect existing code.

Preferred approach:

```text
Existing backend/API/event
        ↓
Existing SDK/context/store
        ↓
New OpenGravity presentation component
```

Avoid:

```text
New UI
 ↓
Duplicate backend logic
 ↓
Duplicate state
 ↓
Inconsistent behavior
```

---

## 8. Agent & Session Integration

The new agent workspace must remain fully functional with existing sessions.

Verify:

- creating a session
- opening a session
- switching sessions
- sending prompts
- streaming responses
- continuing a task
- steering/interruption if supported
- cancelling a task
- session history
- session state restoration
- agent switching
- model switching

The new UI must subscribe to the existing state/event infrastructure rather than maintaining a disconnected fake state machine.

---

## 9. Tool Activity Integration

Map existing tool events to the new activity presentation.

At minimum inspect the existing handling for:

- read
- write
- edit
- patch
- bash
- grep/search
- glob/file discovery
- MCP
- permissions
- other tools discovered during implementation

For every tool support the real lifecycle where data exists:

```text
started
 ↓
running
 ↓
output/result
 ↓
completed OR failed OR cancelled
```

The UI must not claim a tool succeeded when the backend reports failure.

---

## 10. Permission Integration

Connect the new permission UI to the existing OpenCode permission system.

The UI must correctly represent:

- permission requested
- waiting for user
- allow
- deny
- cancellation/dismissal
- resulting tool state

Do not implement a visual-only permission dialog.

The user's action must reach the actual permission mechanism.

---

## 11. Terminal Integration

Reuse the existing terminal/PTy implementation.

Do not replace the terminal with a mock terminal.

The redesigned terminal UI must preserve:

- terminal creation
- command execution
- streaming output
- multiple sessions/tabs if supported
- resize
- collapse/expand
- close/reopen
- command cancellation
- error output
- connection lifecycle

Keep the existing `ghostty-web` + PTY architecture unless a concrete blocker is found.

---

## 12. File Explorer Integration

The redesigned explorer must remain connected to the existing file APIs/state.

Preserve:

- directory navigation
- expand/collapse
- file selection
- file opening
- active file state
- file watching
- Git decorations
- search/filter behavior
- relevant context menus

A visual file tree with fake/static data is not acceptable.

---

## 13. Editor & Diff Integration

Reuse the existing `@pierre/diffs` implementation where possible.

The new editor/diff experience must remain connected to actual files and agent changes.

Verify:

```text
Agent changes file
 ↓
File state updates
 ↓
Changed-file state
 ↓
Diff available
 ↓
User opens/reviews diff
 ↓
Review action
 ↓
Actual underlying operation
 ↓
UI reflects final state
```

Do not install Monaco or another editor solely for visual similarity unless an actual functional requirement cannot be satisfied by the existing editor implementation.

---

## 14. MCP Integration

Preserve existing MCP functionality.

The new UI must correctly represent:

- MCP server discovery/configuration where existing functionality supports it
- connected/disconnected state
- tool availability
- tool invocation
- loading
- result
- failure
- authentication state where applicable

Nexora should remain a real MCP integration, not a special hardcoded demo.

---

## 15. Git Integration

Preserve the existing Git functionality while redesigning its presentation.

Where applicable maintain:

- repository status
- changed-file indicators
- diffs
- branches
- staging
- commits
- worktree functionality
- repository discovery

The new UI must display actual repository state.

---

## 16. Search & Command Integration

The redesigned search and command palette must remain connected to the existing implementations.

Verify:

- keyboard invocation
- search input
- results
- selection
- navigation
- command execution
- dismissal
- focus restoration

Do not create a decorative command palette with hardcoded commands.

---

## 17. Settings & Model Integration

Preserve existing settings and model/provider configuration.

The redesigned settings UI must remain connected to the real configuration system.

Verify:

- model selection
- provider configuration
- API configuration where applicable
- agent settings
- keybindings
- appearance/theme
- MCP configuration
- persistence

---

# Phase 4C — State, Event & End-to-End Verification

## 18. Event-to-UI Contract

For every important UI state define its source.

Example:

```text
Backend/event source:
session.next.tool.call.started

        ↓

Store/context:
existing server-sync/session state

        ↓

Presentation:
OpenGravity Activity Item

        ↓

Visual state:
Running / spinner / active controls
```

Do not introduce duplicated state unless necessary.

---

## 19. State Matrix

Build an internal implementation matrix covering at least:

| Feature | Trigger | Existing Source | New UI | Success | Failure | Cancel | Verified |
|---|---|---|---|---|---|---|---|
| Agent prompt | user submits prompt | session SDK | agent workspace | ✓ | ✓ | ✓ | |
| Tool execution | agent invokes tool | session events | activity item | ✓ | ✓ | ✓ | |
| Permission | protected action | permission system | approval UI | ✓ | ✓ | ✓ | |
| File edit | edit tool | file/session state | editor/diff | ✓ | ✓ | ✓ | |
| Terminal | terminal action | PTY | terminal panel | ✓ | ✓ | ✓ | |
| MCP | MCP tool call | MCP system | tool activity | ✓ | ✓ | ✓ | |
| Git | repository change | Git layer | Git UI | ✓ | ✓ | — | |
| Search | user search | file/search system | search UI | ✓ | ✓ | cancel | |

Expand this matrix as additional capabilities are discovered.

---

## 20. End-to-End Workflow Tests

After implementation, do not rely on static screenshots.

Execute real workflows.

### Workflow A — Simple Agent Task

```text
Open workspace
 → send prompt
 → agent starts
 → streaming response
 → completion
 → UI returns to idle
```

### Workflow B — File Edit

```text
Prompt
 → agent reads file
 → agent edits file
 → tool activity updates
 → file changes
 → diff becomes available
 → review
 → final state
```

### Workflow C — Shell

```text
Prompt
 → shell tool
 → permission if required
 → terminal/command state
 → streaming output
 → completion/error
```

### Workflow D — MCP

```text
Prompt
 → MCP tool selected
 → MCP call starts
 → activity state
 → result
 → agent continues
 → completion
```

### Workflow E — Failure

```text
Prompt
 → tool failure
 → error UI
 → retry/cancel
 → recovery
 → final state
```

### Workflow F — Multi-step Task

```text
Prompt
 → planning
 → multiple tools
 → intermediate states
 → file changes
 → verification
 → completion
```

---

## 21. Visual Regression Verification

For major screens compare OpenGravity against the provided Antigravity evidence.

Compare:

- overall composition
- panel dimensions
- spacing
- alignment
- typography
- icons
- colors
- borders
- shadows
- density
- empty states
- active states
- loading states
- error states
- animations

For animations compare consecutive reference frames rather than a single screenshot.

Do not optimize only for one static frame if doing so breaks responsive behavior or functionality.

---

## 22. Functional Regression Protection

Before considering Phase 4 complete, verify that the redesign has not broken existing OpenCode functionality.

At minimum test:

- app startup
- workspace opening
- session creation
- prompt submission
- model selection
- agent streaming
- tool execution
- permissions
- file operations
- diff
- terminal
- MCP
- Git
- search
- settings
- session switching
- application restart/state restoration where supported

---

# 23. Architecture Modification Rules

### Safe to modify

- `packages/desktop` presentation/branding/window UX
- `packages/app` layouts/components/state presentation
- `packages/session-ui` visual components
- `packages/ui` reusable visual primitives
- new OpenGravity-specific UI components

### Prefer reuse

- `packages/core`
- `packages/server`
- `packages/sdk`
- `packages/schema`
- `packages/protocol`
- existing MCP infrastructure
- existing PTY infrastructure
- existing Git infrastructure
- existing file system infrastructure

### Core/backend changes

Do **not** modify core/backend behavior simply to make the UI easier to implement.

A backend/core change is allowed only when:

1. the requirement is proven by the reference/functional specification,
2. existing APIs/events genuinely cannot represent it,
3. the smallest possible change is identified,
4. compatibility/regression impact is checked,
5. the change is documented.

---

# 24. New Component Organization

Prefer an isolated OpenGravity namespace for new presentation logic, for example:

```text
packages/app/src/components/opengravity/
```

Potential components:

```text
agent-activity-timeline.tsx
task-progress-card.tsx
workspace-sidebar.tsx
review-diff-sheet.tsx
agent-status.tsx
tool-activity-item.tsx
permission-request.tsx
workspace-panel.tsx
```

Names should be adjusted to match the actual architecture after inspection.

Do not create components that duplicate existing OpenCode components without a reason.

---

# 25. Implementation Order

Use this order to reduce risk:

```text
1. Audit existing components/state
2. Establish OpenGravity visual tokens
3. Reconstruct application shell
4. Reconstruct workspace layout
5. Reconstruct navigation/sidebar
6. Reconstruct agent workspace
7. Reconstruct activity timeline
8. Wire real session/event state
9. Integrate tool lifecycle
10. Integrate permissions
11. Integrate file explorer
12. Integrate editor/diff
13. Integrate terminal
14. Integrate MCP
15. Integrate Git/search/settings
16. Implement micro-interactions
17. Run functional workflows
18. Run visual verification
19. Fix regressions
20. Build Windows desktop package
```

Do not jump directly to visual polish while fundamental state wiring is broken.

---

# 26. Definition of Done

Phase 4 is complete only when all three conditions are satisfied:

## A. Visual

The major OpenGravity screens and interactions reproduce the intended Antigravity-inspired visual behavior closely enough that the differences are intentional rather than accidental.

## B. Functional

Existing OpenCode functionality continues to work through the new UI.

## C. Reactive

UI state reflects real backend/session/tool events rather than simulated state.

Final acceptance model:

```text
Looks right        ✓
Works correctly    ✓
Updates correctly  ✓
Recovers correctly ✓
```

All four are required.

---

# 27. Final Implementation Report

After implementation, produce a concise report containing:

1. Files modified
2. New components created
3. Existing OpenCode components reused
4. Existing event/state sources reused
5. Features successfully integrated
6. Features that required special handling
7. Any core/backend modifications and why they were unavoidable
8. Visual verification performed
9. End-to-end workflows tested
10. Remaining visual/functional gaps

Every gap must be clearly classified:

- **IMPLEMENTED**
- **PARTIALLY IMPLEMENTED**
- **BLOCKED**
- **NOT VERIFIED**

Do not claim visual or functional parity without actually testing it.

---

# Non-Negotiable Rules

1. **Do not turn OpenGravity into a static UI mockup.**
2. **Do not break existing OpenCode functionality for visual similarity.**
3. **Do not duplicate backend logic unnecessarily.**
4. **Do not fake agent/tool states when real events are available.**
5. **Do not blindly trust approximate dimensions/colors/timings from documentation.**
6. **Use the supplied frames as visual ground truth.**
7. **Use consecutive frames for animation analysis.**
8. **Treat the 7,000+ frame directory as an on-demand dataset, not something to bulk-load.**
9. **Reuse existing OpenCode architecture wherever possible.**
10. **Only modify core/backend code when there is a demonstrated technical necessity.**
11. **Test real workflows after UI integration.**
12. **A feature is incomplete if its UI works visually but its underlying functionality is disconnected.**
13. **Do not stop at the happy path. Test success, failure, loading, cancellation and recovery where safely possible.**
14. **Do not implement undocumented behavior based solely on assumptions.**
15. **When uncertain, inspect the source, inspect the relevant reference frames, and verify through a real workflow.**

---

# Phase 4 Mission

Build OpenGravity as:

> **OpenCode's proven agent/coding engine presented through a deeply integrated, Antigravity-inspired, agent-first Windows IDE experience.**

The objective is not to make OpenCode *look* like Antigravity.

The objective is to make OpenCode's existing capabilities **behave naturally inside the new OpenGravity UI** while reproducing the important observable interaction patterns discovered during reconnaissance.
