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

On October 10, 2026, a fresh live rerun matched 1,227/1,227 expected verdicts across 62 scored public requests. Counts include variants and repeated question templates, not 1,227 independent tasks. In two 20-question groups, live Marvnor scored 20/20 each; three fresh DeepSeek runs scored 16/20 each in A and 14/20, 15/20 and 15/20 in B.

The live checks covered long chains, scoped logic, input variants and short concurrent workloads. Separate local checks covered saved-record conflicts, candidate queries, correction and targeted deletion. See the [fresh report](docs/benchmarks/2026-10-10/rerun.md), [local feature review](docs/benchmarks/2026-10-10/current-version.md) and [eight test-backed benefits](docs/benchmarks/2026-10-10/highlights.md).

The comparison is structured verification versus model text answers, not the same LLM with and without Marvnor. It does not establish broad writing, translation, mathematics or coding improvement. Fresh latency and token measurements retain their workload limits; the 98.2% input reduction in one final-query example is not a total-cost reduction. Older aggregate benchmarks remain [historical evidence](TESTS.md).

[Open the user portal](https://api.marvnor.com/) · [Run the quickstart](USER_QUICKSTART.md) · [Read the usage guide](USAGE.md) · [Contact us about testing](mailto:wendelxia@gmail.com)
