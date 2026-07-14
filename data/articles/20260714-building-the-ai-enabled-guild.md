---
title: "Building the AI-Enabled Guild"
subtitle: "How Raid Guild uses Refactory as an operating system"
slug: "building-the-ai-enabled-guild"
date: "2026-07-14"
type: "research-report"
status: "published"
summary: "A field report on how Raid Guild uses Superprism Refactory as shared operating infrastructure for memory, knowledge, governed workflows, specialized agents, and human review."
tags:
  - Refactory
  - Raid Guild
  - AI Operations
  - Research
featured: true
image: "/images/articles/building-the-ai-enabled-guild.png"
imageAlt: "Transparent glass prism splitting spectral workflow beams over a dark networked terrain"
---

Raid Guild does not have a shortage of intelligence.

The guild is a distributed network of builders, designers, strategists, and operators. Every week, its members produce useful context across Discord conversations, community meetings, client work, repositories, websites, analytics platforms, and onchain activity.

The problem is that no individual can hold all of it.

Important ideas can disappear into chat history. A strong Fireside discussion may be useful to the people in the room, then become difficult to find or reuse. Documentation lives in repositories, current priorities live in conversations, and operational follow-ups depend on someone remembering what needs to happen next.

Adding another AI chat window would not solve that problem. An assistant working from a single prompt is still separated from the wider life of the guild.

Raid Guild needed something closer to an operating system: a shared layer that could connect its activity, preserve context, coordinate work, and support specialized agents without removing human judgment.

That is the role Refactory is beginning to play.

## More Than a Bot in Discord

Superprism Refactory is open-source, self-hostable infrastructure for collaborative AI. Raid Guild's implementation uses it as a bridge between the places where the guild communicates, the systems where it works, and the agents that help move that work forward.

Discord is one of the most visible interfaces. PrismBOT can meet guild members where they already coordinate, while policy-controlled ingestion tasks bring selected conversations and threads into the wider context system. Questions, requests, reminders, and workflow results can travel through the same community surface.

But Discord is the entry point, not the product boundary.

Beneath the bot is a system for shared memory, curated knowledge, requests, tasks, agent skills, connected tools, and human approval. It can draw context from meetings, GitHub repositories, custom applications, analytics, and Raid Guild-specific data such as onchain activity.

These pieces matter because an agent is only as useful as the context and operating boundaries around it. Refactory gives Raid Guild a way to provide both.

## Helping the Guild Remember

One of Refactory's most important design choices is the distinction between memory and knowledge.

Memory describes what happened and what is happening now. It includes recent Discord activity, meeting transcripts, summaries, operational outputs, and other time-sensitive signals. Scheduled processes can turn that activity into rolling memory and current summaries, giving agents a usable view of the guild's latest context without forcing them to replay an entire archive on every run.

Knowledge serves a different purpose. It includes more durable sources: repository documentation, procedures, reference material, and information that has been organized to remain useful over time. GitHub repositories and other content sources can be synchronized and indexed so agents can retrieve the relevant material when a task requires it.

The distinction prevents a passing comment from becoming organizational truth.

Memory can preserve a discussion, decision, or emerging pattern. When something deserves to become stable guidance, it can be reviewed and promoted into the knowledge layer. One provides continuity; the other provides a more trusted reference surface.

Raid Guild is also extending this context model beyond conventional documents. Custom ingestion can bring in signals such as onchain guild activity, allowing agents to work from a view of the organization shaped by its actual operations rather than only its written content.

Retrieval is part of the system, but continuity is the larger goal. Refactory helps Raid Guild know both what it has learned and what is happening now.

## Turning Shared Context Into Work

Context becomes valuable when it can support action.

Raid Guild operates multiple websites and web applications. Refactory provides a shared request layer for coordinating changes across five of these properties. Instead of leaving a request inside an isolated conversation, the system can retain its target, supporting context, current workflow state, agent activity, artifacts, and review history.

Agents can assist with triage, investigation, implementation, verification, and pull-request preparation. Humans continue to review meaningful changes and control production-affecting decisions.

This makes the request, not the agent chat, the durable unit of work.

The same pattern applies outside software delivery. A guild meeting can become the beginning of a content workflow rather than an event that ends when the call does.

Consider a Raid Guild Fireside:

1. The session is recorded and transcribed.
2. Refactory produces a summary and reusable artifacts.
3. A content workflow identifies useful stories and themes.
4. Hivemind skills apply Raid Guild-specific voice and copy guidance.
5. The system prepares an article for the custom Raid Guild Portal.
6. Supporting social posts are drafted for relevant channels.
7. A Remotion integration can turn selected material into video assets.
8. People review and approve the public-facing outputs.

One conversation can become several coordinated artifacts, with the source, transformations, and approvals kept visible. The point is not simply to generate more content. It is to build a repeatable path from valuable guild activity to reviewed, channel-appropriate communication.

## Agents With Operational Roles

As the context and workflow layers become stronger, agents can take on more specialized roles.

Raid Guild's Social Media Manager agent is designed to support the full publishing operation, not just write isolated posts. It can maintain the content calendar, identify gaps, remind team members when source material is needed, prepare drafts using guild context and Hivemind skills, and move approved content toward publication.

The agent provides continuity. People retain voice, judgment, and publication authority.

The Marketing Data Analyst plays a different role. Using a dedicated skill for Plausible, it can produce weekly comparisons, identify meaningful changes, and connect performance signals to active campaigns or content.

More importantly, it can recognize when the data itself is incomplete.

If a conversion event or tracking tag is missing, the analyst can create a governed change request for the relevant web property. That request enters the same software workflow used for other changes, where implementation and review remain visible to human operators.

This creates a practical form of self-improvement. The analyst does not silently modify production or approve its own recommendation. It identifies a blind spot, proposes a fix through the normal operating system, and helps improve the data available to future analysis.

## The Reinforcing Loop

Each of these capabilities is useful on its own. Their real value appears when they begin reinforcing one another.

A Fireside becomes a transcript and summary. The content workflow turns it into an article and supporting media. The Social Media Manager schedules approved promotion. The Marketing Data Analyst measures the result and discovers that an important conversion event is missing. Refactory creates a change request for the correct website. A software workflow implements the tracking improvement with human review. Better data improves the next analysis, and the resulting activity becomes part of the guild's operational memory.

This is the difference between collecting AI tools and building an agent-enabled operating system.

The agents share more than a platform. They share context, defined roles, connected tools, visible workflows, and a common way to hand work back to people. An output from one process can become a governed input to the next.

Over time, the system can compound the guild's intelligence rather than repeatedly starting from an empty prompt.

## Human Governance Is Part of the Architecture

Raid Guild's model is not autonomous operations. It is agent-enabled operations with human checkpoints.

That distinction shapes the implementation:

- Source policies control which community activity enters the system.
- Skills and integrations scope what an agent can access and do.
- Requests and run histories make work visible.
- Public content moves through editorial review.
- Software changes follow normal implementation and review paths.
- People remain responsible for objectives, ambiguity, public voice, and consequential decisions.

Human review is not a fallback added after the automation. It is part of the workflow design.

This allows agents to take responsibility for groundwork and continuity: collecting context, identifying gaps, preparing drafts, coordinating next steps, and producing analysis, without confusing assistance with authority.

## A Guild That Compounds Its Intelligence

Refactory gives Raid Guild a way to connect activities that would otherwise remain separate.

Discord conversations can inform memory. Meetings can become durable artifacts. Repositories can provide trusted technical knowledge. Content workflows can carry ideas into multiple formats. Social and analytics agents can coordinate recurring operations. Measurement gaps can become software requests. Reviewed work can return to the context system and improve what happens next.

This does not produce one omniscient agent that runs the guild. It creates an environment where specialized agents and guild members can work from more of the same context, through clearer processes, with visible boundaries.

That is a more practical model for organizational AI.

The future may look less like one assistant replacing a team and more like an operating system that helps the whole team remember, coordinate, and improve.

For Raid Guild, Refactory is becoming that shared operating layer: connected to the life of the guild, adaptable to its workflows, and governed by the people it is built to support.

Explore Refactory: [refactory.superprism.io](https://refactory.superprism.io/)

Bring Raid Guild your operational bottleneck: [raidguild.ai/contact](https://www.raidguild.ai/contact)
