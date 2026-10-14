# Use Marvnor as a Gateway

Marvnor works as a gateway alongside an existing LLM application. Keep your current model; send a verifiable judgment request and the relevant evidence through Marvnor, then use the returned results to decide how the application should proceed.

1. Open the [product home](https://api.marvnor.com/home) and create a test Key without registering: 500 points for 30 days. Save it immediately; the full Key is shown only once.
2. Follow the [quickstart](USER_QUICKSTART.md) to save a fact with `POST /v1/relations` and verify an explicit claim with `POST /v1/evaluate`, or use `POST /v1/recall` for the current question. Direct HTTPS calls work without an SDK.
3. Before the trial expires, register or sign in in that same browser and confirm the transfer to keep the same Key and saved facts. Registration grants a separate 1,000 points; unused guest points do not transfer.
4. Keep all [six fields of each relevant answer](PUBLIC_EVALUATION_API.md) when sending results and the current question to your LLM. Ask for confirmation when facts conflict; do not turn `UNKNOWN` into a fact. See [LLM integration](docs/customer/llm-integration.md) for wiring, quality, and cost considerations.

Use the same key for the same memory; no `project` or `environment` is needed. After 30 days of inactivity, the key becomes invalid and its memory enters cleanup.

For corrections, edit the record in place and retain its receipt. [Targeted deletion](docs/customer/record-management.md) preserves the key and unrelated records; clear-all destroys all of that key's memory and revokes the key. Save your own fact-to-receipt mapping.

Current plans and usage rules are available in the [customer portal](https://api.marvnor.com/) and the public [plan catalog](https://api.marvnor.com/v1/plans).

[Learn about the product](INTRODUCTION.md) · [View the tests](TESTS.md)
