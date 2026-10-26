# Marvnor API Reference

Marvnor stores the records you provide and answers structured questions against them: TRUE when the evidence supports a claim, FALSE when it refutes it, and UNKNOWN when it does not settle the question. It flags conflicts and supports in-place correction and targeted deletion. No client download or SDK installation is required.

[Quickstart](USER_QUICKSTART.md) · [Edit and delete records](#6-edit-delete-and-import) · [Full reference, including calculations and proofs](https://api.marvnor.com/docs/api?lang=en)

## 1. Base URL and authentication

Base URL: `https://api.marvnor.com`

Send UTF-8 JSON. Except for the public plan catalog, the endpoints in this document require an API key. Create a guest key from the [product home](https://api.marvnor.com/home), or create one after signing in to the [customer portal](https://api.marvnor.com/):

```http
Authorization: Bearer <YOUR_API_KEY>
Content-Type: application/json
```

Use the same key to write, query, and delete the same memory. Different keys do not share memory. You do not need to supply `project` or `environment`. Keep the key in your server-side environment variables, not in browser-side code, public repositories, or LLM prompts.

After 30 days of inactivity, the key becomes invalid and its memory enters cleanup.

## 2. Endpoints

| Purpose | Method and path |
| --- | --- |
| Verify facts, check conflicts, and query known values | `POST /v1/evaluate` |
| Find and verify records relevant to the current question | `POST /v1/recall` |
| Browse records for a known subject, page by page | `GET /v1/candidates` |
| Save structured facts, including batches | `POST /v1/relations` |
| Check structured-fact batch progress | `GET /v1/relations/batches/{batch_id}` |
| List record receipts in pages | `GET /v1/relations` |
| Correct by old fact, client ID, or receipt | `POST /v1/relations/correct` |
| Edit a specific record | `PATCH /v1/relations/{record_id}` |
| Delete a specific record | `DELETE /v1/relations/{record_id}` |
| Delete selected records in bulk | `POST /v1/relations/delete` |
| Clear all memory for the current key and revoke it | `POST /v1/relations/clear` |

AI tools can use the same key through the MCP connector at `https://api.marvnor.com/v1/mcp`; follow [Connect an AI tool](https://api.marvnor.com/connect) for setup. `/v1/evaluate` checks explicit claims; `/v1/recall` finds and verifies records relevant to the current question. Answers from both endpoints have exactly six fields. Record-management endpoints return operation status, counts, or receipts.

The five MCP tools are `remember_facts`, `recall`, `verify`, `correct_fact`, and `forget_facts`. Ordinary calls need no prior schema lookup. `recall({})` checks connectivity; `recall({"schema":"compute"})` returns advanced parameters. The [quickstart](USER_QUICKSTART.md) gives the working rule.

The former `/v1/documents` endpoints are closed and return `410 long_text_retired`; MCP no longer lists document tools. Previously saved facts remain available for retrieval, correction, and targeted deletion under the same key.

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

In a successful response, `ok` confirms the operation succeeded, `accepted` is the number accepted in this request, and `record_ids` contains record receipts in input order. A `request_id` is also returned; depending on the call, the response may contain a `billing` usage receipt. Receipts and client IDs are useful for automation; a unique old fact can also identify a record for correction or deletion. Do not interpret acceptance as independent verification of a fact.

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
| `reason` | The basis for this answer. Explicit-claim verification commonly uses the codes below; recall can include the selected stored claim and query scope as text |
| `path` | Relevant evidence path for normal verification; known candidate values when `target` is omitted |
| `decision` | Suggested handling, not an instruction to execute automatically or a free-text answer |
| `evidence_kind` | Evidence category, such as direct, indirect, negative, or conflicting |

`TRUE` means submitted evidence supports the claim, not an absolute guarantee about the real world. `UNKNOWN` is not `FALSE`. HTTP 200 means the request succeeded, not that the business claim is true.

### Read the six fields together

These are the most common combinations for ordinary fact verification. The exact `path` depends on whether the answer uses a direct fact, a multi-hop path, or a candidate-value query. Do not interpret one field in isolation.

| Situation | `conclusion` | `conflict` | `reason` | `path` | `decision` | `evidence_kind` |
| --- | --- | --- | --- | --- | --- | --- |
| Direct supporting evidence | `TRUE` | `false` | `supported_evidence` | `[subject, value]` | `answer` | `direct` |
| Explicit negative evidence | `FALSE` | `false` | `contradicting_evidence` | `[]` | `answer` | `explicit_negative` |
| Insufficient evidence | `UNKNOWN` | `false` | `insufficient_evidence` | `[]` | `unknown` | `unknown` |
| Conflict on an explicit claim | `UNKNOWN` | `true` | `conflicting_evidence` | relevant path | `clarify` | `conflict` |
| One known candidate value | `TRUE` | `false` | `known_values` | `[value]` | `answer` | `direct` |
| Mutually exclusive candidate values | `UNKNOWN` | `true` | `conflicting_values` | `[value A, value B]` | `needs_review` | `conflict` |

Marvnor does not treat missing evidence as negation. If the only saved record is `status=paid`, asking whether `status=unpaid` normally returns `UNKNOWN`, not `FALSE`. `FALSE` requires explicit evidence against that same claim, such as a saved record with `polarity: -1`. Applications should preserve all six fields: inspect candidate values when there is a conflict, and obtain more evidence when the result is unknown instead of acting on `conclusion` alone.

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

The `/v1/evaluate` response contains only `answers` at the top level, with no extra usage or diagnostic fields. A path may contain up to 2,048 items and 131,072 characters in total. Beyond either limit, the entire `path` is an empty array and the reason is `path_omitted_limit`. Compound questions also return an empty `path`, so an empty array does not itself indicate query failure.

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

### Find records for the current question

`POST /v1/recall` accepts natural-language question text, then selects and verifies relevant saved records:

```json
{"text": "What is the status of demo-order-001?", "limit": 12}
```

`text` is required (1–2,000 characters). Optional `context` selects the business scope; `as_of` specifies an explicit query time. `facets` can split a compound question into 1–8 parts, each with its own required `text` and optional `context` / `as_of`. `limit` bounds the total selected records (1–20, default 12). For example:

```json
{
  "text": "Was order-101 paid and shipped at 2026-10-10T12:00:00Z?",
  "context": {"scope": "order-101"},
  "as_of": "2026-10-10T12:00:00Z",
  "facets": [{"text": "Was order-101 paid?"}, {"text": "Was order-101 shipped?"}],
  "limit": 12
}
```

Use a scope only when the records were saved with that scope. The response is an `answers` object; **each answer** has the same six fields as evaluation. A `TRUE` or `FALSE` on a selected stored claim is not an automatic verdict on the entire natural-language question. Missing evidence stays `UNKNOWN`; a partial retrieval is not proof that omitted records do not exist. `reason` identifies the selected `stored_claim`, and may include query scope and source-record polarity, context, or validity. Excerpts are omitted by default; optional `include_source_context: true` adds selected records and bound short citations inside the `reason` string, without adding answer fields.

For an exact subject, MCP `recall({"source":"demo-order-001"})` browses its records. Each `answers` key is a usable `mr_...` receipt; use it with `correct_fact` or `forget_facts`. Follow `next_cursor` until `complete: true` before batch deletion. Here `project` matches saved `context.scope`; omitting it selects unscoped records. Answer keys from text search and HTTP browsing are not record receipts.

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

Use the original write Key. Targeted correction or deletion preserves the Key and unrelated records; conclusions depending on changed records are affected.

### Correct a fact

`POST /v1/relations/correct` (MCP: `correct_fact`): send `changes` and exactly one selector, `fact`, `client_record_id`, or `record_id`:

```json
{"fact":{"source":"demo-order-001","relation":"status","target":"pending"},"changes":{"target":"paid"}}
```

A unique old fact needs no saved receipt. Omitted scope, validity and polarity do not filter this selector. Multiple matches return `409 ambiguous_record`; specify the missing scope or use a receipt. No match returns `404`; concurrent changes return `409 record_changed`. Success returns `ok` and the unchanged `record_id`. Recheck the new and old claims afterward; loss of support usually makes the old claim `UNKNOWN`, not `FALSE`.

For a change over time rather than an incorrect old record, retain earlier and later facts with their respective validity periods.

### Delete selected records

`POST /v1/relations/delete` (MCP: `forget_facts`): choose exactly one selector per request.

| Selector | Example | Matching |
| --- | --- | --- |
| `fact` | `{"fact":{"source":"demo-order-001","relation":"status","target":"paid"}}` | One unique old fact, with the same ambiguity handling as correction |
| `client_record_ids` | `{"client_record_ids":["demo-status-001"]}` | Your IDs |
| `record_ids` | `{"record_ids":["mr_FULL_RECEIPT"]}` | Receipts |
| `relations` | See below | Complete facts including their scope and polarity |
| `batch_id` | `{"batch_id":"demo-import-001"}` | A completed import batch |

Success returns `{"ok":true,"deleted_count":1}` for one deleted record. ID lists accept 1–10,000 unique entries; a missing ID returns `404` with no partial deletion. A natural-language `query` alone cannot select records for deletion. If MCP reports `incomplete_record_selector`, use its suggested `recall` arguments to find the old values and resubmit.

### Delete by complete fact when you did not save an ID

```json
{"relations":[{"source":"demo-order-001","relation":"status","target":"paid"}]}
```

Unlike the singular `fact` selector, `relations` matches complete fact identity: include original `polarity`, `context` and `validity` when present. Omitting them selects only positive, unscoped, untimed facts. Use updated contents after correction. No match returns `deleted_count: 0`. Prefixes and wildcards such as `probe-*` are not supported.

Batch cleanup removes only records created by that batch and not later edited or reused; pre-existing records remain. Incomplete or unsupported batches return `409`. Repeated cleanup of a deleted batch returns `0`; new imports need a new batch ID.

### Receipts and batch imports

- Edit: `PATCH /v1/relations/{record_id}`. Provide at least one field from the saved-fact table, except `client_record_id`, which cannot be changed. Both built-in types and custom attributes can be edited, preserving the receipt and client ID. Success returns only `{"ok":true}`.
- Delete one record: `DELETE /v1/relations/{record_id}`. Success returns `{"ok":true,"deleted_count":1}`.
- List receipts: `GET /v1/relations?limit=100&cursor=0`. `limit` is 1–500; `cursor` is a non-negative integer. Returns `ok`, `relations` containing only `record_id`, `next_cursor`, and `request_id`. `next_cursor: null` marks the end. Fact contents are not returned.
- Chunked import: supply `batch_id` (1–200 characters), `total` (positive integer record count), and `offset` (non-negative integer, starting at 0) together on the write endpoint. Each chunk accepts up to 10,000 records; the total is subject to the service's accepted batch limit. A chunk limit is not an account capacity limit.
- Import progress: `GET /v1/relations/batches/{batch_id}` returns `ok`, `batch_id`, `total`, `next_offset`, `status`, and `request_id`. Status is `partial`, `complete`, or `deleted`; an unknown batch returns 404.

For example, upload two one-record chunks using the same `batch_id` and `total: 2`, with `offset: 0` and then `offset: 1`. Continue at the returned `next_offset`. Newly imported records become queryable only when the batch is `complete`; the final `record_ids` covers the whole batch in input order.

After a timeout, check progress before retrying: continue a `partial` batch at `next_offset`; do not create another batch when it is `complete`. To recover receipts, replay an earlier chunk unchanged. A `deleted` batch cannot be reused. Check the Key and ID before restarting after `404`. Keep the original input; retries do not imply free usage.

The receipt list does not reconstruct content. Finish pagination before deletion, without concurrent mutations, so shifting positions do not skip records. Prefer an exact subject lookup or your original facts for selective cleanup.

### Clear all memory

`POST /v1/relations/clear` requires `{"confirm":"clear_project"}`. It removes the Key's current verifiable memory and revokes the Key; operational history and backups may have separate retention. **This is not routine test-data cleanup and cannot be undone by this endpoint.**

After deletion, a claim can remain `TRUE` if independent support remains. Use `/v1/evaluate` to check the result; management receipts do not return verification answers.

## 7. Usage and troubleshooting

See the [customer portal](https://api.marvnor.com/) for current plans and usage rules. Applications can read the public [`GET /v1/plans`](https://api.marvnor.com/v1/plans). Use an authenticated `GET /v1/quota` to check account usage. Whether a call counts toward usage follows the current rules, not whether the conclusion is `TRUE`, `FALSE`, or `UNKNOWN`.

`/v1/recall` charges for submitted facets with candidate records, not separately for each internally verified candidate. Input follows the published 4KB tiers. At most one automatically added untimed document background and its internal verification use `limit` slots but have no extra point charge. The background does not establish status at a requested instant. See `pricing.recall_billing` and `pricing.recall_untimed_background` in `GET /v1/plans`.

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
