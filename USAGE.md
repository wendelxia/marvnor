# Use Marvnor as a Gateway

Marvnor works as a gateway alongside an existing LLM application. Keep your current model; send a verifiable judgment request and the relevant evidence through Marvnor, then use the returned results to decide how the application should proceed.

1. Open the [Marvnor user portal](https://api.marvnor.com/), then register and sign in.
2. Create an access key in the console and save it immediately; the full key is shown only once.
3. Open [Connect AI tools](https://api.marvnor.com/connect) to use Marvnor from VS Code Copilot Chat or Codex. For your own application, follow the [quickstart](USER_QUICKSTART.md) to save a fact with `POST /v1/relations` and verify a structured question with `POST /v1/evaluate`. Direct HTTPS calls work without an SDK.
4. Keep all [six answer fields](PUBLIC_EVALUATION_API.md) when sending relevant results and the current question to your LLM. Ask for confirmation when facts conflict; do not turn `UNKNOWN` into a fact. See [LLM integration](docs/customer/llm-integration.md) for wiring, quality, and cost considerations.

Use the same key for the same memory; no `project` or `environment` is needed. After 30 days of inactivity, the key and its memory are destroyed together.

For corrections, edit the record in place and retain its receipt. [Targeted deletion](docs/customer/record-management.md) preserves the key and unrelated records; clear-all destroys all of that key's memory and revokes the key. Save your own fact-to-receipt mapping.

Current plans and usage rules are available in the [customer portal](https://api.marvnor.com/) and the public [plan catalog](https://api.marvnor.com/v1/plans).

[Learn about the product](INTRODUCTION.md) · [View the tests](TESTS.md)
