# Marvnor

## Hosted MCP Server for Agent Memory + HTTP API

[![M8ven Score](https://m8ven.ai/badge/mcp/wendelxia-marvnor-0jrgh6?v=1caeae5a89756c2dad15a4bd720eaa27)](https://m8ven.ai/mcp/wendelxia-marvnor-0jrgh6?s=readme)

Marvnor is a proprietary hosted MCP server and HTTP API for agent memory and record-based verification. Store supplied facts as source, relation and target records; ask structured questions against those records and receive `TRUE`, `FALSE` or `UNKNOWN`, with conflicting values flagged. Correct records in place or delete selected records. Send the current question and relevant Marvnor results to your model to write the answer.

Use it to check project dependencies, business states, time-sensitive records and conflicting information. Keep confirmed records between questions and pass only the results needed for the next answer.

[Create a test Key](https://api.marvnor.com/home?lang=en) · [Quickstart](https://api.marvnor.com/docs?lang=en) · [API reference](https://api.marvnor.com/docs/api?lang=en) · [Recorded demo](https://wendelxia.github.io/marvnor/)

## Get started

Create a trial Key, then [connect your existing AI](https://api.marvnor.com/connect?lang=en). Follow the [quickstart](https://api.marvnor.com/docs?lang=en) for setup, the working rule and everyday examples. Five tools handle saving, retrieval, verification, correction and deletion.

- **MCP endpoint:** `https://api.marvnor.com/v1/mcp`
- **Authentication:** `Authorization: Bearer <MARVNOR_API_KEY>`

Use one Key per independent project. Your AI saves confirmed or sourced facts and queries Marvnor when it needs project memory. Tasks that do not depend on saved facts stay with your existing AI and tools. [Usage test evidence](docs/benchmarks/2026-10-25/recommended-usage.md).

Prefer direct HTTP? [Run the Python example](examples/README.md) to save, verify, resolve a conflict, correct and delete its own test data. No SDK or dependencies are required.

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
