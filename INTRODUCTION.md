# Marvnor Truth-Preserving Decision Gateway

When an LLM faces long documents, complex conditions, or contradictory records, a fluent answer is not necessarily a reliable judgment. Marvnor is a gateway alongside an existing LLM: the application sends the question and relevant evidence through it, and receives judgment results that help distinguish supported conclusions, refuted conclusions, insufficient evidence, and conflicting sources.

It is intended for evidence-based use cases such as enterprise RAG, intelligent customer service, compliance review, and data analysis. The application does not need to replace its main model or build a knowledge graph covering the entire business in advance.

## Six results

| Result | What it tells the application |
|---|---|
| `conclusion` | Whether the conclusion is `TRUE`, `FALSE`, or temporarily undetermined as `UNKNOWN`. |
| `evidence_kind` | Whether the evidence is direct, indirect, composite, conflicting, or unknown. |
| `conflict` | Whether applicable submitted facts conflict, including facts already saved under the same key. |
| `reason` | A short code explaining the current judgment. |
| `decision` | A signal for the next handling step; the application decides the final action. |
| `path` | A relevant evidence path, or known candidate values when `target` is omitted; compound queries and output limits may also leave it empty. |

For example, if two sources provide opposite evidence for the same question, Marvnor returns `UNKNOWN` and marks the conflict. The application can ask the model to explain the conflict, ask for more information, or route the case to a human reviewer. Marvnor does not invent material that was not supplied to it.

Ordinary custom attributes are single-valued by default: incompatible values in compatible contexts and overlapping validity periods are a conflict. Defined multi-valued types, such as `supports`, can have multiple objects. [See the API contract](PUBLIC_EVALUATION_API.md) for structured input, candidate queries, and the exact six-field response. A supported claim is not an independent guarantee about the real world.

## Observed results

On October 10, 2026, an isolated local replay matched 500/500 expected verdicts across 25 requests, and 14/14 targeted feature checks passed. The tested source files matched the active public-service release. Counts include variants and repeated question templates, not 500 independent tasks.

The checks covered long dependency chains, scoped time/context logic, persisted single-value conflicts, candidate-value queries, and correction and targeted deletion of saved facts. See the [current-version review](docs/benchmarks/2026-10-10/current-version.md) and [eight test-backed benefits](docs/benchmarks/2026-10-10/highlights.md).

These are structured functional tests, not a new head-to-head model benchmark or proof of broad writing, translation, mathematics, or coding improvement. Earlier model comparisons and token figures remain [dated historical evidence](TESTS.md); current production latency and total customer cost were not measured here.

[Open the user portal](https://api.marvnor.com/) · [Run the quickstart](USER_QUICKSTART.md) · [Read the usage guide](USAGE.md) · [Contact us about testing](mailto:wendelxia@gmail.com)
