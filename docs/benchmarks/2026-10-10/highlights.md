# Marvnor: verify facts before asking the LLM to answer

Send less irrelevant context, check the facts that matter, and ask for confirmation when evidence conflicts. Reuse confirmed memory as the project continues.

Marvnor's truth-preserving specialized model system handles structured fact verification and conflict management. The LLM writes the answer; the integrating application controls what happens next.

## What was checked against the current version

On October 10, 2026, a local compatibility replay matched the expected conclusions for **500/500 judgments in 25 requests**, and **14/14 targeted feature checks** passed. The imported Python source files used by the replay matched the active public-service release.

These were isolated local HTTP tests, not a new production load test or model comparison. The 500 judgments include input variants and repeated templates, not 500 independent questions. [Current-version review and per-question evidence](current-version.md).

## 1. Distinguish false from unknown

Missing evidence should not automatically become a negative answer. All 40 judgments in groups A and B still matched expectations in the current-code replay, including explicit negatives, unsupported claims, and conflicting evidence.

In the historical October 6 and 7 comparisons, Marvnor scored 20/20 in each group while the saved DeepSeek Flash responses scored 16/20 and 15/20. Most model errors treated unknown as false. The model was not rerun for this review, so these remain dated comparisons, not current model rankings.

Potential uses include project questions, business-state checks, and checks before an application acts. These tests compare structured verification with a model reading the same facts as text. They do not measure general LLM improvement after integration. The exact-computation baseline also scored 20/20 in each historical group.

## 2. Trace support through long chains

The current-code replay passed a 99-hop dependency-chain case in A and a 79-hop, time-constrained case in B. Forward support did not justify reversing the direction.

A new targeted check also followed a five-hop `supports` chain and returned its six-node path. An older failure on this relation is not an accurate description of the current version. This does not mean every custom relation is transitive.

These cases support uses such as checking dependency paths and tracing prerequisites. They are tested examples, not maximum supported sizes.

## 3. Check when and where evidence applies

Current-code checks passed compound queries using the documented `scope` operator to apply time and context. Evidence valid in the selected environment and time window supported the compound claim; evidence outside that window or context did not.

A separate check confirmed that supplied facts without a time restriction remained usable in a time-scoped compound query. This does not turn an absent fact into a true one.

The earlier broad conclusion that time/context compound queries were unsupported is outdated. One older request shape still returns HTTP 400: placing time or context beside the compound `claim` rather than using its scope operator. Use the [documented format](../../../PUBLIC_EVALUATION_API.md).

## 4. Detect conflicts between saved records

The current version detected two saved, incompatible values of a single-valued custom attribute. Querying either value returned `UNKNOWN` with `conflict: true`. Omitting `target` returned the two known candidate values for clarification. Removing one conflicting record left the other supported.

Conflict detection is therefore not limited to opposite evidence submitted in one request. It also works across applicable saved records in the tested single-valued case.

Ordinary custom attributes are single-valued by default. Defined multi-valued types can have multiple objects without that alone creating a conflict. Context and validity also matter; this is not automatic understanding of every contradiction in arbitrary prose.

The application can use the result to ask for confirmation. Marvnor does not itself open a dialog or choose which customer statement to trust.

## 5. Keep conclusions stable across input order and duplicates

Group C's seven generated datasets were replayed against the current code. All 140 base question instances matched expectations. Original, shuffled, and duplicated versions produced 420/420 expected conclusions across 21 requests.

This is relevant to projects that accumulate or repeatedly synchronize facts. The variants did not change the conclusions in these samples; this does not establish immunity to arbitrary noise or unlimited data.

## 6. Check complex conditions in one request

Current-code replays of groups D and E each passed 20/20 judgments. They covered nested logic, alternative paths, time, conflicts, and identifiers containing Chinese text or special characters. E included a question with 64 nested NOT operators and another with 440 atom occurrences inside an OR expression.

This supports checking several structured conditions together. Chinese identifiers are not a translation test, and passing these cases is not a broad mathematical-reasoning score.

The October 7 concurrency results remain available in the [historical methods](methods.md). They were not rerun, so this review makes no current throughput or latency claim.

## 7. Reduce repeated model reading when relevant facts are reusable

An October 8 experiment compared one factual question using full synthetic history versus prepared relevant results:

| History length | Full-history input | Relevant-results input | Input reduction for that query |
| --- | ---: | ---: | ---: |
| 8 turns | 310 tokens | 95 tokens | 69.4% |
| 40 turns | 1,366 tokens | 95 tokens | 93.0% |
| 160 turns | 5,328 tokens | 95 tokens | 98.2% |

Both paths answered PostgreSQL at all three lengths. This remains a historical illustration, not a new current-version measurement.

The practical opportunity is to reuse prepared facts and send only what the question needs. Extraction, updates, retrieval, and Marvnor fees were excluded from these figures. They measure the final query's input, not cumulative usage or total cost. They do not establish unchanged quality across all tasks.

## 8. Correct memory and remove test data during continued use

Current-version checks verified an in-place custom-attribute edit: the replacement evaluated as `TRUE`, and the old value as `UNKNOWN`. Targeted deletion then removed that fact without removing unrelated memory.

The same day's isolated maintenance suite passed 23 memory-interface tests and four customer-example checks. Coverage included batch cleanup, preservation of other data, usable record receipts after restart, and rejecting ambiguous deletion requests.

This lets an application maintain its records without treating every correction as a full reset. The tests are local functional evidence, not a production deletion-speed result or a system-wide security audit.

---

[Current-version review](current-version.md) · [Historical methods and comparisons](methods.md) · [Current replay data](current-version.json) · [Historical data](data.json) · [Integration guide](../../customer/llm-integration.md)

The evidence supports targeted structured verification, conflict management, and reusable project memory. It does not establish broad improvements in creative writing, translation, pure mathematics, or ordinary code generation.
