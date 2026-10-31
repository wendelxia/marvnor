# Recorded demo and reproduction

Everyday setup: [MCP quickstart](https://api.marvnor.com/docs?lang=en). Below: reproduce the recorded API demo.

Five stages: save, conflict, resolve, correct, delete. Uses the public API; no SDK or third-party Python packages.

## Reproduce the recorded test

1. Install Python 3.9 or later and [download quickstart.py](https://raw.githubusercontent.com/wendelxia/marvnor/main/examples/quickstart.py).
2. Create a test Key from the [product home](https://api.marvnor.com/home?lang=en) without signing up (500 points for 30 days), and save it when shown.
3. Run the file, then paste your key at the hidden prompt:

   ```sh
   python quickstart.py
   ```

On macOS/Linux, use `python3` if that is your Python command. For automation, set `MARVNOR_API_TOKEN` in your server-side environment instead of using the prompt. The older `MARVNOR_API_KEY` name still works.

**Live calls use your trial/account allowance.** The script creates two synthetic facts under a random subject and deletes only those facts. Other memory and your Key remain; the Key is never printed, saved or sent to a model.

## What you will see

| Stage | `status=pending` | `status=paid` | Conflict |
| --- | --- | --- | --- |
| Save `pending` | TRUE | UNKNOWN | No |
| Also save `paid` | UNKNOWN | UNKNOWN | Yes, candidates `paid` and `pending` |
| Remove the conflicting record | TRUE | UNKNOWN | No |
| Correct the remaining record to `paid` | UNKNOWN | TRUE | No |
| Delete the demo data | UNKNOWN | UNKNOWN | No |

Exit `0` means all five stages passed. Printed answers retain all six fields.

This sequence passed against `https://api.marvnor.com` on October 10, 2026. [Inspect the recorded responses](recorded-run.json). To read that recording without an account, clone or download this repository and run:

```sh
python examples/quickstart.py --replay
```

Replay reads saved JSON **without API calls**. Use `--output my-demo-run.json` to save a live run's synthetic results; existing files are never overwritten.

## If the run stops

- **401:** check that you used a valid customer API key.
- **402:** check available quota in the portal.
- **Network timeout:** a write may have committed. Do not blindly repeat the write. The script attempts targeted cleanup and prints its unique `demo-...` subject.
- **Cleanup not confirmed:** use [targeted deletion](https://api.marvnor.com/docs/api?lang=en) for that exact subject, relation `status`, and the two targets `pending` / `paid`. Never clear the whole key to remove demo data.
- **Unexpected verdict:** keep the output and contact [support](mailto:wendelxia@gmail.com). Do not include your key.

## What you built

A verified record lifecycle. Next: [send the question and relevant results to your LLM](https://api.marvnor.com/docs?lang=en).

## Test the example locally

```sh
python -m unittest discover -s examples -p "test_*.py" -v
```

Isolated tests, no live account: verdicts, cleanup, timeouts, malformed responses, redirect refusal and credential-safe errors.
