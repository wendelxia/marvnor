# Marvnor Truth-Preserving Decision Gateway

Marvnor gives LLM applications fact verification, conflict management and reusable project memory. It checks the evidence behind a question, identifies missing or conflicting support, and returns results the model can use to write its answer.

Use it for project dependencies, business-state checks, customer support and evidence-based analysis. Keep your existing model and send it the current question with the relevant Marvnor results.

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

Ordinary custom attributes are single-valued by default: incompatible values in compatible contexts and overlapping validity periods are a conflict. Defined multi-valued types, such as `supports`, can have multiple objects. [See the API contract](PUBLIC_EVALUATION_API.md) for structured input, candidate queries and the six-field response.

## What the tests demonstrate

The October 10, 2026 rerun produced clear results:

| Test result | Conclusion |
| --- | --- |
| Two fact-verification sets: Marvnor 20/20 each; DeepSeek text answers over three runs scored A 16/20 each and B 14/20, 15/20, 15/20 | Marvnor made more accurate judgments on these facts |
| Final query after 160 turns of synthetic history: 5,328 input tokens reduced to 95, with both answers correct | Reusing relevant facts cut repeated model input by 98.2% in this example |
| Original, shuffled and duplicated inputs: 420/420 expected verdicts | Conclusions stayed stable across reordered and repeated evidence |
| Local saved-memory checks flagged incompatible values, returned both candidates and verified the corrected record | Conflicts can be found and resolved across stored records |
| 99-hop chain, scoped temporal logic and nested compound conditions passed | Applications can verify connected requirements across multiple steps and contexts |

The public suite matched 1,227/1,227 expected verdicts across 62 requests, including input variants and concurrent repetitions. Read the [eight tested benefits](docs/benchmarks/2026-10-10/highlights.md), [full report and methods](docs/benchmarks/2026-10-10/rerun.md), or [local feature checks](docs/benchmarks/2026-10-10/current-version.md).

[Open the user portal](https://api.marvnor.com/) · [Run the quickstart](USER_QUICKSTART.md) · [Read the usage guide](USAGE.md) · [Contact us about testing](mailto:wendelxia@gmail.com)
