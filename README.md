# Marvnor

## Truth-Preserving Decision Gateway for LLM Applications

Large language models can read material and write answers. For critical judgments, however, an application still needs to distinguish supported claims, insufficient evidence, and conflicting sources. Marvnor is a gateway used alongside an existing LLM: your application sends a question and relevant evidence through the gateway, then receives machine-readable judgment results that software can use. The model handles wording; the application decides what happens next.

It is designed for enterprise RAG, intelligent customer service, compliance review, and data analysis. When sources contradict one another, Marvnor marks the conflict instead of forcing the model to choose a side and answer anyway.

By default, it returns six results: conclusion, evidence type, conflict, reason, decision signal, and evidence path. [See the six results](INTRODUCTION.md).

[Open the user portal](https://marvnor.com) · [Read the usage guide](USAGE.md) · [View public tests](TESTS.md) · [Read the news release](NEWS.md)

## Try it

Use Marvnor as a gateway. Choose a question whose answer you can verify, send the question and relevant evidence through Marvnor, and compare the model’s answer before and after the check. Whether it works well or exposes a problem, you are welcome to send the source, method, and result to [wendelxia@gmail.com](mailto:wendelxia@gmail.com). Please do not send account keys or sensitive material you are not authorized to share.
