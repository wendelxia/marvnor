# Marvnor Truth-Preserving Model System Public Tests

## Latest reviewed evidence: October 10, 2026

[Eight benefits and their evidence](docs/benchmarks/2026-10-10/highlights.md) · [Methods and full comparisons](docs/benchmarks/2026-10-10/methods.md) · [Sanitized question-level data](docs/benchmarks/2026-10-10/data.json)

The [current-version review](docs/benchmarks/2026-10-10/current-version.md) passed 500/500 local replay verdicts and 14/14 targeted feature checks using source files matched to the live release. The count includes variants and repeated templates, not 500 independent new questions. Saved-record single-value conflicts, candidate queries, scoped compound logic, five-hop `supports`, and custom-attribute editing were verified. [Current per-question results](docs/benchmarks/2026-10-10/current-version.json).

The collection also retains eight dated evidence groups covering model comparisons, randomized variants, short concurrency runs, long-history input, local confirmation workflows, and memory maintenance. Model answers, production performance, token usage, and total cost were not refreshed by the current-code replay.

The older aggregate reports below are retained as historical reports. They were not revalidated by this review and are not used as audited evidence for general model-capability gains in the new collection. The complete original run records for the NLGraph and 10-question general-capability summaries were not available for this review; the linked ProofWriter scorecard does not by itself reproduce the entire workflow.

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
