# Edit, Delete, and Import Records

Use the same API key that originally saved the records. See the [API reference](../../PUBLIC_EVALUATION_API.md) for the base URL, authentication, and field constraints. If this is your first integration, start with the [quickstart](../../USER_QUICKSTART.md). The JSON examples below are request bodies for the specified endpoints.

| What you need | Operation | Is the key retained? |
| --- | --- | --- |
| Correct a saved fact | Edit in place; success returns `{"ok":true}` | Yes; the record receipt also stays the same |
| Remove specific records or an import batch | Targeted deletion; returns only status and deletion count | Yes; unrelated records are unaffected |
| Stop using this memory | Clear all memory | No; the key is revoked and all its memory is destroyed |

## Save your own record IDs

Include `client_record_id` when writing, and keep a mapping between the returned `record_ids` and your facts:

`POST /v1/relations`

```json
{
  "relations": [{
    "source": "demo-order-101",
    "relation": "status",
    "target": "pending",
    "client_record_id": "demo-status-101"
  }]
}
```

`record_ids[0]` corresponds to the first input, and so on. Receipts identify records; they cannot reconstruct the original content. Within one key, do not assign the same client ID to different facts.

## Correct an inaccurate record

Using the record receipt from the write response, send the fields to change to `PATCH /v1/relations/{record_id}`. For example, correct an order's status from `pending` to `paid`:

```json
{"target": "paid"}
```

Success returns only:

```json
{"ok": true}
```

Then call `/v1/evaluate` for both the new and old values to check that the results match your supporting information. The old value may become `UNKNOWN` when it loses support; it does not necessarily become `FALSE`. Update the original record in your own system as well.

Custom attributes use the same edit endpoint. Editing preserves the original record receipt and `client_record_id`; there is no need to delete and recreate the record. Other records and the key are unaffected. If the edited fact conflicts with other applicable facts, subsequent evaluations still report the conflict.

Supply at least one field to change. Editable fields are `source`, `relation`, `target`, `polarity`, `confidence`, `context`, `validity`, `provenance`, and `evidence_refs`. You cannot change `client_record_id`. The edit response does not return the record's old or new contents.

If a state changed over time, rather than the original record being wrong, give the earlier and later states their respective validity periods. This avoids treating historical states as simultaneously applicable conflicts. Do not delete another piece of evidence without checking it first.

## Delete specific test data

Send one of the following four selectors to `POST /v1/relations/delete`. **Use exactly one selector per request; do not mix them.**

### Delete by your own IDs

```json
{"client_record_ids": ["demo-status-101"]}
```

This is useful for routine cleanup. Put multiple IDs in the same array, up to 10,000 per request, without duplicates.

### Delete by record receipt

Replace the placeholder with the full receipt from your write response:

```json
{"record_ids": ["mr_REPLACE_WITH_YOUR_FULL_RECEIPT"]}
```

For one record, you can also use `DELETE /v1/relations/{record_id}`.

After editing a record, you can still delete it using its original receipt or `client_record_id`. If deleting by complete fact instead, supply the updated contents.

### Delete by complete fact when you did not save an ID

For example, to clean up an earlier probe record:

```json
{
  "relations": [{
    "source": "probe-001",
    "relation": "supports",
    "target": "probe-target-001"
  }]
}
```

Supply the complete `source`, `relation`, and `target`. If the original record had `polarity`, `context`, or `validity`, include the corresponding values. Omitting these fields matches only positive facts without context or time restrictions; it does not mean all contexts and times.

Prefix and wildcard deletion, such as `probe-*`, is not supported. Find the actual complete facts in your test script or records and submit them as an array. Do not clear the entire key to remove a few test records.

### Delete by completed import batch

```json
{"batch_id": "demo-import-101"}
```

This removes only records created by that batch that have not subsequently been reused by another write or edited. Pre-existing records, and records later reused or edited, are preserved. To remove those records deliberately, identify them by receipt or complete fact.

Once a batch is deleted, uploading it again cannot restore it. Use a new `batch_id` for a new import. Incomplete imports, or imports that do not support batch cleanup, return `409`.

### Check the deletion result

Success returns only status and the number deleted in this operation, for example:

```json
{"ok": true, "deleted_count": 1}
```

Evaluate the fact again with the same key. It usually becomes `UNKNOWN` if no other support remains. It may still be `TRUE` if independent evidence or another supporting path exists; that alone does not mean deletion failed.

When deleting by an ID list, any missing ID produces `404` and no partial deletion is performed. Deletion by complete fact returns `deleted_count: 0` when nothing matches. Repeating deletion of an already deleted batch also returns `0`.

## What if you have only the key, with no saved receipts?

`GET /v1/relations?limit=100&cursor=0` lists receipts in pages. This illustrative response uses placeholder identifiers:

```json
{
  "ok": true,
  "relations": [{"record_id": "mr_EXAMPLE_RECEIPT"}],
  "next_cursor": null,
  "request_id": "EXAMPLE_REQUEST_ID"
}
```

The list does not return fact contents and cannot download your original material. To locate a particular fact, prefer your own IDs, your receipt-to-fact mapping, or the complete fact.

Follow `next_cursor` until it is `null`. Finish pagination before deleting, and avoid concurrent writes or deletions while listing so that shifting positions do not cause omissions. Do not treat the full receipt list as the result of a prefix filter and delete it wholesale.

## Import large datasets in chunks

1. Generate a unique `batch_id`, determine `total`, and start with `offset: 0`.
2. Call `POST /v1/relations` for each chunk using the same `batch_id` and `total`, with that chunk's `offset`.
3. Continue at the returned `next_offset`. Only `status: complete` confirms that the whole batch has been committed.

For example, split two records across two requests:

```json
{
  "batch_id": "demo-import-101",
  "total": 2,
  "offset": 0,
  "relations": [{"source": "demo-app-101", "relation": "depends_on", "target": "demo-cache-101"}]
}
```

The first chunk returns `status: partial` and `next_offset: 1`. Then submit:

```json
{
  "batch_id": "demo-import-101",
  "total": 2,
  "offset": 1,
  "relations": [{"source": "demo-cache-101", "relation": "depends_on", "target": "demo-db-101"}]
}
```

The final response has `status: complete`. Newly imported records are not available for queries until the batch is complete. After the final chunk completes, `record_ids` lists receipts for the entire batch in input order, including reused records. Save this mapping.

Each chunk accepts up to 10,000 records. You do not need to fill a chunk; start smaller if useful. The service's actual response determines the accepted limit for the complete batch.

### Timeouts and retries

First check `GET /v1/relations/batches/{batch_id}`:

- `complete`: do not create another batch. If you need the receipts again, replay a previously submitted chunk unchanged.
- `partial`: continue at `next_offset`. Replaying an earlier chunk requires exactly the same batch ID, total, offset, and content.
- `deleted`: the batch has been cleaned up; do not resend it. Use a new batch ID for a new import.
- `404`: check the key and batch ID. Once you have confirmed that the batch was not received, start from the first chunk.

Retries are not a promise of free usage; check usage in the customer portal. Batch progress is not a permanent backup. Keep your original input and finish uploading promptly.

## Clear all memory only when you no longer need this key

**This destroys all memory associated with the current key and revokes the key. You must create a new key afterward. This endpoint cannot undo the operation.**

`POST /v1/relations/clear`

```json
{"confirm": "clear_project"}
```

`clear_project` is the fixed confirmation value required by the API, not a project name to fill in. Use targeted deletion above for small amounts of test data.

## Troubleshooting

| Situation | What to do |
| --- | --- |
| Deletion returns 400 | Check for mixed selectors or missing required fields |
| Deletion returns 404 | Check the original key, IDs, and whether records were already deleted; ID lists are not partially executed |
| Deletion by complete fact returns 0 | Check exact text, polarity, context, and validity; do not broaden the deletion scope by trial and error |
| Batch operation returns 409 | Check progress, deletion/completion state, offsets, and changed content; retry a temporary conflict later with identical content |
| No IDs and no original facts | The receipt list cannot reconstruct content; check your own saved material instead of guessing and deleting in bulk |
| A conflict remains afterward | Query the candidate values and check for another piece of evidence |

[Back to quickstart](../../USER_QUICKSTART.md) · [LLM integration](llm-integration.md)
