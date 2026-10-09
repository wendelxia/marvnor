# Marvnor Announces Public Launch of a Truth-Preserving Decision Gateway

**October 5, 2026**

Documentation update, October 10, 2026: English [customer guides](USAGE.md) and the [current API reference](PUBLIC_EVALUATION_API.md) are now available. The launch announcement and historical results below retain their original date.

Test evidence update, October 10, 2026: the [local review](docs/benchmarks/2026-10-10/current-version.md) passed 500/500 replay verdicts and 14/14 feature checks, including saved-record conflicts, candidate queries and editing.

Later rerun update, October 10, 2026: [fresh tests](docs/benchmarks/2026-10-10/rerun.md) matched 1,227/1,227 expected verdicts across 62 public requests, including variants and repetitions. Marvnor scored 20/20 in both fact-verification sets, ahead of DeepSeek's text answers in all three runs. The 160-turn synthetic-history example reduced final-query model input by 98.2% while keeping the answer correct. Read the [eight tested benefits](docs/benchmarks/2026-10-10/highlights.md) and [new data](docs/benchmarks/2026-10-10/rerun-results.json). The October 5 announcement below remains an archive of its original results.

Marvnor today opened its user portal to developers building evidence-based applications with large language models (LLMs). Marvnor is designed to work as a gateway alongside an existing model and help an application distinguish supported conclusions, insufficient evidence, and conflicting sources before deciding what to do next.

## A practical control layer for LLM applications

When an LLM works with long documents, complex conditions, or contradictory records, a fluent answer is not always a reliable judgment. Marvnor accepts the application’s question and relevant evidence through the gateway, then returns six machine-readable results:

- `conclusion`
- `evidence_kind`
- `conflict`
- `reason`
- `decision`
- `path`

The application remains in control. It can let the model answer, ask for more information, or route a case to a human reviewer. Marvnor does not require replacing the main model or building a full business knowledge graph in advance.

## Public test results

In tests run by the project team using public datasets and the live service:

- ProofWriter, 30 questions: 12/30 with the model alone versus 30/30 in the connected workflow.
- ProofWriter, 200 questions: 52/200 versus 200/200.
- NLGraph connectivity, 90 questions: 78/90 versus 90/90.

The project team also reported higher scores on its separate 10-question comparison for context, translation, and project-rule code tasks, with no score drop on its creative, mathematics, and academic questions. These results are project-run tests, not an independent third-party audit or a guarantee for every scenario. Full methods and data are available in the [public test report](TESTS.md).

## Try Marvnor

Marvnor is available at [marvnor.com](https://marvnor.com). Developers and researchers are invited to test questions whose answers they can verify and share results or counterexamples at [wendelxia@gmail.com](mailto:wendelxia@gmail.com). Please do not send account keys or sensitive material you are not authorized to share.

[Read the introduction](INTRODUCTION.md) · [Read the usage guide](USAGE.md) · [View the public tests](TESTS.md)
