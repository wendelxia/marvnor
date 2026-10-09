# Marvnor

## Truth-Preserving Decision Gateway for LLM Applications

Large language models can read material and write answers. For critical judgments, however, an application still needs to distinguish supported claims, insufficient evidence, and conflicting sources. Marvnor is a gateway used alongside an existing LLM: your application sends a question and relevant evidence through the gateway, then receives machine-readable judgment results that software can use. The model handles wording; the application decides what happens next.

It is designed for enterprise RAG, intelligent customer service, compliance review, and data analysis. When sources contradict one another, Marvnor marks the conflict instead of forcing the model to choose a side and answer anyway.

The inference endpoint, `POST /v1/evaluate`, returns exactly six fields per answer: conclusion, evidence type, conflict, reason, decision signal, and evidence path. Your application supplies structured facts and questions; Marvnor does not automatically extract a full chat or call your LLM. [See the API reference](PUBLIC_EVALUATION_API.md).

[Open the user portal](https://api.marvnor.com/) · [Run the quickstart](USER_QUICKSTART.md) · [Read the usage guide](USAGE.md) · [View public tests](TESTS.md) · [Read the news release](NEWS.md)

English customer documentation, synchronized with the October 10, 2026 service documentation:

- [Quickstart](USER_QUICKSTART.md): write, verify, and safely delete one demonstration record.
- [API reference](PUBLIC_EVALUATION_API.md): six-field answers, candidate values, context, time, and request limits.
- [Record management](docs/customer/record-management.md): in-place correction, targeted deletion, and chunked imports.
- [LLM integration](docs/customer/llm-integration.md): forward only the current question and relevant results; account for quality and total cost.

[Chinese web documentation](https://api.marvnor.com/docs) · [Product introduction](INTRODUCTION.md) · [Public materials license](LICENSE)

## Try it

Use Marvnor as a gateway. Choose a question whose answer you can verify, send the question and relevant evidence through Marvnor, and compare the model’s answer before and after the check. Whether it works well or exposes a problem, you are welcome to send the source, method, and result to [wendelxia@gmail.com](mailto:wendelxia@gmail.com). Please do not send account keys or sensitive material you are not authorized to share.
