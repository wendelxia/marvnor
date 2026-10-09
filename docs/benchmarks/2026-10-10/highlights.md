# Marvnor: eight benefits demonstrated by tests

Verify facts before generating an answer. Detect conflicting records, reuse confirmed memory and send the LLM only what the current question needs.

The October 10, 2026 public rerun returned **1,227/1,227 expected verdicts across 62 requests**, including input variants and concurrent repetitions. Local feature and maintenance tests checked saved-memory operations. Each result below links to its evidence.

## 1. More accurate fact verification

In two 20-question sets, Marvnor's structured verification scored 20/20 each. DeepSeek's text answers were rerun three times: A scored 16/20 each time; B scored 14/20, 15/20 and 15/20. The questions covered long chains, explicit negatives, missing evidence and conflicts.

Marvnor made more accurate judgments on these fact-verification tasks. It preserved the distinction between a false claim, an unsupported claim and conflicting evidence, so the application could act on the right result.

[All 40 questions and model answers](rerun.md#model-comparison-and-observed-errors)

## 2. Follow long dependency chains

Marvnor correctly verified a 99-hop dependency chain and a 79-hop chain with time constraints. The five-hop `supports` test set passed all 100 judgments across original, shuffled, duplicated, renamed and distractor variants.

This lets an application check distant dependencies and prerequisites from the supplied evidence. Direction, intermediate links and alternative paths remain part of the verification.

[Chain and variant results](rerun.md#stability-complex-logic-and-earlier-failures)

## 3. Keep facts in the right time and context

The temporal/context set passed 20/20 questions, plus seven temporal edge cases. Scoped compound checks used evidence valid in the selected period and environment. Supplied facts without time restrictions remained usable in timed queries.

Marvnor can distinguish what applies now, what applied earlier and what belongs to a different environment. Applications can combine time and context with compound conditions in one verification request.

[Temporal results](rerun.md#stability-complex-logic-and-earlier-failures) · [Scoped-query feature checks](current-version.md#fourteen-targeted-checks)

## 4. Detect conflicts across saved records

In the local saved-memory test, two incompatible values of the same single-valued attribute caused both queries to return `UNKNOWN` with `conflict: true`. A candidate query returned both values. Removing one conflicting record made the remaining value supported.

Marvnor manages conflicts across saved records, not just evidence submitted together. The application can show the competing values, ask for confirmation and verify the corrected memory.

[Saved-record conflict and correction checks](current-version.md#fourteen-targeted-checks)

## 5. Preserve conclusions when inputs are reordered or repeated

Seven datasets were each tested in original, shuffled and duplicated forms. All 420 judgments matched their expected results across 21 public requests.

Input order and duplicate evidence did not change the conclusions. This supports repeated synchronization of project facts while keeping verification results consistent.

[Stability results](rerun.md#stability-complex-logic-and-earlier-failures)

## 6. Evaluate complex conditions in batches

Both complex-logic groups passed 20/20 questions. Cases included alternative paths, time and conflicts, 64 nested NOT operators and an OR expression containing 440 atom occurrences.

In short concurrent runs, all 10 requests in D and all 20 requests in E returned 20/20 expected verdicts each. Median whole-request times were 284 ms and 603 ms respectively.

Marvnor handled these nested conditions and concurrent batches correctly, giving applications one place to verify several connected requirements.

[Complexity and concurrency measurements](rerun.md#short-concurrency-runs)

## 7. Reduce repeated model input

Six fresh model calls compared full synthetic history with prepared relevant results for the same final question:

| History length | Full-history input | Relevant-results input | Input reduction |
| --- | ---: | ---: | ---: |
| 8 turns | 310 tokens | 95 tokens | 69.4% |
| 40 turns | 1,366 tokens | 95 tokens | 93.0% |
| 160 turns | 5,328 tokens | 95 tokens | 98.2% |

Both paths answered correctly at every length. Reusing relevant facts reduced model input by 98.2% in the 160-turn example while preserving the answer.

The application workflow was also tested: eight local gateway scenarios passed their flow checks, including conflict confirmation, stopping on insufficient evidence and rejecting an unusable model answer.

[Token measurements and accounting](rerun.md#model-input-and-cache-usage) · [Gateway workflow](rerun.md#gateway-workflow-and-memory-maintenance)

## 8. Keep memory accurate as the project changes

Local feature tests confirmed that an in-place edit made the new value supported and the previous value unknown. Targeted deletion removed the chosen fact while preserving unrelated records. The maintenance rerun passed all 23 memory-interface checks and four customer-example checks.

Applications can correct outdated facts, clean up test imports and retain the rest of their project memory. Record receipts remained usable after restart.

[Memory tests](rerun.md#gateway-workflow-and-memory-maintenance) · [How to edit and delete records](../../customer/record-management.md)

---

[Full test report and methods](rerun.md) · [Per-question data](rerun-results.json) · [Local feature review](current-version.md) · [Historical methods](methods.md) · [Historical data](data.json) · [Integration guide](../../customer/llm-integration.md)
