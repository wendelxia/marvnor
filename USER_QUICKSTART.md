# Marvnor Quickstart

Marvnor saves evidence-backed or user-confirmed facts under one key, finds and verifies records relevant to the current question, and flags conflicts. Your existing AI writes the answer. No Marvnor client download or extra model setup is required.

Open the [product home](https://api.marvnor.com/home) and select “Create a test API Key” to try it without signing up: the guest key has 500 points and lasts 30 days. The key is shown only once. If you later sign up or sign in in the same browser and confirm the transfer, the same key, saved facts, and unexpired document drafts remain available. Unused guest points do not add to your account; the registration page shows the separate sign-up offer.

During the trial, open [Connect an AI tool](https://api.marvnor.com/connect) in the same browser where you created the key. Add that key to the AI you already use. Give it a file or ask it to read a local file, then ask it to save evidence-backed facts in chunks and ask you about conflicts. The [LLM integration guide](docs/customer/llm-integration.md) explains the tool setup and working rule.

You can also paste text or upload UTF-8 TXT / Markdown (up to 1 MiB) in the signed-in [console's material section](https://api.marvnor.com/#memory), or open the [guest import page](https://api.marvnor.com/imports) in that same browser. Signed-in users choose which key to use; the guest page uses the trial key without asking for it again. Send the displayed message to your connected AI. The page stages the source text; it does not call another model. Staged text remains for up to 24 hours. Only successfully saved facts enter memory, so check the save receipts and progress, and resume after an interruption. Revising a document does not automatically replace old facts.

`verify` and `recall` return six-field answers. Document tools return your own source chunks, progress, or save receipts under the same key; these are not verification answers.

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

If the write times out, the record may already have been saved. Use the printed test ID to [delete by your own record ID](docs/customer/record-management.md). Do not clear the entire key's memory.

- `401`: check that the key is valid.
- `402`: check your available quota.
- `UNKNOWN`: check naming, key, context, and time. Do not treat it as a negative conclusion.
- `conflict: true`: check the conflicting values; do not let the LLM arbitrarily select one.

This completes the smallest working flow. For a production integration, keep a mapping between original facts, record receipts, and sources in your own system. Follow the [LLM integration guide](docs/customer/llm-integration.md) to send only the current question and relevant results to your model.
