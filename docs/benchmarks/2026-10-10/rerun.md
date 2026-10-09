# Live rerun of the historical evidence

Tested on October 10, 2026 (Asia/Shanghai). These are new public-service and model calls, not a recount of saved answers.

The rerun covers the eight groups in the [previous evidence collection](methods.md), plus earlier temporal and five-hop `supports` failures. It does not cover every benchmark ever run by the project. This is a project-run test, not an independent third-party audit.

[Sanitized per-question data and request timings](rerun-results.json) · [Eight tested benefits](highlights.md)

## Results

| Test | Earlier result | Fresh result |
| --- | --- | --- |
| A: long chains, conflicts and compound logic | Marvnor 20/20; DeepSeek 16/20 | Live Marvnor 20/20; three DeepSeek runs each 16/20 |
| B: time, environments and compound logic | Marvnor 20/20; DeepSeek 15/20 | Live Marvnor 20/20; DeepSeek 14/20, 15/20 and 15/20 |
| C: seven datasets in original, shuffled and duplicated forms | 420/420 expected verdicts | Live 420/420 across 21 requests |
| D: complex conditions, 10 concurrent repetitions | Each request 20/20 | Each request 20/20; median 284.185 ms |
| E: deep logic, 20 concurrent repetitions | Each request 20/20; median 597.245 ms | Each request 20/20; median 603.455 ms |
| F: final query after 8, 40 and 160 history turns | Input reduced by 69.4%, 93.0% and 98.2% | Same reductions; all six model answers correct |
| G: conflict confirmation, unknown blocking and answer generation | 8/8 workflows; four of five model answers accepted | 8/8 workflows; four accepted, one rejected with fallback |
| H: memory maintenance and customer examples | 23 + 4 local checks passed | All 23 + 4 checks passed again |
| Earlier temporal/context set | 19/20 | Live 20/20, plus 7/7 temporal edge cases |
| Earlier five-hop supports failure set | Each of five variants 19/20 | Each variant 20/20; 100/100 verdicts |

All **62 scored public requests** returned HTTP 200. All **1,227 expected verdicts** matched, with exactly six fields in each answer. The count includes input variants and concurrent repetitions; it is not 1,227 independent questions. There were also 12 fresh DeepSeek calls and five fresh local Qwen calls.

An initial, unscored configuration probe returned 401 because it used a local-environment key. After switching to the authorized public test key, all scored requests succeeded. Public calls used request-local temporary facts; no customer memory was written or deleted.

## Model comparison and observed errors

A and B reused the original questions, prompts, model settings and scoring rules. Each group was sent to DeepSeek three times. The request model was `deepseek-chat`; every response identified `deepseek-flash`. Temperature was 0, the output limit was 1,100 tokens, and JSON output was requested. All six responses completed all 20 answers with `finish_reason: stop`; none was truncated.

The four recurring A errors turned `UNKNOWN` into `FALSE`, including conflict cases. In B, the recurring errors turned missing or inapplicable evidence into `FALSE` and missed an explicit negative in staging. The first B run also answered `TRUE` for q20_nested_conflict, whose expected result was `UNKNOWN`. These describe the returned answers, not a claim about the model's internal reasoning.

Both systems received the same facts and questions, but Marvnor received structured inputs while DeepSeek read text. There was no final-answer comparison of the same LLM with and without Marvnor. These scores therefore do not measure general LLM capability improvement. The historical exact-computation baseline also scored 20/20 in each group. Facts were already structured, so extraction quality was not tested.

### Group A: all 20 questions

| ID | Question | Expected | Marvnor, live | DeepSeek 1 | DeepSeek 2 | DeepSeek 3 |
| --- | --- | --- | --- | --- | --- | --- |
| q01_chain_forward | Follow a 99-hop dependency chain | TRUE | TRUE | TRUE | TRUE | TRUE |
| q02_chain_reverse | Do not reverse the dependency direction | UNKNOWN | UNKNOWN | FALSE | FALSE | FALSE |
| q03_chain_mid | Verify a middle section of a long chain | TRUE | TRUE | TRUE | TRUE | TRUE |
| q04_branch_converges | Multiple branches converge on one target | TRUE | TRUE | TRUE | TRUE | TRUE |
| q05_scc_forward | Forward reachability within a cycle | TRUE | TRUE | TRUE | TRUE | TRUE |
| q06_scc_reverse | Reverse reachability within a cycle | TRUE | TRUE | TRUE | TRUE | TRUE |
| q07_direct_conflict | Positive and negative evidence for the same claim | UNKNOWN | UNKNOWN | FALSE | FALSE | FALSE |
| q08_direct_negative | Explicit negative evidence | FALSE | FALSE | FALSE | FALSE | FALSE |
| q09_noise_isolated | Distractors cannot fill missing evidence | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| q10_chinese_forward | Follow business steps with Chinese labels | TRUE | TRUE | TRUE | TRUE | TRUE |
| q11_chinese_reverse | Chinese-labeled steps cannot be reversed either | UNKNOWN | UNKNOWN | FALSE | FALSE | FALSE |
| q12_composite_and_true | Multiple conditions hold together | TRUE | TRUE | TRUE | TRUE | TRUE |
| q13_composite_and_unknown | One condition lacks evidence | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| q14_composite_or_true | One of several alternatives holds | TRUE | TRUE | TRUE | TRUE | TRUE |
| q15_composite_not_true | Negate a supported condition | FALSE | FALSE | FALSE | FALSE | FALSE |
| q16_implies_true | A supported premise followed by a supported consequence | TRUE | TRUE | TRUE | TRUE | TRUE |
| q17_implies_vacuous | Keep an unknown premise undetermined | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| q18_nested_conflict | Preserve conflict inside nested conditions | UNKNOWN | UNKNOWN | FALSE | FALSE | FALSE |
| q19_composite_deep | Combine multiple layers of conditions | TRUE | TRUE | TRUE | TRUE | TRUE |
| q20_redundant_path | Duplicate or alternative evidence preserves the conclusion | TRUE | TRUE | TRUE | TRUE | TRUE |

### Group B: all 20 questions

| ID | Question | Expected | Marvnor, live | DeepSeek 1 | DeepSeek 2 | DeepSeek 3 |
| --- | --- | --- | --- | --- | --- | --- |
| q01_long_chain_july | 79-hop chain within its validity window | TRUE | TRUE | TRUE | TRUE | TRUE |
| q02_long_chain_march | 79-hop chain before all evidence becomes valid | UNKNOWN | UNKNOWN | FALSE | FALSE | FALSE |
| q03_long_chain_october | 79-hop chain after some evidence expires | UNKNOWN | UNKNOWN | FALSE | FALSE | FALSE |
| q04_long_chain_reverse | Query the dependency chain in reverse | UNKNOWN | UNKNOWN | FALSE | FALSE | FALSE |
| q05_chain_middle | Verify a middle section of a long chain | TRUE | TRUE | TRUE | TRUE | TRUE |
| q06_alternate_july | Use the alternative path valid in July | TRUE | TRUE | TRUE | TRUE | TRUE |
| q07_alternate_february | Use a different path valid in February | TRUE | TRUE | TRUE | TRUE | TRUE |
| q08_context_production | Indirect dependency in production | TRUE | TRUE | TRUE | TRUE | TRUE |
| q09_context_staging | Explicit negative evidence in staging | FALSE | FALSE | UNKNOWN | UNKNOWN | UNKNOWN |
| q10_mixed_context | Do not combine production and staging evidence | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| q11_conflict_june | Conflicting evidence valid at the same time | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| q12_conflict_february | Negative evidence has not yet become valid | TRUE | TRUE | TRUE | TRUE | TRUE |
| q13_conflict_september | Negative evidence has expired | TRUE | TRUE | TRUE | TRUE | TRUE |
| q14_explicit_negative | Explicit negative evidence | FALSE | FALSE | FALSE | FALSE | FALSE |
| q15_scc_reverse_july | Cycle within its validity window | TRUE | TRUE | TRUE | TRUE | TRUE |
| q16_scc_reverse_march | Cycle evidence has not yet become valid | UNKNOWN | UNKNOWN | FALSE | FALSE | FALSE |
| q17_noise_unknown | Distractors cannot fill missing evidence | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| q18_and_true | Both conditions have support | TRUE | TRUE | TRUE | TRUE | TRUE |
| q19_and_unknown | One condition lacks evidence | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |
| q20_nested_conflict | Preserve conflict in a compound judgment | UNKNOWN | UNKNOWN | TRUE | UNKNOWN | UNKNOWN |

## Stability, complex logic and earlier failures

Group C used seven seeds, 20 question templates per seed and three input forms. All 420 verdicts matched. Shuffling or duplicating evidence did not change the tested conclusions; that does not imply identical wording in every response field or resistance to arbitrary noise.

Groups D and E each also passed their 20-question base request. D included Chinese and special-character identifiers. E included 64 nested NOT operators, alternative paths and an OR expression containing 440 atom occurrences. These are structured logic examples, not translation or general mathematics tests.

The earlier temporal set now passed 20/20, and its seven edge cases passed. The earlier set containing the failing five-hop `supports` case passed in all five forms: original, shuffled, duplicated, renamed and with distractors. Each form had 20 questions. The old failures no longer describe these tested cases in the current version; they do not establish that every custom predicate is transitive.

Saved-record conflict detection, candidate queries and in-place editing also have [14 targeted local checks from the earlier same-day review](current-version.md#fourteen-targeted-checks). Those checks remain separately labeled as local evidence, rather than being counted in the public rerun.

## Short concurrency runs

| Measure | D | E |
| --- | ---: | ---: |
| Concurrent requests | 10 | 20 |
| Questions per request | 20 | 20 |
| HTTP 200 responses | 10/10 | 20/20 |
| Expected verdicts per request | 20/20 every time | 20/20 every time |
| Median request time | 284.185 ms | 603.455 ms |
| Request-time range | 163.66 to 400.17 ms | 313.44 to 859.78 ms |

E's median was slightly slower than the historical 597.245 ms, with no verdict regression or HTTP error. D's earlier range was 478.33 to 1,951.52 ms; no historical median is claimed.

Times cover the whole request from the test computer to the public service, including network and client overhead. These were short runs repeating the same workload, not sustained mixed read/write traffic across many customers. They do not establish maximum production capacity.

## Model input and cache usage

These are actual provider-reported input and cache tokens from six fresh DeepSeek calls, using the same question at three synthetic history lengths.

| History length | Full-history input | Relevant-results input | Input reduction | Full-history cache-hit tokens |
| --- | ---: | ---: | ---: | ---: |
| 8 turns | 310 | 95 | 69.4% | 128 |
| 40 turns | 1,366 | 95 | 93.0% | 1,152 |
| 160 turns | 5,328 | 95 | 98.2% | 5,120 |

Both paths answered PostgreSQL at every length, with two output tokens per answer. Every compact-input call had zero cache-hit tokens.

The 160-turn full-history run had 5,120 cache-hit tokens this time, versus 512 in the historical run. Most of its input could therefore be billed at the provider's cache-hit rate. A 98.2% reduction in input is not a 98.2% reduction in model charges or total customer cost.

The experiment reused a prepared structured fact and verified it with the current local, memory-only core. It was not an end-to-end public API cost test. Extraction, updates, retrieval, query preparation and Marvnor fees were excluded. Each row measures the last query at that history length, not a cumulative 160-turn bill or quality across multiple tasks.

## Gateway workflow and memory maintenance

The original eight workflow fixtures ran again through an isolated local HTTP instance and the original Qwen3:4B renderer. All eight status, forwarding and blocking checks passed. Five cases called the model: four answers were accepted, while G4 repeated the question and was rejected with a fallback to the verification result.

Unknown, persistent conflict and unsupported structured input did not lead directly to a model guess. Confirmation was simulated by the test. Each fixture used fresh isolated memory, and the forwarding checks ensured that full history and irrelevant facts did not reach the model. This is evidence for the tested application workflow, not eight perfect model answers or a claim that the public API supplies a customer dialog.

The maintenance rerun passed 23 memory-interface checks and four customer-example checks. Three of the latter were functional; one checked links, JSON and public-information boundaries. These were isolated local tests, not a production deletion-speed measurement or a full security audit.

## Method, version and counting

- A, B, D and the temporal cases reused saved request payloads. C, E and the five-variant set used the original deterministic generators with fresh synthetic namespaces. Expected answers were checked against the archives, and E's structure was also checked. Regenerated names mean those inputs were not byte-identical.
- A and B preserved the original model prompts. Reference answers remained in scoring and were not sent to the model. F preserved the original synthetic histories, question and model settings.
- The 62 scored public requests comprise four base requests (A, B, D, E), 30 concurrent repetitions, 21 C variants, and seven earlier-failure or boundary requests. Their verdict counts are 80 + 600 + 420 + 127 = 1,227.
- A read-only post-run check matched 21 relevant running source files to the local tested source. No service deployment or product change was made for this rerun. This does not equate local and production configuration or capacity.
- Review checked fresh response IDs, question construction, scores, counts and publication boundaries. The [public JSON](rerun-results.json) includes row-level outcomes, timings, model settings, prompt fingerprints and raw-artifact fingerprints, but no credentials, internal source, deployment configuration or complete test inputs.
- Older ProofWriter 30/200, NLGraph 90 and the 10-question general-capability summary were not rerun. They remain [historical reports](../../../TESTS.md#historical-reports-october-4-to-5-2026), not current-version scores.

The supported findings are targeted structured verification, stability across the tested input variants, reusable facts, and application handling of conflicts or uncertainty. They do not establish broad improvements in writing, translation, pure mathematics or ordinary code generation.

[Evidence index](README.md) · [Previous local review](current-version.md) · [Historical methods](methods.md) · [Historical data](data.json)
