# Marvnor

## Truth-Preserving Decision Gateway for LLM Applications

Marvnor verifies facts, detects conflicting records and gives LLM applications reusable project memory. Put it in front of your model: send the current question and relevant verification results to the LLM, which then writes the answer.

Use it to check project dependencies, business states, time-sensitive evidence and conflicting information. Keep confirmed facts between questions, correct them when they change, and pass only the results needed for the next answer.

[See the demo](https://wendelxia.github.io/marvnor/) · [Run the example](examples/README.md) · [API docs](PUBLIC_EVALUATION_API.md) · [Customer portal](https://api.marvnor.com/)

## Try it in one command

Download [quickstart.py](https://raw.githubusercontent.com/wendelxia/marvnor/main/examples/quickstart.py), then run:

```sh
python quickstart.py
```

Paste your API key at the hidden prompt. The example verifies a saved fact, detects conflicting values, resolves the conflict, corrects the fact, then deletes only its own demo data. Python 3.9+, no dependencies. Uses your account quota. [Setup and recorded results](examples/README.md).

Latest news, October 10: [Marvnor reports stronger fact verification and a 98.2% input reduction in a long-history test](NEWS.md) · [中文新闻稿](docs/news/2026-10-10-benchmark-results.zh-CN.md)

## Results that show the difference

October 10, 2026 rerun:

| Test | Result | What it demonstrates |
| --- | --- | --- |
| Two structured fact-verification sets | Marvnor: 20/20 in each. DeepSeek text answers across three runs: A 16/20 each; B 14/20, 15/20, 15/20 | More accurate judgments on the tested facts, including unknown and conflicting evidence |
| Final question after 160 turns of synthetic history | Model input: 5,328 to 95 tokens, a 98.2% reduction; both answers correct | Reusable relevant facts sharply reduce repeated model input |
| Original, shuffled and duplicated facts | 420/420 expected verdicts across seven datasets | Stable conclusions despite changes in input order and duplicate evidence |
| Saved single-value conflicts, tested locally | Both incompatible values flagged; removing one restored support for the other | Conflict management across saved records |
| Complex logic under 20 concurrent requests | Every request returned 20/20 expected verdicts; median request time 603 ms | Correct batch judgments during the measured concurrent workload |

The public suite returned **1,227/1,227 expected verdicts across 62 requests**, covering input variants and repeated workloads. [Read the report and every comparison question](docs/benchmarks/2026-10-10/rerun.md) or [inspect the data](docs/benchmarks/2026-10-10/rerun-results.json).

## Connect it to your application

Call `POST /v1/evaluate` with structured facts and questions. Each answer contains six fields: conclusion, evidence type, conflict, reason, decision signal and evidence path. Use them to answer, request clarification or gather more evidence.

- [Quickstart](USER_QUICKSTART.md): save, verify and delete a demonstration record.
- [API reference](PUBLIC_EVALUATION_API.md): requests and six-field answers.
- [Record management](docs/customer/record-management.md): correct records, delete selected data and import in chunks.
- [LLM integration](docs/customer/llm-integration.md): forward the current question and relevant results to your model.
- [Usage guide](USAGE.md): account setup and everyday operation.

[Chinese web documentation](https://api.marvnor.com/docs) · [Product introduction](INTRODUCTION.md) · [Test index and archives](TESTS.md) · [News](NEWS.md) · [Public materials license](LICENSE)

Send feedback and test results to [wendelxia@gmail.com](mailto:wendelxia@gmail.com). Keep account keys and private customer material out of feedback.

Building an agent or project-memory tool? [Bring one concrete use case](mailto:wendelxia@gmail.com?subject=Marvnor%20developer%20trial) and try the API with your own non-sensitive sample data.
