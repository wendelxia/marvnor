# Marvnor API Reference

Marvnor's truth-preserving specialized model system checks submitted facts, detects conflicts, and returns results for applications and LLMs. No client download or SDK installation is required.

[Quickstart](USER_QUICKSTART.md) · [Edit and delete records](docs/customer/record-management.md) · [LLM integration](docs/customer/llm-integration.md)

## 1. Base URL and authentication

Base URL: `https://api.marvnor.com`

Send UTF-8 JSON. Except for the public plan catalog, the endpoints in this document require an API key created in the customer portal:

```http
Authorization: Bearer <YOUR_API_KEY>
Content-Type: application/json
```

Use the same key to write, query, and delete the same memory. Different keys do not share memory. You do not need to supply `project` or `environment`. Keep the key in your server-side environment variables, not in browser-side code, public repositories, or LLM prompts.

After 30 days of inactivity, memory data and its key are destroyed together.

## 2. Endpoints

| Purpose | Method and path |
| --- | --- |
| Verify facts, check conflicts, and query known values | `POST /v1/evaluate` |
| Save facts and import in chunks | `POST /v1/relations` |
| Check import progress | `GET /v1/relations/batches/{batch_id}` |
| List record receipts in pages | `GET /v1/relations` |
| Edit a specific record | `PATCH /v1/relations/{record_id}` |
| Delete a specific record | `DELETE /v1/relations/{record_id}` |
| Delete selected records in bulk | `POST /v1/relations/delete` |
| Clear all memory for the current key and revoke it | `POST /v1/relations/clear` |

AI tools can use these capabilities through `https://api.marvnor.com/v1/mcp`. This MCP connection layer uses the existing API: verification still calls `/v1/evaluate` and adds no inference fields. Configure it from [Connect AI tools](https://api.marvnor.com/connect) in the customer portal. See the [LLM integration guide](docs/customer/llm-integration.md) for supported tools.

`/v1/evaluate` is the only inference endpoint. Each answer has exactly six fields. Data-management endpoints return operation status, counts, or record receipts, not the original saved records.

## 3. Save facts

`POST /v1/relations`

```json
{
  "relations": [{
    "source": "demo-order-001",
    "relation": "status",
    "target": "paid",
    "client_record_id": "demo-status-001"
  }]
}
```

This record states that the status of order `demo-order-001` is `paid`.

| Field | Requirements and meaning |
| --- | --- |
| `source` | Required subject; non-empty string, up to 10,000 characters |
| `relation` | Required attribute or business relation type; non-empty string, up to 200 characters, such as `status` |
| `target` | Required value or object; non-empty string, up to 10,000 characters; must differ from `source` |
| `client_record_id` | Optional ID assigned by your application, 1–200 characters; useful for later deletion |
| `polarity` | Optional: `1` for positive, `-1` for explicit negative; defaults to `1` |
| `confidence` | Optional confidence supplied by the caller, from 0.01 to 1; defaults to `1`; not a guarantee of real-world truth |
| `context` | Optional business context; see section 5 |
| `validity` | Optional validity period; see section 5 |
| `provenance` | Optional source description, up to 200 characters |
| `evidence_refs` | Optional evidence locations; see section 5; referenced files or URLs are not fetched automatically |

Within one key, a `client_record_id` cannot be assigned to another fact. You may resubmit the same ID with the same fact. A request accepts 1–10,000 records; use chunked import for larger datasets.

Query subjects and values have a maximum length of 2,000 characters. Use short, stable business names or IDs rather than entire articles. Use identical naming for writes and queries; do not depend on automatic synonym matching.

In a successful response, `ok` confirms the operation succeeded, `accepted` is the number accepted in this request, and `record_ids` contains record receipts in input order. A `request_id` is also returned; depending on the call, the response may contain a `billing` usage receipt. Keep a mapping from receipts to original facts. Do not parse receipts or interpret successful acceptance as independent verification of a fact.

## 4. Queries and six-field answers

`POST /v1/evaluate`

```json
{
  "questions": [
    {"id": "paid", "source": "demo-order-001", "relation": "status", "target": "paid"}
  ]
}
```

After saving the fact above, with no conflict:

```json
{
  "answers": {
    "paid": {
      "conclusion": "TRUE",
      "conflict": false,
      "reason": "supported_evidence",
      "path": ["demo-order-001", "paid"],
      "decision": "answer",
      "evidence_kind": "direct"
    }
  }
}
```

| Field | Meaning |
| --- | --- |
| `conclusion` | `TRUE`: current evidence supports the claim; `FALSE`: current evidence refutes it; `UNKNOWN`: currently undetermined |
| `conflict` | Whether a conflict was detected; if `true`, do not arbitrarily choose one value as fact |
| `reason` | A short reason code; common values are listed below |
| `path` | Relevant evidence path for normal verification; known candidate values when `target` is omitted |
| `decision` | Suggested handling, not an instruction to execute automatically or a free-text answer |
| `evidence_kind` | Evidence category, such as direct, indirect, negative, or conflicting |

`TRUE` means submitted evidence supports the claim, not an absolute guarantee about the real world. `UNKNOWN` is not `FALSE`. HTTP 200 means the request succeeded, not that the business claim is true.

| Common `reason` | Meaning |
| --- | --- |
| `supported_evidence` | Supporting evidence exists |
| `contradicting_evidence` | Refuting evidence exists |
| `conflicting_evidence` | Conflicting evidence exists |
| `insufficient_evidence` | Evidence is insufficient |
| `known_values` | Known candidate values were found |
| `no_known_values` | No known candidate values were found |
| `conflicting_values` | Mutually exclusive candidate values were found |
| `path_omitted_limit` | The path or candidate list was too large to include; this does not mean there is no evidence |
| `no_supporting_path` | No supporting path; interpret alongside the conclusion and conflict flag |

Public `decision` values include `answer`, `abstain`, `clarify`, `unknown`, `open`, `allow`, `block`, and `needs_review`. Where clarification, review, or further evidence is needed, obtain that evidence or ask the user. This field does not replace your application's business authorization.

Public `evidence_kind` values include `direct`, `indirect`, `explicit_negative`, `conflict`, `incompatible_context`, `no_path`, `unknown`, `composite`, and `quarantined`. The last value means the evidence was not used to establish valid support; it is not a legal judgment about the content. Treat unrecognized categories as requiring review, not as automatic approval.

### Request scope

- `questions` is required, with 1–20 questions per request. Each `id` is required and must be unique within the request.
- A normal question uses `id`, `source`, and `relation`, with optional `target`, `context`, and `as_of`. Text fields must be non-empty and no longer than 2,000 characters.
- The request may include up to 200 temporary facts in `relations`. They apply to all questions in that request but are not saved. Supported fields are `source`, `relation`, `target`, `polarity`, `confidence`, `context`, and `validity`; record IDs and provenance fields are not supported here.
- A compound question uses `id` and `claim`; do not also include normal-question fields.
- The legacy Boolean `include_advice` parameter may be omitted. It does not add response fields.

The inference response contains only `answers` at the top level, with no extra usage or diagnostic fields. A path may contain up to 2,048 items and 131,072 characters in total. Beyond either limit, the entire `path` is an empty array and the reason is `path_omitted_limit`. Compound questions also return an empty `path`, so an empty array does not itself indicate query failure.

### Query known values for an attribute

Omit `target`; do not pass an empty string:

```json
{
  "questions": [
    {"id": "current-status", "source": "demo-order-001", "relation": "status"}
  ]
}
```

The result still has six fields. `path` contains deduplicated, sorted, directly known candidate values. This is not a full memory export or open-ended full-text search.

Ordinary custom attributes are single-valued by default. Different values for the same subject and single-valued attribute, in compatible contexts and overlapping validity periods, produce `UNKNOWN` with `conflict: true`. For example, an order cannot simultaneously have both `paid` and `unpaid` as its status. Types defined as multi-valued, such as `supports`, allow multiple objects and do not conflict merely because there is more than one value. You cannot change these rules by submitting an extra `multiple: true` field.

When a conflict occurs, omit `target` to query the candidate values, then check your original evidence. Positive and explicitly negative statements about a multi-valued attribute may also conflict; do not ignore `conflict`.

## 5. Context, time, and compound claims

### Context: `context`

May contain `domain_id`, `subdomain_id`, `scope`, and `subject_version`, each a non-empty string of up to 200 characters. `qualifiers` accepts up to 64 conditions, with keys up to 100 characters and values that are JSON scalars or lists of scalars. Nested objects are not accepted.

```json
{"scope": "store-a", "subject_version": "v2"}
```

Supply a query context that matches the facts. A mismatch does not make a fact false. Business context also does not replace key-based isolation between customers.

### Validity: `validity`, and query time: `as_of`

```json
{
  "kind": "interval",
  "valid_from": "2026-10-01T00:00:00Z",
  "valid_to": "2026-10-31T23:59:59Z"
}
```

Use ISO 8601 timestamps, preferably with a timezone. An `interval` requires at least a start or an end; the start must not be later than the end. `persistent` means the fact does not expire based on query time and cannot be combined with a start or end time.

Omitting `validity` also means no time restriction. A fact does not become unknown merely because it has no timestamp, although conflicts or missing support may still affect it. Optional `observed_at` and `recorded_at` timestamps do not replace the validity period.

Use `as_of` to specify a query time. Omitting it does not automatically mean "now." Facts outside their validity period cannot support a claim at that time; this does not establish the opposite claim either.

### Evidence locations: `evidence_refs`

Up to 64 entries. Each requires `source_id` (1–200 characters) and `locator` (1–500 characters). Optional fields are `content_hash` (1–200 characters), `observed_at` (ISO 8601), and `role` (1–80 characters, default `fact_support`). These are caller-supplied references; the original source text is not separately returned in six-field answers.

### Compound questions

Supported operators are `atom`, `and`, `or`, `not`, and `implies`, plus `scope` to apply context and query time to a nested claim:

```json
{
  "questions": [{
    "id": "ready",
    "claim": {
      "op": "scope",
      "context": {"scope": "store-a"},
      "as_of": "2026-10-09T00:00:00Z",
      "claim": {
        "op": "and",
        "claims": [
          {"op": "atom", "source": "demo-order-002", "relation": "status", "target": "paid"},
          {"op": "atom", "source": "demo-order-002", "relation": "stock_status", "target": "reserved"}
        ]
      }
    }
  }]
}
```

`atom` requires a subject, attribute, and value. `and` / `or` take a `claims` list with 1–256 children. `not` takes one `claim`. `implies` takes `if` and `then` children; the `op: "if"` and `when` forms are also accepted. `scope` requires a `claim` and at least a non-empty `context` or a valid `as_of`.

Nested contexts must not contradict each other. An inner query time overrides only its own nested claim. Across all compound questions, a request may contain at most 512 claim nodes and a nesting depth of 64. Without submitted facts about the example order, this request does not invent a positive answer.

## 6. Edit, delete, and import

See the [record-management guide](docs/customer/record-management.md) for examples.

- Edit: `PATCH /v1/relations/{record_id}`. Provide at least one field from the saved-fact table, except `client_record_id`, which cannot be changed. Both built-in types and custom attributes can be edited, preserving the receipt and client ID. Success returns only `{"ok":true}`.
- Delete one record: `DELETE /v1/relations/{record_id}`. Success returns `{"ok":true,"deleted_count":1}`.
- Bulk deletion: `POST /v1/relations/delete`. Choose exactly one of `record_ids`, `client_record_ids`, complete `relations`, or `batch_id`. Lists accept 1–10,000 entries; IDs must not repeat.
- List receipts: `GET /v1/relations?limit=100&cursor=0`. `limit` is 1–500; `cursor` is a non-negative integer. Returns `ok`, `relations` containing only `record_id`, `next_cursor`, and `request_id`. `next_cursor: null` marks the end. Fact contents are not returned.
- Chunked import: supply `batch_id` (1–200 characters), `total` (positive integer record count), and `offset` (non-negative integer, starting at 0) together on the write endpoint. Each chunk accepts up to 10,000 records; the total is subject to the service's accepted batch limit. A chunk limit is not an account capacity limit.
- Import progress: `GET /v1/relations/batches/{batch_id}` returns `ok`, `batch_id`, `total`, `next_offset`, `status`, and `request_id`. Status is `partial`, `complete`, or `deleted`; an unknown batch returns 404.

Targeted deletion preserves the key and other records. **Clearing all memory destroys all memory for the current key and revokes it. Do not use it for routine test-data cleanup.**

Edited records retain their original receipt and `client_record_id`. To delete by complete fact, supply the updated contents. Edit and delete responses do not return record details; obtain evaluation results from `/v1/evaluate`.

## 7. Usage and troubleshooting

See the [customer portal](https://api.marvnor.com/) for current plans and usage rules. Applications can read the public [`GET /v1/plans`](https://api.marvnor.com/v1/plans). Use an authenticated `GET /v1/quota` to check account usage. Whether a call counts toward usage follows the current rules, not whether the conclusion is `TRUE`, `FALSE`, or `UNKNOWN`.

| HTTP status | Suggested action |
| --- | --- |
| 400 | Check field names, required fields, and formats; omitting `target` differs from passing an empty string |
| 401 | Check for an incorrect, revoked, or inactivity-expired key |
| 402 | Check available account quota |
| 403 | Check permissions; use an API key, not website login credentials |
| 404 | Check paths and IDs, and use the original write key |
| 409 | Check batch state, offset, and retry content; do not blindly resend under a different ID |
| 413 | Reduce request size or import in chunks |
| 500 | The operation has not been confirmed successful; retain the request ID and contact support rather than blindly retrying writes or edits |
| 429 / 503 | Retry later, observing `Retry-After` when present; after a write timeout, check state first |

A network timeout does not prove that a write failed. Do not retry indefinitely without checking. Keep the HTTP status, time, and any `request_id` already present in the response, then contact support through the customer portal. Never send your full key.
