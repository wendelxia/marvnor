# Marvnor: verify facts before asking the LLM to answer

Send less irrelevant context, check the facts that matter, and ask for confirmation when evidence conflicts. Reuse confirmed memory as the project continues.

Marvnor's truth-preserving specialized model system handles structured fact verification and conflict management. The LLM writes the answer; the integrating application controls what happens next.

## What was rerun on the current version

On October 10, 2026, a fresh rerun matched **1,227/1,227 expected verdicts across 62 scored public requests**. All responses had HTTP 200 and six-field answers. There were also 12 fresh DeepSeek calls, five local Qwen calls and 27 local maintenance/example checks. The relevant local source files matched the active public-service release.

The verdict count includes input variants and repeated requests, not 1,227 independent questions. The concurrency measurements are short repeated workloads, not a sustained capacity test. Separate [14 local feature checks](current-version.md#fourteen-targeted-checks) remain evidence for saved-record conflicts and editing. [Fresh report and per-question evidence](rerun.md).

## 1. Distinguish false from unknown

Missing evidence should not automatically become a negative answer. All 40 judgments in groups A and B matched expectations on the live service, including explicit negatives, unsupported claims and conflicting evidence.

Live Marvnor scored 20/20 in each group. Three fresh DeepSeek Flash runs each scored 16/20 in A; B scored 14/20, 15/20 and 15/20. Most model errors treated unknown as false. The additional B error treated a compound conflict as true. All six model responses completed without truncation. [All questions and observed errors](rerun.md#model-comparison-and-observed-errors).

Potential uses include project questions, business-state checks, and checks before an application acts. These tests compare structured verification with a model reading the same facts as text. They do not measure general LLM improvement after integration. The exact-computation baseline also scored 20/20 in each historical group.

## 2. Trace support through long chains

The public rerun passed a 99-hop dependency-chain case in A and a 79-hop, time-constrained case in B. Forward support did not justify reversing the direction.

A separate local check followed a five-hop `supports` chain and returned its six-node path. The public rerun also passed the earlier failing set in all five forms: original, shuffled, duplicated, renamed and with distractors, each 20/20. The older failure no longer describes this tested case. This does not mean every custom relation is transitive.

These cases support uses such as checking dependency paths and tracing prerequisites. They are tested examples, not maximum supported sizes.

## 3. Check when and where evidence applies

Current-code checks passed compound queries using the documented `scope` operator to apply time and context. Evidence valid in the selected environment and time window supported the compound claim; evidence outside that window or context did not.

A separate check confirmed that supplied facts without a time restriction remained usable in a time-scoped compound query. This does not turn an absent fact into a true one.

The earlier broad conclusion that time/context compound queries were unsupported is outdated. The old temporal/context set passed 20/20 on the public service, plus seven temporal edge cases. One older request shape remains rejected in the local feature check: placing time or context beside the compound `claim` rather than using its scope operator. Use the [documented format](../../../PUBLIC_EVALUATION_API.md).

## 4. Detect conflicts between saved records

The same-day local feature checks detected two saved, incompatible values of a single-valued custom attribute. Querying either value returned `UNKNOWN` with `conflict: true`. Omitting `target` returned the two known candidate values for clarification. Removing one conflicting record left the other supported. This saved-memory case was tested locally, not by changing customer memory on the public service.

Conflict detection is therefore not limited to opposite evidence submitted in one request. It also works across applicable saved records in the tested single-valued case.

Ordinary custom attributes are single-valued by default. Defined multi-valued types can have multiple objects without that alone creating a conflict. Context and validity also matter; this is not automatic understanding of every contradiction in arbitrary prose.

The application can use the result to ask for confirmation. Marvnor does not itself open a dialog or choose which customer statement to trust.

## 5. Keep conclusions stable across input order and duplicates

Group C's seven generated datasets were rerun against the public service. All 140 base question instances matched expectations. Original, shuffled and duplicated versions produced 420/420 expected conclusions across 21 requests.

This is relevant to projects that accumulate or repeatedly synchronize facts. The variants did not change the conclusions in these samples; this does not establish immunity to arbitrary noise or unlimited data.

## 6. Check complex conditions in one request

Public reruns of groups D and E each passed 20/20 judgments. They covered nested logic, alternative paths, time, conflicts and identifiers containing Chinese text or special characters. E included a question with 64 nested NOT operators and another with 440 atom occurrences inside an OR expression.

This supports checking several structured conditions together. Chinese identifiers are not a translation test, and passing these cases is not a broad mathematical-reasoning score.

In the fresh short concurrency runs, all 10 D requests and all 20 E requests returned 20/20 expected verdicts. Median whole-request times were 284.185 ms and 603.455 ms respectively. E was slightly slower than the historical 597.245 ms. These repeated workloads do not establish sustained production capacity. [Timings and method](rerun.md#short-concurrency-runs).

## 7. Reduce repeated model reading when relevant facts are reusable

The original history experiment was rerun with six fresh DeepSeek calls on October 10. It compared one factual question using full synthetic history versus prepared relevant results:

| History length | Full-history input | Relevant-results input | Input reduction for that query |
| --- | ---: | ---: | ---: |
| 8 turns | 310 tokens | 95 tokens | 69.4% |
| 40 turns | 1,366 tokens | 95 tokens | 93.0% |
| 160 turns | 5,328 tokens | 95 tokens | 98.2% |

Both paths answered PostgreSQL at all three lengths, with two output tokens each. Full-history cache hits were 128, 1,152 and 5,120 tokens; compact-input cache hits were zero. The 160-turn full-history cache count was much higher than the historical 512, which affects the price comparison.

The practical opportunity is to reuse prepared facts and send only what the question needs. Verification used the current local core. Extraction, updates, retrieval, query preparation and Marvnor fees were excluded. These figures measure the final query's input, not cumulative usage or total cost. They do not establish unchanged quality across all tasks. [Token and cache details](rerun.md#model-input-and-cache-usage).

The local Qwen gateway workflow also passed all eight flow checks again. Four of five model answers were accepted; one repeated the question and was rejected with fallback. Conflict and unknown handling worked in these fixtures, but 8/8 workflow checks must not be quoted as eight perfect model answers.

## 8. Correct memory and remove test data during continued use

Current-version checks verified an in-place custom-attribute edit: the replacement evaluated as `TRUE`, and the old value as `UNKNOWN`. Targeted deletion then removed that fact without removing unrelated memory.

The isolated maintenance suite was rerun and passed 23 memory-interface tests and four customer-example checks. Coverage included batch cleanup, preservation of other data, usable record receipts after restart and rejecting ambiguous deletion requests.

This lets an application maintain its records without treating every correction as a full reset. The tests are local functional evidence, not a production deletion-speed result or a system-wide security audit.

---

[Fresh rerun](rerun.md) · [Fresh data](rerun-results.json) · [Local feature review](current-version.md) · [Historical methods](methods.md) · [Historical data](data.json) · [Integration guide](../../customer/llm-integration.md)

The evidence supports targeted structured verification, conflict management, and reusable project memory. It does not establish broad improvements in creative writing, translation, pure mathematics, or ordinary code generation.
