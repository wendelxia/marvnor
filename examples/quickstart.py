"""Run a real, isolated Marvnor memory demo. Python 3.9+, standard library only."""
import argparse
import getpass
import json
import os
from pathlib import Path
import re
import sys
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone

BASE_URL = "https://api.marvnor.com"
FIELDS = {"conclusion", "conflict", "reason", "decision", "evidence_kind", "path"}


class DemoError(Exception):
    pass


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise DemoError("Redirect refused. The API key was not forwarded.")


def make_request(key):
    if not key or not key.strip() or any(c.isspace() for c in key):
        raise DemoError("Enter a valid API key without spaces.")
    opener = urllib.request.build_opener(NoRedirect())

    def request(method, path, payload):
        req = urllib.request.Request(
            BASE_URL + path, method=method,
            data=json.dumps(payload).encode("utf-8"),
            headers={"Authorization": "Bearer " + key, "Content-Type": "application/json"},
        )
        try:
            with opener.open(req, timeout=45) as response:
                result = json.load(response)
            if not isinstance(result, dict):
                raise DemoError("The API did not return a JSON object.")
            return result
        except urllib.error.HTTPError as error:
            hints = {401: "Check your API key.", 402: "Check your account quota.",
                     403: "Use a customer API key.", 429: "Wait before running again."}
            error.close()
            raise DemoError(f"HTTP {error.code}. " + hints.get(error.code, "Check the API status and contact support.")) from None
        except (TimeoutError, urllib.error.URLError, OSError):
            raise DemoError("Network request failed or timed out. A write may already have committed; do not blindly retry it.") from None
        except (ValueError, UnicodeError):
            raise DemoError("The API returned unreadable JSON.") from None
    return request


def checked_answers(response, expected):
    answers = response.get("answers")
    if set(response) != {"answers"} or not isinstance(answers, dict) or set(answers) != set(expected):
        raise DemoError("Unexpected evaluation response shape.")
    for name, (conclusion, conflict) in expected.items():
        item = answers[name]
        if not isinstance(item, dict) or set(item) != FIELDS:
            raise DemoError("Expected exactly six public answer fields.")
        if (item["conclusion"] != conclusion or item["conflict"] is not conflict
                or not isinstance(item["path"], list)
                or any(not isinstance(item[field], str) for field in ("reason", "decision", "evidence_kind"))):
            raise DemoError(f"Unexpected verdict for {name}; the demo did not pass.")
    return answers


def run_demo(request, emit=print):
    source = "demo-" + uuid.uuid4().hex
    facts = [{"source": source, "relation": "status", "target": target} for target in ("pending", "paid")]
    questions = [{"id": target, **fact} for target, fact in zip(("pending", "paid"), facts)]
    questions.append({"id": "values", "source": source, "relation": "status"})
    report = {"captured_at": datetime.now(timezone.utc).isoformat(), "endpoint": BASE_URL,
              "mode": "live", "source": source, "stages": []}
    emit("Demo subject: " + source)

    def write(index):
        fact = {**facts[index], "client_record_id": source + "-" + str(index)}
        result = request("POST", "/v1/relations", {"relations": [fact]})
        ids = result.get("record_ids")
        if (result.get("ok") is not True or not isinstance(ids, list) or len(ids) != 1
                or not isinstance(ids[0], str) or not re.fullmatch(r"mr_[A-Za-z0-9_-]{1,500}", ids[0])):
            raise DemoError("Write acknowledgement is incomplete. Do not retry blindly.")
        return ids[0]

    def evaluate(label, pending, paid, conflict=False):
        expected = {"pending": (pending, conflict), "paid": (paid, conflict),
                    "values": ("UNKNOWN" if conflict or (pending == paid == "UNKNOWN") else "TRUE", conflict)}
        answers = checked_answers(request("POST", "/v1/evaluate", {"questions": questions}), expected)
        if conflict and answers["values"]["path"] != ["paid", "pending"]:
            raise DemoError("Expected both conflicting candidate values.")
        stage = {"label": label, "answers": answers}
        report["stages"].append(stage)
        emit(json.dumps(stage, ensure_ascii=True))

    try:
        original = write(0)
        evaluate("1. Saved fact", "TRUE", "UNKNOWN")
        conflicting = write(1)
        evaluate("2. Conflicting records", "UNKNOWN", "UNKNOWN", True)
        removed = request("POST", "/v1/relations/delete", {"record_ids": [conflicting]})
        if removed.get("ok") is not True or removed.get("deleted_count") != 1:
            raise DemoError("Targeted deletion was not confirmed.")
        evaluate("3. Conflict resolved", "TRUE", "UNKNOWN")
        edited = request("PATCH", "/v1/relations/" + original, {"target": "paid"})
        if edited.get("ok") is not True:
            raise DemoError("Correction was not confirmed.")
        evaluate("4. Corrected fact", "UNKNOWN", "TRUE")
    finally:
        # Exact synthetic facts also cover a committed write whose receipt was lost.
        try:
            cleanup = request("POST", "/v1/relations/delete", {"relations": facts})
            if cleanup.get("ok") is not True or type(cleanup.get("deleted_count")) is not int:
                raise DemoError("Unconfirmed cleanup")
        except Exception:
            raise DemoError("Demo cleanup was not confirmed for " + source
                            + ". Delete only this subject's status=pending and status=paid facts; never clear the key.") from None
    evaluate("5. Demo data deleted", "UNKNOWN", "UNKNOWN")
    emit("PASS: five stages verified; demo facts removed; existing memory and key retained.")
    return report


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--replay", action="store_true", help="Read the checked-in recording; no key, network call or usage")
    parser.add_argument("--output", type=Path, help="Save this run's synthetic results as JSON (never includes the API key)")
    args = parser.parse_args(argv)
    try:
        if args.replay:
            report = json.loads(Path(__file__).with_name("recorded-run.json").read_text(encoding="utf-8"))
            print("RECORDED API RUN, not a live call. Captured: " + report["captured_at"])
            for stage in report["stages"]:
                print(json.dumps(stage, ensure_ascii=True))
            return 0
        print("LIVE API DEMO: uses your account quota; writes two synthetic facts and removes only demo data.")
        key = os.environ.get("MARVNOR_API_KEY") or getpass.getpass("Marvnor API key (hidden): ")
        report = run_demo(make_request(key.strip()))
        if args.output:
            with args.output.open("x", encoding="utf-8") as destination:
                json.dump(report, destination, ensure_ascii=True, indent=2)
                destination.write("\n")
        return 0
    except (DemoError, OSError, ValueError, EOFError) as error:
        print("STOP: " + str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
