# Superprism Homepage Spec

**Positioning**

> **Superprism is an R&D lab for human-agent coordination.**

**Tagline**

> **Infrastructure for Collaborative AI**

**Goal**

Position Superprism as:

- an applied AI research studio
- a pioneer in collaborative AI systems
- a credible partner for research, grants, and organizations

The homepage should feel like:

**Applied AI research + live experiments**

NOT a SaaS landing page.

---

# Visual Direction

Based on the CSS you shared.

## Tone

Clean research interface with subtle sci-fi energy.

Feels like:

- research lab
- AI system dashboard
- experimental workspace

---

## Core Visual Palette

Primary signal colors already defined:

**Primary (Green)**
Used for key CTAs and research highlights.

**Secondary (Purple)**
Used for research/AI system themes.

**Accent**
Subtle UI emphasis.

This naturally creates a visual story:

**Green = active systems / experimentation**
**Purple = AI / networks / coordination**

---

## Typography

**Headlines**

Space Grotesk

- large
- confident
- minimal

**Body**

Space Grotesk

**System text**

Space Mono

Use monospace sparingly for:

- experiment names
- labels
- technical cues

---

## Layout Style

Your CSS radius = **0**

So lean into:

- **hard edges**
- **clean cards**
- **grid layouts**
- **subtle borders**

Example pattern:

```
border border-border
bg-card
p-8
```

Avoid heavy shadows.

Use:

```
shadow-sm
```

sparingly.

---

# Homepage Structure

7 sections total.

1 Hero
2 Problem Space
3 Research Areas
4 Reference Implementation
5 Applied Research
6 Thesis
7 Contact / Partnership

---

# 1 Hero Section

## Layout

Full width
Centered text
Large visual (existing hero imagery)

Use subtle animated element with your:

```
.holographic-shimmer
```

---

## Copy

### Headline

**Superprism**

### Subhead

**Infrastructure for Collaborative AI**

### Description

Superprism is an **R&D lab for human-agent coordination**.

We research and build systems where humans and AI agents generate shared context together — without sacrificing privacy or sovereignty.

### CTA

Primary:

**Explore Our Research**

Secondary:

**Partner With Us**

---

## Tailwind Layout

Example structure:

```
section
max-w-6xl
mx-auto
py-32
px-6
text-center
```

Hero title:

```
text-6xl
font-bold
tracking-tight
```

Tagline:

```
text-xl
text-muted-foreground
mt-6
```

---

# 2 Problem Space

Purpose:

Explain the **core challenge** in a very compact way.

---

## Layout

Two column grid

Left:

headline

Right:

short explanation

---

## Copy

### Heading

**AI tools are built for individuals.**

### Body

But the most complex work happens in **teams**:

• distributed organizations
• research groups
• open source communities
• global companies

These teams struggle to maintain **shared context** across conversations, documents, repositories, and AI agents.

Superprism explores how **humans and AI systems coordinate knowledge together.**

---

# 3 Research Areas

Purpose:

Show intellectual depth.

Cards layout.

---

## Layout

3x2 grid of cards.

Use:

```
bg-card
border border-border
p-6
```

---

## Section Header

**Research Areas**

We explore the systems required for collaborative AI.

---

## Cards

### Collaborative AI Environments

Shared workspaces where humans and agents operate on the same evolving context.

---

### Context Engineering

Techniques for creating, maintaining, and isolating context so AI systems stay useful.

---

### Human-Agent Coordination

Designing systems where agents assist teams without replacing human judgment.

---

### Local-First AI Infrastructure

Architectures that preserve privacy and sovereignty over knowledge.

---

### Agentic Economies

Exploring how AI agents interact with decentralized economic systems.

---

### Knowledge Interfaces

New ways for humans to navigate and shape shared AI context.

---

# 4 Reference Implementation

This section introduces **Superprism as the lab platform**.

---

## Layout

Left:

text

Right:

product screenshot or system diagram.

---

## Copy

### Label

Reference Implementation

### Title

**Superprism**

### Body

Superprism is our primary research artifact — a collaborative AI workspace for distributed teams.

Each capability represents a hypothesis about how humans and agents should coordinate.

---

### Current Experiments

Use mono font list.

```
font-mono text-sm
```

• multi-source knowledge ingestion
• automated daily and weekly digests
• shared context workspaces
• project-specific context isolation
• knowledge graph exploration

---

# 5 Applied Research

Purpose:

Show **real-world experimentation**.

---

## Section Title

**Applied Research**

Our systems are tested with organizations exploring collaborative AI.

---

## Layout

Two large case study cards.

---

## Raid Guild

Short label:

```
Case Study
```

### Title

Raid Guild

### Description

Collaborative AI systems for decentralized teams.

### Focus Areas

• shared DAO knowledge base
• automated ingestion of chats and governance discussions
• AI-assisted sensemaking across distributed contributors

---

## Open Machine

### Title

Open Machine

### Description

AI-native knowledge infrastructure for software development.

### Focus Areas

• Git-centric knowledge bases
• private and public publishing workflows
• AI systems that understand evolving codebases

---

# 6 Why This Matters

Short thesis section.

Visually dramatic.

---

## Layout

Centered.

Large typography.

---

## Copy

### Headline

**The next generation of AI will not be individual.**

It will be **collaborative.**

As AI agents become ubiquitous, the challenge is no longer individual productivity.

The challenge is **shared intelligence**.

How teams create, maintain, and govern context will determine whether AI empowers organizations — or fragments them.

Superprism explores the infrastructure required for **collaborative intelligence.**

---

# 7 Work With Us

Final call to action.

---

## Title

**Work With Us**

Superprism collaborates with organizations exploring new ways of working with AI.

---

### Research Partnerships

Teams experimenting with collaborative AI systems.

### Applied Implementations

Organizations integrating AI into complex coordination workflows.

### Funding & Grants

Support for research into privacy-preserving and decentralized AI infrastructure.

---

### CTA

**Start a Conversation**

Secondary:

**Follow Our Research**

---

# Suggested Subtle UI Elements

These fit nicely with your design system.

---

## 1 Research Labels

Use small mono tags.

Example:

```
font-mono
text-xs
uppercase
tracking-wider
text-muted-foreground
```

---

## 2 Experiment Indicators

Example:

```
● Active Experiment
```

in green.

---

## 3 Holographic Sweep

Use on:

- CTA hover
- experiment cards
- hero image

You already have:

```
.holographic-shimmer
```

---

# Page Flow

The narrative progression becomes:

```
Hero
↓
Problem
↓
Research
↓
Reference Implementation
↓
Applied Research
↓
Thesis
↓
Partner
```

This builds:

**credibility → depth → real work → collaboration**
