# Marvnor

## Hosted MCP Server for Agent Memory + HTTP API

[![M8ven Score](https://m8ven.ai/badge/mcp/wendelxia-marvnor-0jrgh6?v=1caeae5a89756c2dad15a4bd720eaa27)](https://m8ven.ai/mcp/wendelxia-marvnor-0jrgh6?s=readme)

Marvnor is a proprietary hosted MCP server and HTTP API for agent memory and record-based verification. Store supplied facts as source, relation and target records; ask structured questions against those records and receive `TRUE`, `FALSE` or `UNKNOWN`, with conflicting values flagged. Correct records in place or delete selected records. Send the current question and relevant Marvnor results to your model to write the answer.

Use it to check project dependencies, business states, time-sensitive records and conflicting information. Keep confirmed records between questions and pass only the results needed for the next answer.

[Connect your AI via MCP](https://api.marvnor.com/connect?lang=en) · [Create a test Key](https://api.marvnor.com/home?lang=en) · [See the demo](https://wendelxia.github.io/marvnor/) · [Run the example](examples/README.md) · [API docs](PUBLIC_EVALUATION_API.md) · [Customer portal](https://api.marvnor.com/?lang=en)

## Connect Codex or VS Code via MCP

Open the [guided connection setup](https://api.marvnor.com/connect?lang=en) to connect Codex or VS Code. The hosted MCP server exposes seven tools for checking the connection, saving, recalling, verifying, browsing candidates, correcting, or deleting facts.

- **MCP endpoint:** `https://api.marvnor.com/v1/mcp`
- **Authentication:** `Authorization: Bearer <MARVNOR_API_KEY>`

Records are isolated by API key. Use the same key for saving and querying, including across clients that should share those records. Keep the key in your client configuration or runtime environment. Follow the [LLM integration guide](docs/customer/llm-integration.md) to pass only the current question and relevant Marvnor results to your model.

**Recommended pattern:** use one key for one independent project. Save only important user-confirmed or sourced facts. Call Marvnor when a question needs project memory; send the model the current question plus all six fields of relevant results. Ask the user to resolve conflicts, treat `UNKNOWN` as insufficient evidence, and correct changed facts in place. Tasks that do not depend on saved project facts can go directly to the model.

## Try it before signing up

On the [product home](https://api.marvnor.com/home?lang=en), select **Create a test API Key**. You get 500 points for 30 days to try your own material; save the Key when it is shown. Before the trial expires, [register](https://api.marvnor.com/register?lang=en) in the same browser and confirm the transfer to keep the same Key and saved facts. Registration separately grants 1,000 points; unused guest points do not transfer. [Getting started](docs/customer/developer-trial.md).

Trial calls use the trial allowance. After registration, usage follows the current plan; Marvnor does not automatically charge external payment methods.

Download [quickstart.py](https://raw.githubusercontent.com/wendelxia/marvnor/main/examples/quickstart.py), then run:

```sh
python quickstart.py
```

Paste your API Key at the hidden prompt. The example verifies a saved fact, detects conflicting values, resolves the conflict, corrects the fact, then deletes only its own demo data. Python 3.9+, no dependencies. API calls consume points according to the current pricing. [Setup and recorded results](examples/README.md).

Latest news, October 10: [Marvnor reports stronger record-based judgments and a 98.2% input reduction in a long-history test](NEWS.md) · [中文新闻稿](docs/news/2026-10-10-benchmark-results.zh-CN.md)

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

## Connect it to your application

Call `POST /v1/evaluate` for explicit claims, or `POST /v1/recall` with the current question to find relevant saved records. Each answer contains six fields in the public response: `conclusion`, `conflict`, `reason`, `path`, `decision`, and `evidence_kind`. A multi-part question may return several answers, not one overall verdict.

- [Quickstart](USER_QUICKSTART.md): save, verify and delete a demonstration record.
- [API reference](PUBLIC_EVALUATION_API.md): requests and six-field answers.
- [Record management](docs/customer/record-management.md): correct records, delete selected data and import in chunks.
- [LLM integration](docs/customer/llm-integration.md): forward the current question and relevant results to your model.
- [Usage guide](USAGE.md): account setup and everyday operation.

[Chinese web documentation](https://api.marvnor.com/docs) · [Product introduction](INTRODUCTION.md) · [Test index and archives](TESTS.md) · [News](NEWS.md) · [Public materials license](LICENSE)

Send feedback and test results to [wendelxia@gmail.com](mailto:wendelxia@gmail.com). Keep account keys and private customer material out of feedback.

Building an agent or project-memory tool? [Bring one concrete use case](mailto:wendelxia@gmail.com?subject=Marvnor%20integration) and try the API with your own non-sensitive sample data.
