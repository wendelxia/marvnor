# Marvnor Truth-Preserving Decision Gateway

When an LLM faces long documents, complex conditions, or contradictory records, a fluent answer is not necessarily a reliable judgment. Marvnor is a gateway alongside an existing LLM: the application sends the question and relevant evidence through it, and receives judgment results that help distinguish supported conclusions, refuted conclusions, insufficient evidence, and conflicting sources.

It is intended for evidence-based use cases such as enterprise RAG, intelligent customer service, compliance review, and data analysis. The application does not need to replace its main model or build a knowledge graph covering the entire business in advance.

## Six results

| Result | What it tells the application |
|---|---|
| `conclusion` | Whether the conclusion is `TRUE`, `FALSE`, or temporarily undetermined as `UNKNOWN`. |
| `evidence_kind` | Whether the evidence is direct, indirect, composite, conflicting, or unknown. |
| `conflict` | Whether applicable submitted facts conflict, including facts already saved under the same key. |
| `reason` | A short code explaining the current judgment. |
| `decision` | A signal for the next handling step; the application decides the final action. |
| `path` | A relevant evidence path, or known candidate values when `target` is omitted; compound queries and output limits may also leave it empty. |

For example, if two sources provide opposite evidence for the same question, Marvnor returns `UNKNOWN` and marks the conflict. The application can ask the model to explain the conflict, ask for more information, or route the case to a human reviewer. Marvnor does not invent material that was not supplied to it.

Ordinary custom attributes are single-valued by default: incompatible values in compatible contexts and overlapping validity periods are a conflict. Defined multi-valued types, such as `supports`, can have multiple objects. [See the API contract](PUBLIC_EVALUATION_API.md) for structured input, candidate queries, and the exact six-field response. A supported claim is not an independent guarantee about the real world.

## Observed results

In one 10-question comparison run by the project team, the average score on five context tasks rose from 94.44 to 100 after Marvnor was connected; the translation task rose from 88.89 to 100, and the project-rule code task rose from 83.33 to 100. The same run showed no score drop on the creative, mathematics, or academic questions. [See the other public tests](TESTS.md).

[Open the user portal](https://api.marvnor.com/) · [Run the quickstart](USER_QUICKSTART.md) · [Read the usage guide](USAGE.md) · [Contact us about testing](mailto:wendelxia@gmail.com)
