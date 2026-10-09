# Marvnor Quickstart

Call Marvnor directly from your own application: save a fact, verify it, then delete the test record. No Marvnor client download or SDK is required.

[API reference](PUBLIC_EVALUATION_API.md) · [Edit and delete records](docs/customer/record-management.md) · [LLM integration](docs/customer/llm-integration.md)

## 1. Prepare your API key

Sign in to the [customer portal](https://api.marvnor.com/), create an API key, and check that your account has available quota. Set `MARVNOR_API_KEY` in your application's runtime environment. Do not send the key to an LLM or put it in browser-side code.

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
API_KEY = os.environ.get("MARVNOR_API_KEY") or getpass.getpass("Marvnor API Key: ")


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

If the write times out, the record may already have been saved. Use the printed test ID to [delete by your own record ID](docs/customer/record-management.md). Do not clear the entire key's memory.

- `401`: check that the key is valid.
- `402`: check your available quota.
- `UNKNOWN`: check naming, key, context, and time. Do not treat it as a negative conclusion.
- `conflict: true`: check the conflicting values; do not let the LLM arbitrarily select one.

This completes the smallest working flow. For a production integration, keep a mapping between original facts, record receipts, and sources in your own system. Follow the [LLM integration guide](docs/customer/llm-integration.md) to send only the current question and relevant results to your model.
