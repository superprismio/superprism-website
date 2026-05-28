---
title: "Refactory As A Human-Governed Maintenance Control Plane"
subtitle: "The DAOhaus case study"
slug: "refactory-daohaus"
date: "2026-05-28"
type: "case-study"
status: "published"
summary: "A field report on using Superprism Refactory as a human-governed AI maintenance workflow for DAOhaus."
tags:
  - Refactory
  - DAOhaus
  - AI maintenance
  - Human-in-the-loop
client: "DAOhaus"
product: "Refactory"
featured: true
image: "/images/articles/refactory-daohaus.png"
imageAlt: "Abstract prismatic maintenance workflow landscape for the DAOhaus Refactory case study"
---

Most AI workflow demos happen in clean rooms.

Live software maintenance is different. Requests arrive through chat. Context is scattered across docs, repositories, deployment systems, contributor memory, and old decisions. Operators need to know what is happening now, what happened before, what information is stable enough to trust, and where human approval is required.

DAOhaus gave Refactory that kind of environment.

DAOhaus is community-owned infrastructure for DAOs, builders, and public-goods coordination. Its protocol and product surface had years of useful history, which also meant years of accumulated maintenance context across code, docs, Discord, infrastructure, dependencies, and contributor knowledge.

As part of a Raid Guild maintenance engagement, Superprism Refactory was deployed to support DAOhaus with a human-governed AI maintenance workflow. The goal was not to replace maintainers. The goal was to make request state, context, agent assistance, review, memory, and knowledge visible inside one operator workflow.

## The Problem: AI Needs Shared Context

AI agents can help with maintenance work, but only when they have enough context to act usefully and enough boundaries to act safely.

In a mature software environment, the hard questions are usually operational:

- Where does a request enter the system?
- Which repo, docs, and prior decisions are relevant?
- What is the current task state?
- What can an agent investigate or prepare?
- What should become durable memory?
- What belongs in curated knowledge?
- Where must a human approve the next step?

Without answers to those questions, AI assistance becomes another disconnected tool. It may generate useful work in a moment, but it does not create a durable operating layer for the team.

Refactory is built for that layer.

## The Refactory Pattern

Refactory is a collaborative AI maintenance control plane. It coordinates human operators, requests, tasks, agents, project knowledge, repository workflows, and review gates.

For DAOhaus, that meant connecting several kinds of context:

- **Intake:** requests and maintenance signals entering from community or operator channels.
- **Workflow state:** requests, tasks, artifacts, review status, and agent session context.
- **Agent assistance:** bounded support for triage, investigation, branch preparation, implementation help, and reporting.
- **Memory:** operational history, transcripts, runtime outputs, artifacts, and previous activity.
- **Knowledge:** curated reference material such as architecture notes, SOPs, runbooks, and stable maintainer guidance.
- **Review and approval:** human gates for meaningful status changes and production-affecting decisions.

The design principle is simple: agents should help operators move faster, but the workflow should keep human judgment visible.

The agent handles groundwork. Humans handle decisions.

## Memory And Knowledge Need Different Lanes

One of the most important lessons from the DAOhaus environment was the need to separate memory from knowledge.

Memory records what happened. It can include discussions, transcripts, task activity, runtime outputs, artifacts, and operational history. It is useful because it preserves the trail of work and decisions.

Knowledge records how the system works. It should be more stable, curated, and reusable: architecture docs, runbooks, SOPs, maintainer guidance, and reference material that future operators and agents can trust.

Collapsing those together creates context noise. Treating them as separate lanes gives operators a cleaner way to promote raw activity into durable guidance.

For DAOhaus, that distinction mattered because maintenance context existed in many forms: old decisions, current docs, active repo patterns, support surfaces, and handoff materials. Refactory gave those materials a clearer place in the operator workflow.

## Human Approval Is Infrastructure

For live software systems, human-in-the-loop is not a disclaimer. It is part of the architecture.

DAOhaus needed AI-assisted maintenance without handing production control to an unbounded agent. Refactory supported that by making agent assistance visible inside a governed workflow.

Agents can help with groundwork:

- Triage and initial investigation.
- Context retrieval.
- Issue and task preparation.
- Branch or implementation support.
- Artifact creation.
- Reporting back to maintainers.

Humans remain responsible for decisions:

- Approving work to proceed.
- Reviewing branches and pull requests.
- Handling incidents.
- Managing access or secrets.
- Approving production-affecting changes.
- Deciding what should become stable knowledge.

This is the difference between automation as a black box and automation as an operator workflow.

## What DAOhaus Proved

DAOhaus showed why collaborative AI infrastructure has to meet the shape of real maintenance work.

The Refactory deployment sat alongside a broader maintenance readiness effort: the active Admin App was clarified, documentation was strengthened, public and maintainer-facing surfaces were reviewed, and transition materials were created for future stewards.

That groundwork made the AI layer more useful. Refactory could support a clearer operating model instead of trying to compensate for a confusing one.

The case also showed where Refactory fits best:

- Teams with live software and real users.
- Communities where work arrives through chat and support channels.
- Projects with important knowledge spread across docs, repos, and contributors.
- Operators who want AI assistance but need review, approval, and traceability.
- Protocols preparing for maintainer transition or ongoing support.

The strongest pattern is not "autonomous maintenance." It is shared context plus governed assistance.

## What This Makes Possible

Refactory helps communities turn scattered maintenance activity into an owned, adaptable operating layer.

Instead of treating AI as a sidecar to individual productivity, Refactory organizes the surrounding workflow: intake, task state, context retrieval, memory, knowledge, agent sessions, artifacts, review, and approval.

That makes several things possible:

- A maintainer can see the state of work instead of reconstructing it from chat.
- An agent can work from curated context instead of guessing from stale fragments.
- A team can preserve operational history as memory.
- Stable docs and runbooks can become reusable knowledge.
- Human approval can stay explicit around risky operations.
- Future operators can inherit more than a codebase; they can inherit an operating context.

For DAOhaus, that meant Refactory became part of a practical path toward progressive automation: not blind autonomy, but human-governed AI support for real protocol maintenance.

## The Takeaway

AI-assisted maintenance is not only an agent problem. It is a coordination problem.

DAOhaus gave Refactory a live environment where requests, docs, repositories, operational history, maintainer workflows, and human review all mattered at once. That is exactly where collaborative AI infrastructure becomes useful.

Refactory helps make that work visible: what needs attention, what context matters, what the agent did, what humans approved, and what knowledge should survive into the next maintenance cycle.

For communities and teams maintaining important software, that is the foundation for trustworthy AI-assisted operations.

Explore Refactory: [https://refactory.superprism.io/](https://refactory.superprism.io/)

Need help turning a mature protocol surface into an AI-assisted maintenance environment? Start a raid with Raid Guild: [https://www.raidguild.org/#hire-us](https://www.raidguild.org/#hire-us)
