# Run the Marvnor demo

See a saved fact become a conflict, resolve it, correct the remaining record, then delete the demo data. The five-stage example calls the public API directly. No SDK or third-party Python packages.

## Start in three steps

1. Install Python 3.9 or later and [download quickstart.py](https://raw.githubusercontent.com/wendelxia/marvnor/main/examples/quickstart.py).
2. Create a key in the [customer portal](https://api.marvnor.com/) and check your available quota.
3. Run the file, then paste your key at the hidden prompt:

   ```sh
   python quickstart.py
   ```

On macOS/Linux, use `python3` if that is your Python command. For automation, set `MARVNOR_API_KEY` in your server-side environment instead of using the prompt.

This is a **live API call using your account quota**. It creates two synthetic facts under a new random subject, then deletes only those facts. It never clears your memory or revokes your key. The key is not printed, saved, or sent to a language model.

## What you will see

| Stage | `status=pending` | `status=paid` | Conflict |
| --- | --- | --- | --- |
| Save `pending` | TRUE | UNKNOWN | No |
| Also save `paid` | UNKNOWN | UNKNOWN | Yes, candidates `paid` and `pending` |
| Remove the conflicting record | TRUE | UNKNOWN | No |
| Correct the remaining record to `paid` | UNKNOWN | TRUE | No |
| Delete the demo data | UNKNOWN | UNKNOWN | No |

The script checks all five stages and exits with status `0` only when they pass. Every printed answer retains the six public fields.

This sequence passed against `https://api.marvnor.com` on October 10, 2026. [Inspect the recorded responses](recorded-run.json). To read that recording without an account, clone or download this repository and run:

```sh
python examples/quickstart.py --replay
```

Replay reads the saved JSON only; it is **not** a new API call. A new live run can save its own synthetic results using `--output my-demo-run.json`; an existing file is never overwritten.

## If the run stops

- **401:** check that you used a valid customer API key.
- **402:** check available quota in the portal.
- **Network timeout:** a write may have committed. Do not blindly repeat the write. The script attempts targeted cleanup and prints its unique `demo-...` subject.
- **Cleanup not confirmed:** use [targeted deletion by complete fact](../docs/customer/record-management.md#delete-by-complete-fact-when-you-did-not-save-an-id) for that exact subject, relation `status`, and the two targets `pending` / `paid`. Never clear the whole key to remove demo data.
- **Unexpected verdict:** keep the output and contact [support](mailto:wendelxia@gmail.com). Do not include your key.

## What you built

A working record lifecycle for an AI application: verify, detect ambiguity, correct the source of truth and remove selected memory. Next, [send only the current question and relevant results to your LLM](../docs/customer/llm-integration.md).

## Test the example locally

```sh
python -m unittest discover -s examples -p "test_*.py" -v
```

These tests use isolated fixtures, not a live account. They cover verdict checks, cleanup, timeouts, malformed responses, redirect refusal and keeping credentials out of errors.
