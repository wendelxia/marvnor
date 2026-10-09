# Marvnor reports stronger fact verification and a 98.2% input reduction in a long-history test

October 10, 2026

[中文版](docs/news/2026-10-10-benchmark-results.zh-CN.md)

Marvnor today published new test results for its truth-preserving specialized model system. Its structured verification answered all 40 questions correctly across two fact-checking sets, outperforming DeepSeek's direct text answers in each set. In a separate 160-turn synthetic-history example, using prepared relevant facts reduced the model's final-query input from 5,328 to 95 tokens while preserving the correct answer.

Marvnor works in front of an existing large language model. It verifies facts, detects conflicting records and maintains reusable project memory. The application sends the current question and relevant Marvnor results to the LLM, which writes the answer.

## More accurate judgments on complex facts

The comparison covered long dependency chains, time constraints, environments, explicit negatives and conflicting evidence. Both systems received the same facts and questions: Marvnor as structured input, DeepSeek as text.

| Test set | Marvnor | DeepSeek text answers, three fresh runs |
| --- | ---: | --- |
| Long chains, conflicts and compound logic | 20/20 | 16/20, 16/20, 16/20 |
| Time, environments and compound logic | 20/20 | 14/20, 15/20, 15/20 |

Marvnor correctly separated supported claims, explicit negatives and insufficient evidence. It also preserved conflict signals inside compound judgments. The results show more accurate fact verification on these tasks, giving applications a clear basis for answering or requesting clarification.

## Less repeated reading in long conversations

The history experiment compared the same final question using full conversation history and prepared relevant results. At 8, 40 and 160 synthetic history turns, model input fell by 69.4%, 93.0% and 98.2%, respectively. Both paths answered correctly at every length.

This demonstrates the value of reusable facts: the model can receive the information needed for the current question without repeatedly reading the entire conversation. The 160-turn example used 95 input tokens instead of 5,328.

## Conflict management that continues across saved records

Local saved-memory tests confirmed that Marvnor detects incompatible values stored for the same single-valued attribute. Both queries were marked as conflicting, and a candidate query returned the competing values. Removing one conflicting record restored support for the remaining value.

In-place correction and targeted deletion also passed. Applications can update outdated facts or remove test data while keeping unrelated project memory. All 23 memory-interface checks and four customer-example checks passed.

## Stable results across variants and concurrent requests

Seven datasets tested in original, shuffled and duplicated forms produced 420/420 expected judgments. Other cases verified a 99-hop dependency chain and time-scoped compound logic.

In a short run of 20 concurrent requests, each containing 20 complex questions, every judgment matched its expected result. Median whole-request time was 603 milliseconds. Across the complete public rerun, all 62 scored requests succeeded and all 1,227 expected judgments matched, including input variants and concurrent repetitions.

## Available to developers

Marvnor is available through its [public API and customer portal](https://api.marvnor.com/). Developers can connect it to an existing LLM application over HTTPS without installing a Marvnor client. Each verification answer provides six fields covering the conclusion, evidence category, conflict, reason, decision signal and evidence path.

The project has published the [full report and methods](docs/benchmarks/2026-10-10/rerun.md), [question-level data](docs/benchmarks/2026-10-10/rerun-results.json) and [local feature checks](docs/benchmarks/2026-10-10/current-version.md).

[Get started](USER_QUICKSTART.md) · [Eight tested benefits](docs/benchmarks/2026-10-10/highlights.md)

Media and developer contact: [wendelxia@gmail.com](mailto:wendelxia@gmail.com)

---

[October 5 launch announcement](docs/news/2026-10-05-launch.md) · [Repository home](README.md)
