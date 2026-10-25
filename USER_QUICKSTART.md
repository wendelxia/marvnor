# Marvnor Quickstart

Marvnor saves evidence-backed or user-confirmed facts under one key, finds and verifies records relevant to the current question, and flags conflicts. Your existing AI writes the answer. No Marvnor client download or extra model setup is required.

Open the [product home](https://api.marvnor.com/home) and select “Create a test API Key” to try it without signing up: the guest key has 500 points and lasts 30 days. The key is shown only once. Before the trial expires, sign up or sign in in that same browser and confirm the transfer to keep the same key and saved facts. Unused guest points do not add to your account; the registration page shows the separate sign-up offer.

During the trial, open [Connect an AI tool](https://api.marvnor.com/connect) in the same browser where you created the key. Add that key to the AI you already use. Tell it a specific fact and its evidence, such as “Order 101 is paid, supported by receipt 123,” then ask it to save the fact and check the receipt. The [LLM integration guide](docs/customer/llm-integration.md) explains the tool setup and working rule.

## Recommended usage

Use one key for one independent project. Save only important user-confirmed or sourced facts, constraints, decisions, and states. When a question depends on project memory, call `recall` first; use `verify` for a precise claim. Send the model only the current question and all six fields of relevant results. Show conflicts for user confirmation, treat `UNKNOWN` as insufficient evidence, and correct changed facts in place. Creative writing, translation, ordinary code generation, and self-contained mathematics can go directly to the model unless they depend on saved project facts.

```text
In a host integration that controls model input, use Marvnor as a gateway when a task needs project memory: retrieve and verify first, then send only the current question and relevant Marvnor results to the LLM. Ask the user to resolve conflicts, state unknowns plainly, and save only important user-confirmed or sourced facts.
```

`verify` and `recall` return six-field answers. Save receipts are not verification answers. The former long-text import page and document tools are closed; facts saved before their retirement remain available under the same key.

The developer example below calls Marvnor directly from your own application: save a fact, verify it, then delete the test record.

**Want a ready-to-run file?** [Run the five-stage demo](examples/README.md) to verify, detect conflicts, correct and delete synthetic records. The shorter example below shows the basic request pattern.

[API reference](PUBLIC_EVALUATION_API.md) · [Edit and delete records](docs/customer/record-management.md) · [LLM integration](docs/customer/llm-integration.md)

## 1. Prepare your API key

Create a guest Key on the [product home](https://api.marvnor.com/home), or sign in to the [customer portal](https://api.marvnor.com/) to create one. Check your available points. Set `MARVNOR_API_TOKEN` in your application's runtime environment. The older `MARVNOR_API_KEY` name also works in the downloadable example. Do not send the Key to an LLM or put it in browser-side code.

The example requires Python 3 and no third-party packages. If the environment variable is not set, the script asks for the key using hidden input.

## 2. Run the example

Save this code as `marvnor_demo.py` and run `python marvnor_demo.py`. It generates a small amount of real API usage. It deletes only its newly created demonstration record, never all memory.

```python
import getpass
import json
import os
import urllib.error
import urllib.request
import uuid

BASE_URL = "https://api.marvnor.com"
API_KEY = (os.environ.get("MARVNOR_API_TOKEN") or os.environ.get("MARVNOR_API_KEY")
           or getpass.getpass("Marvnor API Key: "))


def request(method, path, payload=None):
    body = None if payload is None else json.dumps(payload, ensure_ascii=False).encode("utf-8")
    req = urllib.request.Request(
        BASE_URL + path,
        data=body,
        method=method,
        headers={
            "Authorization": "Bearer " + API_KEY,
            "Content-Type": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            return json.load(response)
    except urllib.error.HTTPError as error:
        raise RuntimeError(f"HTTP {error.code}: {error.read().decode('utf-8')}") from None


demo_id = "demo-" + uuid.uuid4().hex
fact = {
    "source": demo_id,
    "relation": "status",
    "target": "paid",
    "client_record_id": demo_id,
}
print("Test ID:", demo_id)
written = request("POST", "/v1/relations", {"relations": [fact]})
record_id = written["record_ids"][0]
print("Write succeeded:", written["ok"])

query = {"questions": [{
    "id": "check",
    "source": demo_id,
    "relation": "status",
    "target": "paid",
}]}
try:
    answer = request("POST", "/v1/evaluate", query)["answers"]["check"]
    print("Verification result:", json.dumps(answer, ensure_ascii=False))
finally:
    deleted = request("POST", "/v1/relations/delete", {"record_ids": [record_id]})
    print("Test records deleted:", deleted["deleted_count"])

after = request("POST", "/v1/evaluate", query)["answers"]["check"]
print("After deletion:", after["conclusion"])
```

## 3. Check the result

Normally, verification after the write returns `TRUE` with `conflict: false`; deletion removes `1` record; verification after deletion returns `UNKNOWN`. Each answer has exactly six fields: `conclusion`, `conflict`, `reason`, `path`, `decision`, and `evidence_kind`.

Read the six fields together. If the only saved record is `status=paid`, asking whether `status=unpaid` normally remains `UNKNOWN`; it does not become `FALSE` without explicit negative evidence for that claim. Inspect candidate values for conflicts and obtain more evidence for unknowns. See the [six-field result table](PUBLIC_EVALUATION_API.md#read-the-six-fields-together).

If the write times out, the record may already have been saved. Use the printed test ID to [delete by your own record ID](docs/customer/record-management.md). Do not clear the entire key's memory.

- `401`: check that the key is valid.
- `402`: check your available quota.
- `UNKNOWN`: check naming, key, context, and time. Do not treat it as a negative conclusion.
- `conflict: true`: check the conflicting values; do not let the LLM arbitrarily select one.

This completes the smallest working flow. For a production integration, keep a mapping between original facts, record receipts, and sources in your own system. Follow the [LLM integration guide](docs/customer/llm-integration.md) to send only the current question and relevant results to your model.
