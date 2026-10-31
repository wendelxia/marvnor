# Marvnor Reports Results for Its Truth-Preserving Model System: 40 Record-Verification Questions Correct, 98.2% Less Input in a Long-Conversation Example

November 1, 2026

[中文版](docs/news/2026-11-01-results.zh-CN.md) · [Read on the website](https://wendelxia.github.io/marvnor/news.html)

Two structured verification sets: all 40 questions correct. Across 62 scored requests, all 1,227 judgments matched expectations. In a 160-turn conversation example, input for the final question fell from 5,328 to 95 tokens.

Marvnor, a Truth-Preserving Model System, has published its October 2026 public-service test results. It answered all 40 questions correctly across two structured verification sets based on supplied records, scoring above a general-purpose large language model answering directly from text in both sets. In a separate 160-turn synthetic-history test, using prepared relevant results for the same final question reduced model input from 5,328 to 95 tokens, a 98.2% reduction. Both approaches answered correctly.

## Fluent language is not the same as a reliable judgment

AI applications need more than fluent answers. Requirements confirmed last Friday, architecture decisions made last week and business rules agreed earlier can fall outside a conversation's available context, requiring users to explain them again. Missing evidence and contradictory evidence create another difficulty: an answer can sound convincing even when the underlying issue needs clarification.

Marvnor helps AI applications retain important information that has been confirmed or has an identifiable source. When a new question depends on that information, the system checks it against saved records, distinguishes support, explicit refutation and insufficient evidence, flags conflicting claims, and supports correction and deletion of outdated records.

The team's principle is to check the evidence before giving an answer, so important project judgments can be inspected, updated and corrected.

## Five groups of results

**More accurate judgments.** Two sets of 20 questions covered long dependencies, time constraints, different environments, explicit negatives and conflicting evidence. Marvnor scored 20/20 in both. The general-purpose model's direct text answers were repeated three times: 16/20 in every run for the long-chain and conflict set, and 14/20, 15/20 and 15/20 for the time and environment set. Recurring errors included treating insufficient evidence as refutation. Marvnor distinguished supported claims, explicit negatives and insufficient evidence, while retaining conflict signals in compound judgments.

**Less repeated input in long conversations.** For the same final question after 8, 40 and 160 synthetic history turns, model input fell by 69.4%, 93.0% and 98.2%, respectively. Both approaches answered correctly at each length. In the 160-turn example, 95 input tokens replaced 5,328: the current question used relevant prepared information instead of the entire conversation.

**Stable results across tested variants.** Seven datasets, each tested in original, shuffled and duplicated forms, produced 420 expected judgments with no mismatches. The complete public-service rerun successfully returned all 62 scored requests and matched all 1,227 expected judgments. In these tests, changes in input order and duplicate evidence did not change the conclusions.

**Conflicts can be managed.** When two incompatible values were saved for a single-valued attribute in the same context, local saved-memory checks flagged the conflict and surfaced both values without choosing one. Deleting one restored support for the other. In-place correction and targeted deletion also passed: all 23 memory-function checks and 4 customer-example checks succeeded. Outdated facts and test data could be changed or removed while retaining unrelated project memory.

**Complex logic under concurrent requests.** Marvnor correctly checked a 99-hop dependency chain and a 79-hop time-constrained chain. The time and environment set scored 20/20, with 7 additional time-boundary cases passing. A five-hop custom-relation set scored 100/100 across original, shuffled, duplicated, renamed and distractor variants. In deep-logic cases containing 64 nested negations and an OR expression with 440 atom occurrences, each of 20 concurrent requests returned all 20/20 expected judgments. Median whole-request time was 603 milliseconds; another group of 10 concurrent requests had a median of 284 milliseconds.

## One order cannot be both pending and paid at the same time

A public demonstration recorded on October 10, 2026 used a familiar business problem: records disagree about the payment status of the same order in the same context.

The five stages were explicit. First, saving “pending” made that status supported. Adding “paid” produced a conflict requiring review. Removing the incorrect record restored support for “pending.” Correcting the remaining record to “paid” supported the new status while leaving no evidence for the old one. Finally, only the demonstration's own records were deleted; other project memory was unaffected.

The system provides the judgment together with its basis and conflict information. Applications can use that result to answer, ask for clarification or request human review.

## Where the system is useful

Paired tests reported on October 25, 2026 recommend using Marvnor for questions that depend on saved project facts, constraints, decisions, states or path evidence. They did not show a benefit for general tasks with no relevant project memory: corrected scores tied at 44/59 across 59 questions, while the Marvnor approach used 6.8% more model tokens.

The same report found that prepared records did not replace source code. On 6 questions from a pinned version of the requests repository, reading source directly scored 6/6; substituting extracted facts scored 0/6. On 19 complete paired LongProc high-hop path questions, however, both approaches scored 19/19, and median answer latency was 33.9% lower with Marvnor.

Correct conclusions are not a substitute for complete evidence. On an unseen 359-hop LongProc question, a 4B model told only that a path existed, without receiving the path itself, invented a route that was wrong from the first hop. Such tasks require checking the judgment and its evidence, not merely the conclusion.

## Try it and inspect the results

Developers can request a trial without registering: 500 points, valid for 30 days. Registration provides a separate 1,000 points under the current offer.

The published five-stage example saves synthetic facts, creates and resolves a conflict, corrects a record, and removes only its own test data. All five stages must pass, and each judgment can be inspected. Recorded results are also available to view without using trial points.

Using Marvnor does not require rebuilding an existing application from scratch. The project has published test reports, methods, question-level results and functional checks for review.

## Test scope

These are project-team tests, not an independent third-party audit. The 98.2% figure describes input reduction for the same final model request, not an equivalent reduction in total costs or the bill. The 1,227 judgments include input variants and concurrent repetitions, not 1,227 independent questions.

Both sides received the same facts and questions, but verification questions were supplied as structured records to Marvnor and as text to the comparison baseline. These results do not measure an improvement in general language-model capability. Facts were already prepared; the comparison did not test automatic extraction.

The October 4–5, 2026 ProofWriter results—12/30 to 30/30 on 30 questions, and 52/200 to 200/200 on 200 questions—and NLGraph connectivity results—78/90 to 90/90 on 90 questions—are labeled historical reports. Public documentation and test data are licensed under CC BY 4.0, with attribution to Marvnor / wendelxia.

## About Marvnor

Marvnor is a Truth-Preserving Model System that helps AI applications retain important project information, check judgments against saved records, identify conflicts, and correct or update records as a project progresses. Less repeated explanation, with evidence that can be checked.

[Visit Marvnor](https://marvnor.com) · [Start using it](https://api.marvnor.com/docs?lang=en)

Media and developer contact: [wendelxia@gmail.com](mailto:wendelxia@gmail.com). Bring a concrete use case and non-sensitive sample data. Do not include account credentials or sensitive material you are not authorized to share.

## Reports and evidence

- [October 10 report and methods](docs/benchmarks/2026-10-10/rerun.md) · [Question-level results](docs/benchmarks/2026-10-10/rerun-results.json)
- [Local memory-function checks](docs/benchmarks/2026-10-10/current-version.md)
- [October 25 recommended-use study](docs/benchmarks/2026-10-25/recommended-usage.md)
- [Recorded five-stage demonstration](examples/recorded-run.json)
- [Historical test index](TESTS.md)
