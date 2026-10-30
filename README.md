# Marvnor

## Ready-to-use AI memory, connected through MCP

[![M8ven Score](https://m8ven.ai/badge/mcp/wendelxia-marvnor-0jrgh6?v=1caeae5a89756c2dad15a4bd720eaa27)](https://m8ven.ai/mcp/wendelxia-marvnor-0jrgh6?s=readme)

In one sentence: Marvnor is a hosted memory service for your AI. Save facts, then ask questions against those records. Its verdict is `TRUE` (supported), `FALSE` (contradicted), or `UNKNOWN` (not established). When saved values conflict, it flags them. Marvnor checks what the supplied records support; it does not invent missing evidence.

## What it does

- **Saves facts as records:** source, relation and target. For example, “Project X / uses database / Postgres”.
- **Checks questions against those records.** `UNKNOWN` is a valid answer: when records do not cover a question, it says so instead of guessing.
- **Flags conflicting values.** When two saved values conflict, it surfaces both rather than silently choosing one.
- **Lets you correct or delete records.** Fix a saved fact in place or remove only the records you select.
- **Leaves the final answer to your model.** Send the current question and relevant Marvnor results to your model, which writes the response.

Use it to check project dependencies, track business states, manage changing records, and catch conflicting information. Reuse confirmed records across questions and retrieve only the facts needed for each answer.

[Create a test Key](https://api.marvnor.com/home?lang=en) · [Quickstart](https://api.marvnor.com/docs?lang=en) · [API reference](https://api.marvnor.com/docs/api?lang=en) · [Recorded demo](https://wendelxia.github.io/marvnor/)

## Get started

1. [Create a test Key](https://api.marvnor.com/home?lang=en).
2. In your AI's MCP settings, add the server below and paste your Key into its API Key / Bearer Token field.
3. Copy the working rule from the [connection page](https://api.marvnor.com/connect?lang=en), then keep talking to your AI normally.

- **MCP endpoint:** `https://api.marvnor.com/v1/mcp`
- **Authentication header, if required by your AI:** `Authorization: Bearer <MARVNOR_API_KEY>` (replace the placeholder with your Key).

Use one Key per independent project. Your AI saves confirmed or sourced facts and queries Marvnor when it needs project memory. Tasks that do not depend on saved facts stay with your existing AI and tools. [Usage test evidence](docs/benchmarks/2026-10-25/recommended-usage.md).

Five actions cover everyday use: save, retrieve, verify, correct and delete. The [quickstart](https://api.marvnor.com/docs?lang=en) shows everyday examples; the API reference is available for field details.

Latest news, October 10: [Marvnor reports stronger record-based judgments and a 98.2% input reduction in a long-history test](NEWS.md) · [中文新闻稿](docs/news/2026-10-10-benchmark-results.zh-CN.md)

## User feedback

**Before**

<a href="docs/assets/feedback-before-en.png"><img src="docs/assets/feedback-before-en.png" width="560" alt="English translation of the anonymous before screenshot"></a>

**After**

<a href="docs/assets/feedback-after-en.png"><img src="docs/assets/feedback-after-en.png" width="560" alt="English translation of the anonymous after screenshot"></a>

Chinese originals: [Before](docs/assets/feedback-before.png) · [After](docs/assets/feedback-after.png).

## Results that show the difference

October 10, 2026 rerun:

| Test | Result | What it demonstrates |
| --- | --- | --- |
| Two structured record-verification sets | Marvnor: 20/20 in each. DeepSeek text answers across three runs: A 16/20 each; B 14/20, 15/20, 15/20 | More accurate judgments on the supplied records, including unknown and conflicting evidence |
| Final question after 160 turns of synthetic history | Model input: 5,328 to 95 tokens, a 98.2% reduction; both answers correct | Reusable relevant facts sharply reduce repeated model input |
| Original, shuffled and duplicated facts | 420/420 expected verdicts across seven datasets | Stable conclusions despite changes in input order and duplicate evidence |
| Saved single-value conflicts, tested locally | Both incompatible values flagged; removing one restored support for the other | Conflict management across saved records |
| Complex logic under 20 concurrent requests | Every request returned 20/20 expected verdicts; median request time 603 ms | Correct batch judgments during the measured concurrent workload |

The public suite returned **1,227/1,227 expected verdicts across 62 requests**, covering input variants and repeated workloads. [Read the report and every comparison question](docs/benchmarks/2026-10-10/rerun.md) or [inspect the data](docs/benchmarks/2026-10-10/rerun-results.json).

[中文使用说明](https://api.marvnor.com/docs?lang=zh-CN) · [Test index and archives](TESTS.md) · [News](NEWS.md) · [Public materials license](LICENSE)

Send feedback and test results to [wendelxia@gmail.com](mailto:wendelxia@gmail.com). Keep account keys and private customer material out of feedback.

Building an agent or project-memory tool? [Bring one concrete use case](mailto:wendelxia@gmail.com?subject=Marvnor%20integration) and try the API with your own non-sensitive sample data.
