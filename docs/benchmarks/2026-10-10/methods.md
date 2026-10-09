# Marvnor historical tests: methods and per-question results

This report supports the [eight test-backed benefits](highlights.md). Prepared on October 10, 2026. The team retains the original records locally; this public package provides sanitized results and source-file fingerprints. It does not include source code, keys, customer data, or the complete test inputs.

Archive note: a later [fresh rerun](rerun.md) repeated these eight groups and earlier temporal/supports failures. Use its [new data](rerun-results.json) for current measurements. The dated figures and descriptions of work performed below remain the historical record of this earlier collection.

Version review: the [current-source replay](current-version.md) passed 500/500 verdicts and 14/14 targeted checks on October 10. It supersedes older limitations concerning scoped compound queries, five-hop `supports`, persisted single-value conflicts, candidate queries, and custom-attribute editing. The dated results below remain historical; DeepSeek answers, concurrency, token usage, and the Qwen workflow were not rerun.

## 1. Eight evidence groups

All dates below are in 2026.

| Group | Date | What was tested | Recorded result | Environment and counting |
| --- | --- | --- | --- | --- |
| A | October 6 | 99-hop chains, cycles, conflicts, compound conditions | Marvnor 20/20; DeepSeek 16/20 | Historical API verification versus model text answers; 174 facts |
| B | October 7 | 79-hop chains, validity, environments, compound conditions | Marvnor 20/20; DeepSeek 15/20 | Historical API verification versus model text answers; 200 facts |
| C | October 7 | Generated datasets, shuffling, duplication | Base 140/140; conclusions stable in 7/7 groups | 7 datasets × 20 question templates × 3 versions |
| D | October 7 | Special identifiers, nested conditions, concurrency | Base 20/20; each of 10 concurrent requests 20/20 | Repeated request; 200 judgments are not 200 new questions |
| E | October 7 | Deeper conditions, alternative paths, concurrency | Base 20/20; each of 20 concurrent requests 20/20 | Repeated request; 400 judgments are not 400 new questions |
| F | October 8 | Model input at three history lengths | 310 / 1,366 / 5,328 tokens to 95 each | Local verification plus actual model usage; one factual question |
| G | October 9 | Conflict confirmation, pausing on unknown, answer generation | 8/8 expected workflows | Local application integration, not model answer accuracy |
| H | October 10 | Correction, deletion, data preservation, customer examples | 23/23 plus 4/4 checks | Rerun locally with isolated temporary data, not a public-service regression run |

A to E use saved historical API tests. F and G use local verification or application integrations. H is the local recheck performed when this collection was prepared. Groups overlap in question types and must not be added into an overall accuracy score. Preparing the collection did not make new paid-model or production API calls.

## 2. Group A: all 20 long-chain and conflict questions

`TRUE` means evidence supports the claim. `FALSE` means explicit negative evidence exists. `UNKNOWN` means the result is undetermined, either because evidence is insufficient or because it conflicts. Interpret the conflict flag and other fields to distinguish those reasons.

| ID | Test | Expected | Marvnor | DeepSeek Flash | Marvnor conflict |
| --- | --- | --- | --- | --- | --- |
| q01 | Follow a 99-hop dependency chain | TRUE | TRUE | TRUE | No |
| q02 | Do not reverse the dependency direction | UNKNOWN | UNKNOWN | FALSE | No |
| q03 | Verify a middle section of a long chain | TRUE | TRUE | TRUE | No |
| q04 | Multiple branches converge on one target | TRUE | TRUE | TRUE | No |
| q05 | Forward reachability within a cycle | TRUE | TRUE | TRUE | No |
| q06 | Reverse reachability within a cycle | TRUE | TRUE | TRUE | No |
| q07 | Positive and negative evidence for the same claim | UNKNOWN | UNKNOWN | FALSE | Yes |
| q08 | Explicit negative evidence | FALSE | FALSE | FALSE | No |
| q09 | Distractors cannot fill missing evidence | UNKNOWN | UNKNOWN | UNKNOWN | No |
| q10 | Follow business steps with Chinese labels | TRUE | TRUE | TRUE | No |
| q11 | Chinese-labeled steps cannot be reversed either | UNKNOWN | UNKNOWN | FALSE | No |
| q12 | Multiple conditions hold together | TRUE | TRUE | TRUE | No |
| q13 | One condition lacks evidence | UNKNOWN | UNKNOWN | UNKNOWN | No |
| q14 | One of several alternatives holds | TRUE | TRUE | TRUE | No |
| q15 | Negate a supported condition | FALSE | FALSE | FALSE | No |
| q16 | A supported premise followed by a supported consequence | TRUE | TRUE | TRUE | No |
| q17 | Keep an unknown premise undetermined | UNKNOWN | UNKNOWN | UNKNOWN | No |
| q18 | Preserve conflict inside nested conditions | UNKNOWN | UNKNOWN | FALSE | Yes |
| q19 | Combine multiple layers of conditions | TRUE | TRUE | TRUE | No |
| q20 | Duplicate or alternative evidence preserves the conclusion | TRUE | TRUE | TRUE | No |

Marvnor scored 20/20, DeepSeek 16/20, and the local exact-computation baseline 20/20. The four differences were q02, q07, q11, and q18: the model treated unknown as false. Questions q07 and q18 involved conflicts.

The original file stores per-question summaries including conclusions, reasons, and conflicts. Paths retain their lengths and endpoints: 99 hops correspond to 100 nodes. These summaries are not full response transcripts.

## 3. Group B: all 20 time and environment questions

| ID | Test | Expected | Marvnor | DeepSeek Flash | Marvnor conflict |
| --- | --- | --- | --- | --- | --- |
| q01 | 79-hop chain within its validity window | TRUE | TRUE | TRUE | No |
| q02 | 79-hop chain before all evidence becomes valid | UNKNOWN | UNKNOWN | FALSE | No |
| q03 | 79-hop chain after some evidence expires | UNKNOWN | UNKNOWN | FALSE | No |
| q04 | Query the dependency chain in reverse | UNKNOWN | UNKNOWN | FALSE | No |
| q05 | Verify a middle section of a long chain | TRUE | TRUE | TRUE | No |
| q06 | Use the alternative path valid in July | TRUE | TRUE | TRUE | No |
| q07 | Use a different path valid in February | TRUE | TRUE | TRUE | No |
| q08 | Indirect dependency in production | TRUE | TRUE | TRUE | No |
| q09 | Explicit negative evidence in staging | FALSE | FALSE | UNKNOWN | No |
| q10 | Do not combine production and staging evidence | UNKNOWN | UNKNOWN | UNKNOWN | No |
| q11 | Conflicting evidence valid at the same time | UNKNOWN | UNKNOWN | UNKNOWN | Yes |
| q12 | Negative evidence has not yet become valid | TRUE | TRUE | TRUE | No |
| q13 | Negative evidence has expired | TRUE | TRUE | TRUE | No |
| q14 | Explicit negative evidence | FALSE | FALSE | FALSE | No |
| q15 | Cycle within its validity window | TRUE | TRUE | TRUE | No |
| q16 | Cycle evidence has not yet become valid | UNKNOWN | UNKNOWN | FALSE | No |
| q17 | Distractors cannot fill missing evidence | UNKNOWN | UNKNOWN | UNKNOWN | No |
| q18 | Both conditions have support | TRUE | TRUE | TRUE | No |
| q19 | One condition lacks evidence | UNKNOWN | UNKNOWN | UNKNOWN | No |
| q20 | Preserve conflict in a compound judgment | UNKNOWN | UNKNOWN | UNKNOWN | Yes |

Marvnor scored 20/20, DeepSeek 15/20, and the local exact-computation baseline 20/20. The five differences were q02, q03, q04, q09, and q16: four unknown claims were labeled false, and one explicit negative in the specified environment was missed.

DeepSeek also returned UNKNOWN for the conflict questions q11 and q20. This group does not show that the model cannot recognize conflicts at all. All 20 Marvnor answers contained the six required fields.

### Comparison scope for A and B

- Both sides received the same facts and questions. Marvnor received structured data; the model read text. Reference answers were kept in the scoring step, not sent in the requests. This review independently rechecked the expected values using path computation and time/environment filtering.
- The prompt explained the rules for unknown, false, and conflicting evidence. The script requested `deepseek-chat`; the saved response identified `deepseek-flash`. Temperature was 0 and the output limit was 1,100 tokens. One model response was retained per group; no statistical-significance claim is made.
- IMPLIES follows the three-valued rule specified before scoring: an unknown premise yields unknown. This is a test contract, not a definition of every formal logic.
- The comparison is between a verification component and model text answers. There is no final-answer arm using Marvnor plus the same LLM. The result must not be presented as a 20% or 25% general capability improvement, or extended to every model.
- The local exact baseline also answered every question correctly. These runs do not establish superiority over exact algorithms. Facts were already structured, so natural-language extraction quality was not tested.
- A separate B-group probe of an outer wrapper around a compound question returned HTTP 400 and was not part of the 20 valid-format questions. The current review confirmed that this old shape is still rejected, while the documented `scope` operator supports time/context compound queries. It would be wrong to describe the whole feature as unsupported. See the [current API reference](../../../PUBLIC_EVALUATION_API.md).

## 4. Group C: seven generated datasets, three input versions

Each base dataset contained 185 facts, including time, environments, long chains, cycles, conflicts, and 120 random distractors. Twenty question templates were instantiated across seven generated datasets.

| Seed | Base facts | Original | Shuffled | Duplicated evidence | Conclusions across versions |
| --- | ---: | ---: | ---: | ---: | --- |
| 7000 | 185 | 20/20 | 20/20 | 20/20 | Unchanged |
| 7001 | 185 | 20/20 | 20/20 | 20/20 | Unchanged |
| 7002 | 185 | 20/20 | 20/20 | 20/20 | Unchanged |
| 7003 | 185 | 20/20 | 20/20 | 20/20 | Unchanged |
| 7004 | 185 | 20/20 | 20/20 | 20/20 | Unchanged |
| 7005 | 185 | 20/20 | 20/20 | 20/20 | Unchanged |
| 7006 | 185 | 20/20 | 20/20 | 20/20 | Unchanged |

The review checked every saved answer directly. All 140/140 base instances matched expectations. With two variants, all 420/420 judgments matched their expected values, and all six fields were present. All 21 requests returned HTTP 200.

Stability means unchanged conclusions across versions, not identical text in every field. Original, shuffled, and duplicated versions contained 185, 185, and 195 facts respectively. They are not 420 independent new questions and do not establish safety at arbitrary lengths or under arbitrary interference.

The `randomized_invariance.rows` array in [data.json](data.json) contains all 420 results by seed, version, and question.

## 5. Groups D and E: compound conditions and repeated concurrency

| Measure | D | E |
| --- | ---: | ---: |
| Facts per request | 200 | 200 |
| Questions per request | 20 | 20 |
| Base judgments matching expectations | 20/20 | 20/20 |
| Concurrent repetitions | 10 | 20 |
| HTTP 200 responses | 10/10 | 20/20 |
| Questions matching expectations per request | 20/20 every time | 20/20 every time |
| Concurrent judgments | 200 | 400 |
| Request-time range | 478.33 to 1,951.52 ms | 300.17 to 1,365.96 ms |
| Median request time | No claim made | 597.245 ms |

D included a 50-hop chain with Chinese, emoji, slash, and version-number identifiers; 15 converging branches; cycles; time/environment conditions; and 10 nested NOT operators. E included more alternative paths, 64 nested NOT operators, and compound conditions.

The base answers in D and E contained all six fields. E also retained complete-field counts for each concurrent request. Concurrent records store conclusions and score summaries, not each full response transcript. This review checked all saved conclusions, not just report headlines.

These were short runs of identical requests, not long-running capacity tests across multiple customers or mixed reads and writes. Times measure an entire request, not each question, and are not promises for the current deployment. D's format and multi-hop boundary probes were recorded separately; its main score does not cover them.

## 6. Group F: model input, not total cost

| Synthetic history length | Full-history input | Relevant-results input | Input reduction | Both answers |
| --- | ---: | ---: | ---: | --- |
| 8 turns | 310 | 95 | 69.4% | PostgreSQL |
| 40 turns | 1,366 | 95 | 93.0% | PostgreSQL |
| 160 turns | 5,328 | 95 | 98.2% | PostgreSQL |

Units are `prompt_tokens` returned by the model, not character-count estimates. Each row measures the final question at that history length, not cumulative usage over all turns.

The question was the same database-fact query. Facts were already structured, and Marvnor verification ran locally. The public API integration was not tested end to end. Costs for extraction, updates, retrieval, query preparation, and Marvnor were not included. In the 160-turn example, the full-history path had 512 cache-hit tokens and the compact path had 0; cache pricing also affects the bill.

The supported claim is that these three examples reduced repeated model reading while preserving the final answer. They do not establish 98.2% total cost savings or unchanged quality on every task.

## 7. Group G: use verification signals in a confirmation workflow

The local application integrated Marvnor over HTTP with Qwen3:4B in eight scenarios. Confirmations were simulated by the test, not provided by real customers.

| Scenario | Initial state | Final state | Model called in final stage | Workflow checks |
| --- | --- | --- | --- | --- |
| G1 | awaiting_confirmation | answered | Yes | Passed |
| G2 | answered | answered | Yes | Passed |
| G3 | awaiting_confirmation | answered | Yes | Passed |
| G4 | rendering_rejected | rendering_rejected | Yes | Passed |
| UNKNOWN | unknown | unknown | No | Passed |
| POSITIVE_CONFIRMATION | awaiting_confirmation | answered | Yes | Passed |
| PERSISTENT_CONFLICT | awaiting_confirmation | awaiting_confirmation | No | Passed |
| UNSUPPORTED | unverified | unverified | No | Passed |

`answered` means an answer was produced; `awaiting_confirmation` means confirmation was needed; `unknown` means evidence was insufficient; `unverified` means verification was not completed; `rendering_rejected` means the model's generated answer failed the integration check.

There were five actual model calls. Four produced accepted answers. One repeated the question, so the integration rejected it and fell back to the verification result. Persistent conflict, insufficient evidence, and missing structured queries did not go directly to the model for a guess. The 8/8 score covers expected workflows and checks on what input was forwarded, not 100% final-answer accuracy.

This shows that an integration can control its workflow using verification signals. It does not mean the public API implements pausing, dialogs, or human confirmation for the customer. The run did not establish the ability to verify the semantics of arbitrary natural-language answers.

## 8. Group H: correction and cleanup during continued use

The following checks were rerun on October 10, 2026, with isolated temporary data:

- 23 memory-interface tests passed.
- Four customer-documentation checks passed: three functional tests and one check of links, JSON, and public-information boundaries.

| Customer action | Observed result |
| --- | --- |
| Change a saved state to a new value | Edit succeeded; the new state evaluated as TRUE |
| Delete a specified test fact | Only the selected record was removed; the old claim evaluated as UNKNOWN |
| Clean up an import batch | Pre-existing and subsequently reused records were preserved |
| Remove 1,200 test records in one request | Deletion count was 1,200; test memory was empty |
| Continue management after restart | Original record receipts remained usable |
| Submit an incomplete or ambiguous selector | Request rejected without deleting existing data |
| Attempt deletion with an invalid or another key | The target key's records could not be deleted |
| Read verification and management responses | Verification retained six fields; management returned necessary acknowledgements |

These are 27 checks, not 27 real customer cases. Local tests do not establish a security audit of the entire production workflow. The collection makes no broader claim about account permissions or billing.

## 9. How to cite these results

Keep the date, sample conditions, and environment with any figures. Do not count repeated requests as new questions, equate model-input reduction with total savings, or extend structured verification results to general writing, translation, mathematics, or coding capability.

Earlier versions also had failing examples. This collection selects traceable tests that illustrate specific uses; it does not endorse every version or every scenario.

[Results and source SHA-256 fingerprints](data.json) · [Benefits overview](highlights.md) · [Current customer documentation](../../../USAGE.md)
