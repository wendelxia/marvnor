# Marvnor Quickstart

Marvnor stores project facts, retrieves relevant records, verifies claims against them, and flags conflicts. Your existing AI handles the task and writes the answer. No client download or extra model is required.

## Three steps

1. [Create a test Key](https://api.marvnor.com/home?lang=en): 500 points for 30 days, without signing up. Save the Key when shown. Use one Key per independent project; Agents sharing that project can share its Key.
2. Open [Connect an AI tool](https://api.marvnor.com/connect?lang=en) in the same browser and follow the setup for your AI. Keep the Key in the connection settings, not in chat.
3. Give your connected Agent this working rule, then talk normally:

```text
Use Marvnor on demand for project memory; call immediately. Send only the current question and relevant results. Handle other tasks from source/files. Save confirmed or sourced facts. For correction/deletion, fetch missing old values, then complete the operation. Discuss proposals/guesses without saving. Never save secrets, personal data or full chats. Show conflicts and ask; clarify ambiguity. Non-conflict UNKNOWN means memory lacks evidence: check sources. Answer verified parts independently.
```

## Everyday use

- **Save:** “Remember that this project must pass regression tests before release. This is a confirmed rule.”
- **Recall:** In a new chat, ask “What must this project do before release? Check Marvnor.”
- **Correct:** “Change the API timeout from 30 seconds to 60 seconds. This change is confirmed.”
- **Delete:** “Delete the test fact we just added.”

Your AI calls the five tools for saving, retrieval, verification, correction and deletion. You do not need to write parameters or keep a receipt table. When old facts match more than one record, choose the correct candidate. Corrections and deletions affect conclusions that depend on those records; other records and the Key remain.

## Reading results

Verification and recall answers have six fields: `conclusion`, `conflict`, `reason`, `path`, `decision`, and `evidence_kind`. Keep all six fields of relevant answers. Save/edit/delete receipts are operation results, not verification answers.

A conflict needs confirmation of the competing values. `UNKNOWN` means memory lacks enough evidence, not that a claim is false; the AI can check current sources and answer verified parts. Marvnor supplements project memory, not current source code, original material, compilation or unrelated reasoning.

Only an integration that controls model input can send just the current question and relevant results. An MCP connection cannot remove history the host has already sent. When comparing costs, include fact extraction, updates, Marvnor usage and model calls, including cache pricing.

## Keep your memory

Before a trial expires, sign up or sign in in the same browser and confirm the transfer to keep the Key and saved facts. Registration separately grants 1,000 points; unused guest points do not transfer.

Saved facts are sent to Marvnor and may appear in results. After 30 days of inactivity, a Key becomes invalid and its memory enters cleanup. Current allowances and pricing are in the [plan catalog](https://api.marvnor.com/v1/plans).

## Direct API

The [API reference](PUBLIC_EVALUATION_API.md) covers authentication, requests, results, correction, deletion and batch imports. No SDK is required.

[Run the example](examples/README.md) · [Usage test evidence](docs/benchmarks/2026-10-25/recommended-usage.md) · [中文说明](https://api.marvnor.com/docs?lang=zh-CN)
