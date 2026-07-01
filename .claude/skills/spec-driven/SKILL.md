---
name: spec-driven
description: Spec-Driven Development workflow — plan and implement projects with precision using adaptive SPECIFY → DESIGN → TASKS → EXECUTE pipeline
---

# Spec-Driven Development

Plan and implement with precision. Granular tasks. Clear dependencies. Right tools. Zero ceremony.

## Pipeline Stages

│ SPECIFY (required) → DESIGN (optional) → TASKS (optional) → EXECUTE (required) │

## Auto-Sizing: The Core Principle

The complexity determines the depth, not a fixed pipeline.

| Scope       | When to Use              | Specify             | Design                    | Tasks                     | Execute         |
| ----------- | ------------------------ | ------------------- | ------------------------- | ------------------------- | --------------- |
| **Small**   | ≤3 files, one sentence   | Skip                | -                         | -                         | Implement       |
| **Medium**  | Clear feature, <10 tasks | Brief spec          | Inline                    | Implicit                  | Verify          |
| **Large**   | Multi-component feature  | Full spec + IDs     | Architecture + components | Full breakdown            | Per task        |
| **Complex** | Ambiguity, new domain    | Full spec + discuss | Research + architecture   | Breakdown + parallel plan | Interactive UAT |

### Rules

- **Specify & Execute** — always required (know WHAT + DO it)
- **Design** — skipped when change is straightforward (no architectural decisions)
- **Tasks** — skipped when ≤3 obvious steps (become implicit in Execute)
- **Discuss** — triggered in Specify only when gray areas need user input
- **Interactive UAT** — triggered in Execute only for user-facing features with complex behavior
- **Quick mode** — express lane for bug fixes, config changes, small tweaks

### Safety Valve

Even when Tasks is skipped, Execute ALWAYS starts by listing atomic steps inline. If listing reveals **>5 steps or complex dependencies → STOP and create formal tasks.md** (Tasks phase was wrongly skipped).

---

## Project Structure

For each project part (monolith, frontend, backend-api), create a `.spec` folder with codebase documentation:

```
.specs/
├── project/                      # Meta project docs (always root level)
│   ├── PROJECT.md                # Vision & goals
│   ├── ROADMAP.md                # Features & milestones
│   ├── STATE.md                  # Memory: decisions, blockers, lessons, todos
│   ├── GOALS.md                  # Current objectives
│   ├── DECISIONS.md              # Architectural decisions log
│   └── GENERAL_TODOS.md          # Cross-cutting tasks
│
├── monolith/                     # Each part has its own .spec/
│   └── .spec/
│       ├── STACK.md
│       ├── ARCHITECTURE.md
│       ├── CONVENTIONS.md
│       ├── STRUCTURE.md
│       ├── TESTING.md
│       ├── INTEGRATIONS.md
│       └── CONCERNS.md
│
├── frontend/
│   └── .spec/                    # (same 7 docs)
│
├── backend-api/
│   └── .spec/                    # (same 7 docs)
│
├── features/                     # Feature specifications
│   ├── [feature]/                # Active or planned feature
│   │   ├── spec.md               # Requirements with traceable IDs
│   │   ├── context.md            # Gray area decisions (only when discuss triggered)
│   │   ├── design.md             # Architecture & components (Large/Complex only)
│   │   └── tasks.md              # Atomic tasks with verification (Large/Complex only)
│   ├── DONE - [feature]/          # Completed — rename when all acceptance criteria pass
│   └── REVISE - [feature]/        # Uncertain — needs status review before closing or continuing
│
└── quick/                        # Ad-hoc tasks (quick mode)
    └── NNN-slug/
        ├── TASK.md
        └── SUMMARY.md
```

> **Load the relevant `.spec` folder based on which part you're working on** (monolith, frontend, or backend-api).

---

## Workflow

### New Project

1. Initialize project docs → PROJECT.md + ROADMAP.md + GOALS.md + DECISIONS.md + GENERAL_TODOS.md
2. For each part (monolith, frontend, backend-api) → create `.spec/` folder with 7 codebase docs
3. For each feature → Specify → (Design) → (Tasks) → Execute

### Existing Codebase

1. **Initialize project docs FIRST** → same 5 docs
2. Map each codebase part → 7 brownfield docs in their respective `.spec/` folders
3. For each feature → same adaptive workflow

### Quick Mode

For ≤3 files, one-sentence scope: `Describe → Implement → Verify → Commit`

---

## Context Loading Strategy

**Base load** (~15k tokens):

- PROJECT.md (if exists)
- ROADMAP.md (when planning/working on features)
- STATE.md (persistent memory)

**On-demand load**:

- Project docs (when starting work or planning)
- Codebase docs from relevant `.spec/` folder (match the part you're working on)
- CONCERNS.md (when touching flagged areas, estimating risk, modifying fragile components)
- TESTING.md (when creating tasks or executing)
- spec.md (when working on specific feature)
- context.md (when designing or implementing from user decisions)
- design.md (when implementing from design)
- tasks.md (when executing tasks)

**Target:** <40k tokens total context → Reserve 160k+ for work, reasoning, outputs

> **Never load simultaneously:** Multiple feature specs, multiple architecture docs, or archived documents.

---

## Sub-Agent Delegation

Use sub-agents to keep main context lean and enable parallel execution. Orchestrating agent plans and coordinates; sub-agents do the heavy lifting.

### When to Delegate

| Activity                                    | Delegate?          | Why                                                                 |
| ------------------------------------------- | ------------------ | ------------------------------------------------------------------- |
| Research (design phase, brownfield mapping) | Yes                | Output is large; only summary matters to main context               |
| Implementing a task                         | Yes                | File reads, edits, test output consume context; only result matters |
| Parallel [P] tasks                          | Yes (one per task) | Only way to actually run in parallel                                |
| Sequential tasks with no [P]                | Yes                | Keeps implementation artifacts out of main context                  |
| Planning, task creation, validation reports | No                 | Require full accumulated context to be coherent                     |
| Quick mode tasks                            | No                 | Too small to justify overhead                                       |

### What Sub-Agents Receive

The orchestrating agent MUST provide:

- Task definition from tasks.md (What, Where, Depends on, Reuses, Done when, Tests, Gate)
- Relevant coding conventions (coding-principles.md, CONVENTIONS.md)
- TESTING.md (for gate check commands and test patterns)
- Any spec/design context the task references

Sub-agents do NOT receive: other tasks' definitions, accumulated chat history, validation reports from other tasks, or STATE.md (unless task explicitly references a decision/blocker).

### What Sub-Agents Return

- Status: `Complete | Blocked | Partial`
- Files changed: [list]
- Gate check result: [pass/fail + test counts]
- SPEC_DEVIATION markers (if any)
- Issues encountered (if any)

Orchestrating agent uses this to update tasks.md status, traceability, and decide next steps.

---

## Knowledge Verification Chain

When researching, designing, or making any technical decision — follow in strict order:

1. **Codebase** → check existing code, conventions, patterns already in use
2. **Project docs** → README, docs/, inline comments, .specs/project/
3. **Context7 MCP** → resolve library ID, then query for current API/patterns
4. **Web search** → official docs, reputable sources, community patterns
5. **Flag as uncertain** → "I'm not certain about X — here's my reasoning, but verify"

**Rules:**

- Never skip to Step 5 if Steps 1-4 are available
- Step 5 is ALWAYS flagged as uncertain — never presented as fact
- **Never assume or fabricate.** If you cannot find an answer, say "I don't know" or "I couldn't find documentation." Inventing APIs causes cascading failures across design → tasks → implementation.

---

## Commands

### Testing Strategy

- Use **simple tests first** (non-verbose mode)
- If tests fail → **run verbose mode** to diagnose
- Never jump to verbose on first run

### Task Completion

When finishing a todo → **always check the .md file task** to verify completion and update STATE.md

### STATE.md Health

STATE.md is a live document — keep it lean and current.

**Decisions section rules:**
- Only cross-cutting decisions that affect future code belong here.
- When a feature is archived to `DONE - <feature>/`: **remove its Decisions entry**. The archive spec is the right home for feature-level detail.
- Exception: keep a ≤1 line note if the feature introduced a lasting pattern others will hit (e.g. a security boundary, a shared composable, a quirk in a shared API). No spec pointer needed.
- Never use Decisions as a feature completion log.

**On every feature archive:**
1. Move the feature folder to `DONE - <feature>/`
2. Remove or condense its STATE.md Decisions entry
3. Move completed todos out of the Todos section

### Project-Level

| Trigger Pattern                        | Reference             |
| -------------------------------------- | ---------------------- |
| Initialize project, setup project      | project-init.md       |
| Create roadmap, plan features          | roadmap.md            |
| Map codebase, analyze existing code    | brownfield-mapping.md |
| Document concerns, find tech debt      | concerns.md           |
| Record decision, log blocker, add todo | state-management.md   |
| Pause work, end session                | session-handoff.md    |
| Resume work, continue                  | session-handoff.md    |

### Feature-Level (auto-sized)

| Trigger Pattern                              | Reference     |
| --------------------------------------------- | ------------- |
| Specify feature, define requirements         | specify.md    |
| Discuss feature, capture context              | discuss.md    |
| Design feature, architecture                  | design.md     |
| Break into tasks, create tasks                | tasks.md      |
| Implement task, build, execute                | implement.md  |
| Validate, verify, test, UAT                   | validate.md   |
| Quick fix, quick task, small change, bug fix  | quick-mode.md |

---

## Skill Integrations

This skill coexists with other skills. Prefer complementary skills when available.

**Diagrams → mermaid-studio**
When workflow requires creating diagrams (architecture overviews, data flows, component diagrams, sequence diagrams), check if mermaid-studio skill is installed. If yes, delegate to it. If no, use inline mermaid code blocks and recommend installing mermaid-studio for richer capabilities. Display recommendation at most once per session.

**Code Exploration → codenavi**
When workflow requires exploring or discovering things in existing repository (brownfield mapping, code reuse analysis, pattern identification, dependency tracing), check if codenavi skill is installed. If yes, delegate to it. If no, fall back to built-in code analysis tools and recommend installing codenavi. Display recommendation at most once per session.

---

## Output Behavior

Model guidance: After completing lightweight tasks (validation, state updates, session handoff), naturally mention that such tasks work well with faster/cheaper models. Track in STATE.md under Preferences to avoid repeating. For heavy tasks (brownfield mapping, complex design), briefly note reasoning requirements before starting.

Be conversational, not robotic. Don't interrupt workflow — add as a natural closing note. Skip if user seems experienced or has already acknowledged the tip.
