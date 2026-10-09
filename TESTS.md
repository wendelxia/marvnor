# Marvnor Truth-Preserving Model System Public Tests

## Latest live rerun: October 10, 2026

[Eight benefits and their evidence](docs/benchmarks/2026-10-10/highlights.md) · [Fresh report and full comparisons](docs/benchmarks/2026-10-10/rerun.md) · [Fresh sanitized data](docs/benchmarks/2026-10-10/rerun-results.json)

The fresh public rerun returned HTTP 200 for all 62 scored requests and matched 1,227/1,227 expected verdicts across input variants and concurrent repetitions.

| Test | Fresh result | Conclusion |
| --- | --- | --- |
| Structured verification versus DeepSeek text answers | Marvnor 20/20 in both sets; three DeepSeek runs: A 16/20 each, B 14/20, 15/20, 15/20 | More accurate fact judgments in both sets |
| Input order and duplication | 420/420 expected verdicts | Conclusions remained stable |
| Final query after 160 synthetic history turns | 5,328 to 95 input tokens; both answers correct | 98.2% less model input for the same answer |
| Complex logic, 20 concurrent requests | Every request 20/20; median 603 ms | Correct judgments across the concurrent batches |
| Earlier temporal and supports cases | Temporal 20/20 plus seven edge cases; supports set 100/100 across five variants | Both earlier failure sets now pass |
| Local workflow and maintenance | Eight workflow checks and 23 + 4 maintenance/example checks passed | Confirmation, answer handling and memory operations followed the expected flow |

All eight evidence groups were rerun. The [full report](docs/benchmarks/2026-10-10/rerun.md) contains each model-comparison question, observed errors, token/cache accounting and test methods.

The [earlier same-day local review](docs/benchmarks/2026-10-10/current-version.md) remains separately documented: 500/500 replay verdicts and 14/14 feature checks, including saved-record conflicts, candidate queries and editing. [Local data](docs/benchmarks/2026-10-10/current-version.json) · [Historical methods](docs/benchmarks/2026-10-10/methods.md).

The older aggregate reports below are retained as historical reports. They were not rerun in this collection and are not used as audited evidence for current general model-capability gains. The complete original run records for the NLGraph and 10-question general-capability summaries were not available for the earlier review; the linked ProofWriter scorecard does not by itself reproduce the entire workflow.

## Historical reports: October 4 to 5, 2026

Marvnor works beside an LLM to check critical judgments: it confirms supported claims, avoids jumping to a conclusion when sources conflict, and does not force an answer when the evidence is insufficient. The project team ran the tests below on October 4–5, 2026, using public datasets and the live service. This is not an independent third-party audit.

The October 10, 2026 [customer documentation update](USAGE.md) does not rerun these benchmarks. Results below describe the historical test workflows, not validation of every behavior in the current [API contract](PUBLIC_EVALUATION_API.md).

## What changed after connecting the model

| Test | Model alone | Workflow connected to Marvnor | How to read the result |
|---|---:|---:|---|
| [ProofWriter](https://aclanthology.org/2021.findings-acl.317/) — 30 questions | 12/30 | 30/30 | After seeing the tool result, the model corrected 18 of its initial answers; the rule-inference results were precomputed by the test program. |
| ProofWriter — 200 questions | 52/200 | 200/200 | Tool results triggered corrections to 148 of the model’s initial answers. |
| [NLGraph](https://github.com/Arthur-Heng/NLGraph) connectivity — 90 questions | 78/90 | 90/90 | The model read the original question directly; the tool judged relationships extracted from that question. The 12 additional correct answers indicate that this tool workflow was useful. |

The 200 ProofWriter questions contain 92 `TRUE`, 93 `FALSE`, and 15 `UNKNOWN` cases. The [per-question scorecard](data/proofwriter-200-scorecard.csv) lists the reference answer and the results from both paths. It contains no account credentials, request content, or internal service information. The median latency for a single Marvnor call in this run was about 281 ms; this is not the end-to-end answer time.

## General capability comparison

The project team also ran a separate 10-question comparison. The average score on five context tasks rose from 94.44 to 100; the translation task rose from 88.89 to 100, and the project-rule code task rose from 83.33 to 100. The creative, mathematics, and academic questions showed no score regression.

These tests show that Marvnor can check material supplied to it and, with an appropriate integration workflow, help a model correct its answers. The scores do not mean that Marvnor independently understood the original question, and they are not a performance guarantee for every scenario. You are welcome to repeat the tests with your own questions and send results or counterexamples to [wendelxia@gmail.com](mailto:wendelxia@gmail.com). Please do not send account keys or sensitive material you are not authorized to share.

[Back to the home page](README.md) · [Read the usage guide](USAGE.md)
