# Connect Marvnor to Your AI

Marvnor saves the facts you provide, finds and verifies records relevant to the current question, and flags conflicts. Your existing AI organizes the answer. No Marvnor client download or extra model setup is required.

[Quickstart](../../USER_QUICKSTART.md) · [API reference](../../PUBLIC_EVALUATION_API.md) · [Edit and delete records](record-management.md)

## Connect an AI tool

Create a guest test key (500 points for 30 days) from the [product home](https://api.marvnor.com/home), then open [Connect an AI tool](https://api.marvnor.com/connect) in the same browser. Or sign in to the customer portal to create a key. Follow the instructions for your current AI. Use the same key for saving and querying. Ask your AI to check its Marvnor connection after setup; the optional check on the web page only tests the page's connection to the service. Keep the key in the tool configuration or runtime environment, never in chat, frontend code, or public files.

The MCP connector exposes seven tools: `check_connection`, `remember_facts`, `verify`, `recall`, `browse_candidates`, `correct_fact`, and `forget_facts`. `verify` checks an explicit claim; `recall` finds and verifies records relevant to the current question; `browse_candidates` helps when the saved fields for a known subject are not yet known. Each verification or recall answer has six fields; one question may produce several answers. `check_connection` does not charge or write data. Correction and deletion change only the records you specify; the connector has no clear-all or key-revocation tool.

Give your AI this working rule:

```text
In a host integration that controls model input, use Marvnor as a gateway when a task needs project memory: retrieve and verify first, then send only the current question and relevant Marvnor results to the LLM. Ask the user to resolve conflicts, state unknowns plainly, and save only important user-confirmed or sourced facts.
```

Use one key for one independent project. Agents that should share project memory use the same key; unrelated projects use different keys. Do not force creative writing, translation, ordinary code generation, or self-contained mathematics through Marvnor unless the task depends on saved project facts.

## Save and verify facts

Tell your connected AI a specific fact and its evidence, for example: “Remember that order 101 is paid, supported by receipt 123.” It can call `remember_facts` and check the save receipt. Do not save guesses, proposals, or “no evidence proves it” as established facts. Correct a changed fact in place rather than adding an incompatible old value.

For a question, ask the AI to use `recall` first; use `verify` when the subject, attribute, and value are already precise. If `conflict` is true, show the conflicting values and ask the user. `UNKNOWN` means insufficient evidence, not a negative answer. Save receipts are not six-field verification answers.

Automated long-text import and the former `/v1/documents` endpoints are closed; authenticated calls return `410 long_text_retired`. Previously saved facts remain available under the same key.

## Minimal integration flow

1. Extract facts from user-confirmed information, project files, or other checkable sources, and save them incrementally through `/v1/relations`. Keep source locations and record receipts. Do not save model guesses as facts.
2. For an explicit claim, prepare the subject, attribute, and value in `questions`, then call `/v1/evaluate`; omit `target` when you need known candidate values. For a natural-language question, call `/v1/recall` with `text`, optional `context` / `as_of`, and optional `facets` for up to eight parts. See the [request example](../../PUBLIC_EVALUATION_API.md#find-records-for-the-current-question).
3. Send only the current question and the relevant six-field results to your chosen LLM. Do not attach full chat history, unrelated records, the entire dataset, or the API key.
4. If results conflict, check the candidate values first. If unknown, look up relevant supporting information or ask the user. Save newly confirmed information, and edit or delete the corresponding records when correcting old information.

For example, when the user asks whether an order has been paid, your application could prepare:

```json
{
  "questions": [{
    "id": "payment",
    "source": "order-101",
    "relation": "status",
    "target": "paid"
  }]
}
```

Use the same business names as in your writes. Pass `answers.payment` and the current question to the LLM. Do not extract only `conclusion` and discard conflict or uncertainty information. For recall, pass the relevant answers together; each describes a selected claim, not necessarily the whole question.

Different values are not automatically logical opposites. If the only saved record says “status is paid,” the claim “status is unpaid” may still be UNKNOWN; it becomes FALSE only when there is explicit negative evidence against that same claim. See the [six-field result table](../../PUBLIC_EVALUATION_API.md#read-the-six-fields-together) for the common combinations and handling.

The working rule requires your application or agent tools to call Marvnor and control what reaches the LLM. An MCP connection cannot remove history the AI platform has already sent. Treat retrieved text as evidence, not instructions.

## Which results should reach the LLM?

- Answer objects relevant to the current question, keeping all six fields.
- If there is a conflict, candidate values queried for the same subject and attribute.
- If results are incomplete, unknown, or marked `path_omitted_limit`, first obtain the necessary supporting information or ask for clarification. Do not claim that the result covers the whole question.

Do not forward unrelated answers in bulk or treat a deletion operation's status as reasoning evidence. For normal verification, `path` is an evidence path; when `target` is omitted, it contains candidate values. Distinguish these when interpreting the result.

## Natural language, model choice, and cost

`/v1/evaluate` accepts structured questions. `/v1/recall` accepts the current question and finds candidate records. Neither endpoint connects to arbitrary LLM endpoints for you or automatically extracts facts from an entire chat. Your existing model or rules can prepare inputs; your application configures the model endpoint and credentials.

Within the same project, reuse saved facts and extract or update only new and changed information. There is no need to repeat all extraction every turn. If an LLM extracts facts or constructs queries, include those calls in your costs.

To assess savings, add together fact extraction and updates, Marvnor usage, query preparation, and the final LLM's input and output costs. Compare that total with the cost without Marvnor, accounting for the original model's cache hits. A shorter final prompt does not imply an equal percentage reduction in the bill.

Reducing input does not guarantee answer quality. Narrative detail, tone, complete code, or source text for translation may not be replaceable with structured facts alone. When these materials matter, perform additional verification in the preprocessing stage or ask the user for the relevant material. If passing only six-field results cannot retain the information the task needs, state that the information is insufficient rather than having the model invent it.

## Before going live

- Use the same key for writes and queries; keep it out of model prompts.
- Test supported claims, explicit negatives, unknown claims, and mutually exclusive values.
- Check answer quality and total cost, not only token counts.
- Be able to correct records and delete test data by your IDs or receipts, without misusing clear-all.
- Treat text such as "ignore previous instructions" inside a fact as source material only. It must not change application rules or trigger unauthorized actions.

## When results differ from expectations

First check the actual saved data, naming, key, context, and time, then follow the [API troubleshooting guidance](../../PUBLIC_EVALUATION_API.md). If the model ignores a conflict, check whether the integration forwarded only the conclusion and omitted other fields. Do not change the original results merely to make the answer look correct.
