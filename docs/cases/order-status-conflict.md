# When an order is both `pending` and `paid`

[中文](order-status-conflict.zh-CN.md) · [API reference](../../PUBLIC_EVALUATION_API.md) · [Example source](../../examples/quickstart.py)

A support assistant is asked, “Has this order been paid?” Two records give the same order different statuses: `pending` and `paid`. The application needs to expose that disagreement before the LLM writes a reply.

This case uses synthetic records and a [captured live API run](../../examples/recorded-run.json) from **October 10, 2026, at 12:09:46 UTC**. It demonstrates one order-status lifecycle, not a guarantee for every input.

## The conflict result

The example saves both statuses, then calls `POST /v1/evaluate`. A question with `target: "paid"` returns `UNKNOWN` with `conflict: true`. Omitting `target` asks for the known candidate values. Here is that answer, unchanged from the recording's second stage:

```json
{
  "conclusion": "UNKNOWN",
  "conflict": true,
  "reason": "conflicting_values",
  "path": ["paid", "pending"],
  "decision": "needs_review",
  "evidence_kind": "conflict"
}
```

The application passes the current question and relevant six-field answers to the LLM. A suitable reply is: “The records disagree: one says `paid`, another says `pending`. Which status is confirmed?” The LLM must not choose a status just because it appears last. See the [integration guide](../customer/llm-integration.md) for the complete flow.

## Resolve, correct, then remove

The [Python example](../../examples/README.md) performs five stages against persistent records:

| Operation | Is it `pending`? | Is it `paid`? | Conflict |
| --- | --- | --- | --- |
| Save `pending` | TRUE | UNKNOWN | No |
| Also save `paid` | UNKNOWN | UNKNOWN | Yes |
| Delete the conflicting `paid` record | TRUE | UNKNOWN | No |
| Edit the remaining record to `paid` | UNKNOWN | TRUE | No |
| Delete the demo records | UNKNOWN | UNKNOWN | No |

The script deliberately changes synthetic data. In a real workflow, check the source or obtain user confirmation before deciding which record to delete or correct. A successful write is not independent verification that the status is true in the real world.

After targeted deletion, the recorded candidate-value answer is:

```json
{
  "conclusion": "UNKNOWN",
  "conflict": false,
  "reason": "no_known_values",
  "path": [],
  "decision": "unknown",
  "evidence_kind": "unknown"
}
```

No remaining evidence does not mean “unpaid.” The assistant should say that the available records no longer establish the status.

## Reproduce it

With Python 3.9 or later, clone or download this repository, then run:

```sh
cd examples
python quickstart.py --replay
```

Replay reads the checked-in recording; it makes no network calls and needs no account. For a new live run:

```sh
python quickstart.py --output my-demo-run.json
```

Enter your own key at the hidden prompt. The live run uses account quota, creates a random demo subject, checks the five stages and attempts targeted cleanup. It preserves other records and the key. The output file must not already exist. [Setup and cleanup instructions](../../examples/README.md) explain what to do if a run stops.

For request-only verification, `POST /v1/evaluate` also accepts temporary facts. Those facts apply only to that request and are not saved. Use the Python example above to reproduce the persistent write, edit and deletion lifecycle.
