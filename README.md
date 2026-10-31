# Marvnor

## Truth-Preserving Model System

[![M8ven Score](https://m8ven.ai/badge/mcp/wendelxia-marvnor-0jrgh6?v=1caeae5a89756c2dad15a4bd720eaa27)](https://m8ven.ai/mcp/wendelxia-marvnor-0jrgh6?s=readme)

Marvnor is a Truth-Preserving Model System for AI applications. Keep project decisions available, verify claims against supplied records, and surface conflicts before answering.

## What it does

- **Carry project memory forward:** reuse confirmed requirements, decisions and changes.
- **Answer with evidence:** distinguish supported, refuted and unknown claims; surface conflicting values for confirmation.
- **Keep information current:** correct outdated facts and delete selected records.
- **Reduce repeated history:** use the results relevant to the current question. No need to rebuild your application.

Reuse confirmed project dependencies, business states and decisions across questions.

[Create a test Key](https://api.marvnor.com/home?lang=en) · [Quickstart](https://api.marvnor.com/docs?lang=en) · [API reference](https://api.marvnor.com/docs/api?lang=en) · [Recorded demo](https://wendelxia.github.io/marvnor/)

## Get started

1. [Create a test Key](https://api.marvnor.com/home?lang=en).
2. In your AI's MCP settings, add the server below and paste your Key into its API Key / Bearer Token field.
3. Copy the working rule from the [connection page](https://api.marvnor.com/connect?lang=en), then keep talking to your AI normally.

- **MCP endpoint:** `https://api.marvnor.com/v1/mcp`
- **Authentication header, if required by your AI:** `Authorization: Bearer <MARVNOR_API_KEY>` (replace the placeholder with your Key).

Use one Key per independent project. Save confirmed or sourced facts; query Marvnor when project memory is needed. Other tasks stay with your existing AI and tools. [Usage test evidence](docs/benchmarks/2026-10-25/recommended-usage.md).

Latest news, November 1: [Marvnor reports 40/40 record-verification results and 98.2% less final-question input](NEWS.md) · [中文新闻稿](docs/news/2026-11-01-results.zh-CN.md) · [Read on the website](https://wendelxia.github.io/marvnor/news.html)

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
| Two structured record-verification sets | Marvnor: 20/20 in each. General-purpose model text answers across three runs: A 16/20 each; B 14/20, 15/20, 15/20 | More accurate judgments on the supplied records, including unknown and conflicting evidence |
| Final question after 160 turns of synthetic history | Model input: 5,328 to 95 tokens, a 98.2% reduction; both answers correct | Reusable relevant facts sharply reduce repeated model input |
| Original, shuffled and duplicated facts | 420/420 expected verdicts across seven datasets | Stable conclusions despite changes in input order and duplicate evidence |
| Saved single-value conflicts, tested locally | Both incompatible values flagged; removing one restored support for the other | Conflict management across saved records |
| Complex logic under 20 concurrent requests | Every request returned 20/20 expected verdicts; median request time 603 ms | Correct batch judgments during the measured concurrent workload |

The public suite returned **1,227/1,227 expected verdicts across 62 requests**, covering input variants and repeated workloads. [Read the report and every comparison question](docs/benchmarks/2026-10-10/rerun.md) or [inspect the data](docs/benchmarks/2026-10-10/rerun-results.json).

Team-run tests, not an independent audit. The verification comparison used the same facts and questions, submitted as structured records to Marvnor and text to the baseline; it does not measure general model intelligence. The 98.2% figure concerns one final request's model input, not total cost.

[中文使用说明](https://api.marvnor.com/docs?lang=zh-CN) · [Test index and archives](TESTS.md) · [News](NEWS.md) · [Public materials license](LICENSE)

Send feedback to [wendelxia@gmail.com](mailto:wendelxia@gmail.com), or [discuss an integration](mailto:wendelxia@gmail.com?subject=Marvnor%20integration) with a non-sensitive sample. Omit keys and private customer data.
