<!--
Codex CLI only discovers custom prompts under ~/.codex/prompts (per-user, global —
it does NOT read project-local prompt folders). To use this in Codex CLI, each
teammate must copy or symlink this file once:

  cp .codex/prompts/spec-driven.md ~/.codex/prompts/spec-driven.md

After that, invoke it in Codex CLI as /spec-driven. This file is kept in the repo so
the prompt travels with the project and stays in sync with .claude/skills/spec-driven
and .gemini/commands/spec-driven.toml — copy it again after pulling updates.

The canonical/maintained copy of this skill lives at
.claude/skills/spec-driven/SKILL.md — update that one first, then mirror changes here
and in .gemini/commands/spec-driven.toml.
-->

# Spec-Driven Development

Plan and implement with precision. Granular tasks. Clear dependencies. Right tools. Zero ceremony.

## Pipeline Stages

SPECIFY (required) → DESIGN (optional) → TASKS (optional) → EXECUTE (required)

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
├── <part>/.spec/                 # One per project part (e.g. frontend, backend-api)
│   ├── STACK.md
│   ├── ARCHITECTURE.md
│   ├── CONVENTIONS.md
│   ├── STRUCTURE.md
│   ├── TESTING.md
│   ├── INTEGRATIONS.md
│   └── CONCERNS.md
│
├── features/                     # Feature specifications
│   ├── [feature]/                # Active or planned feature
│   │   ├── spec.md               # Requirements with traceable IDs
│   │   ├── context.md            # Gray area decisions (only when discuss triggered)
│   │   ├── design.md             # Architecture & components (Large/Complex only)
│   │   └── tasks.md              # Atomic tasks with verification (Large/Complex only)
│   ├── DONE - [feature]/         # Completed — rename when all acceptance criteria pass
│   └── REVISE - [feature]/       # Uncertain — needs status review before closing or continuing
│
└── quick/                        # Ad-hoc tasks (quick mode)
    └── NNN-slug/
        ├── TASK.md
        └── SUMMARY.md
```

> Load the relevant `.spec` folder based on which part you're working on.

---

## Workflow

### New Project

1. Initialize project docs → PROJECT.md + ROADMAP.md + GOALS.md + DECISIONS.md + GENERAL_TODOS.md
2. For each part → create `.spec/` folder with 7 codebase docs
3. For each feature → Specify → (Design) → (Tasks) → Execute

### Existing Codebase

1. Initialize project docs FIRST → same 5 docs
2. Map each codebase part → 7 brownfield docs in their respective `.spec/` folders
3. For each feature → same adaptive workflow

### Quick Mode

For ≤3 files, one-sentence scope: `Describe → Implement → Verify → Commit`

---

## Context Loading Strategy

Load PROJECT.md, ROADMAP.md, STATE.md as a base. Load part-specific `.spec/` docs,
CONCERNS.md, TESTING.md, and feature spec/context/design/tasks docs on demand — never
load multiple feature specs or multiple architecture docs simultaneously.

---

## Knowledge Verification Chain

When researching, designing, or making any technical decision — follow in strict order:

1. Codebase → check existing code, conventions, patterns already in use
2. Project docs → README, docs/, inline comments, .specs/project/
3. Available doc-lookup tools (if any) → current API/patterns
4. Web search → official docs, reputable sources, community patterns
5. Flag as uncertain → "I'm not certain about X — here's my reasoning, but verify"

Never skip to step 5 if 1-4 are available. Never assume or fabricate an API — flag
uncertainty explicitly instead.

---

## STATE.md Health

Keep STATE.md lean and current. Only cross-cutting decisions belong in its Decisions
section. On every feature archive: move the folder to `DONE - <feature>/`, remove or
condense its Decisions entry, and move completed todos out of the Todos section.

---

Requested action / args: {{ARGS}}
