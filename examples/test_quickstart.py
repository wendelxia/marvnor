import io
import json
import unittest
import urllib.error
from unittest.mock import patch

import quickstart as demo


def answer(conclusion, conflict=False, path=None):
    return dict(conclusion=conclusion, conflict=conflict, path=path or [],
                reason="test_fixture", decision="clarify" if conflict else "answer",
                evidence_kind="conflict" if conflict else "direct")


class MemoryAPI:
    """Isolated test double; not a replacement for live API verification."""
    def __init__(self):
        self.rows = {"unrelated": {"source": "customer-data", "relation": "status", "target": "paid"}}
        self.calls = []
        self.fail_write = False
        self.fail_cleanup = False
        self.fail_evaluate = False

    def __call__(self, method, path, payload):
        self.calls.append((method, path, payload))
        if path == "/v1/relations":
            fact = payload["relations"][0].copy()
            receipt = "mr_" + str(len(self.rows))
            self.rows[receipt] = fact
            if self.fail_write:
                raise demo.DemoError("Write timed out; state is uncertain")
            return {"ok": True, "record_ids": [receipt]}
        if method == "PATCH":
            self.rows[path.rsplit("/", 1)[1]].update(payload)
            return {"ok": True}
        if path == "/v1/relations/delete":
            if self.fail_cleanup:
                raise demo.DemoError("Cleanup unavailable")
            matches = []
            for receipt, row in self.rows.items():
                if receipt in payload.get("record_ids", []):
                    matches.append(receipt)
                elif any(all(row.get(k) == fact[k] for k in ("source", "relation", "target"))
                         for fact in payload.get("relations", [])):
                    matches.append(receipt)
            for receipt in matches:
                del self.rows[receipt]
            return {"ok": True, "deleted_count": len(matches)}
        if path == "/v1/evaluate":
            if self.fail_evaluate:
                raise demo.DemoError("Evaluation unavailable")
            answers = {}
            for q in payload["questions"]:
                values = sorted({r["target"] for r in self.rows.values()
                                 if r["source"] == q["source"] and r["relation"] == q["relation"]})
                conflict = len(values) > 1
                supported = bool(values) if "target" not in q else q["target"] in values
                answers[q["id"]] = answer("UNKNOWN" if conflict or not supported else "TRUE", conflict, values)
            return {"answers": answers}
        raise AssertionError((method, path))


class DemoTests(unittest.TestCase):
    def test_full_flow_verifies_conflicts_correction_and_deletion(self):
        api = MemoryAPI()
        events = []
        result = demo.run_demo(api, events.append)
        self.assertEqual(len(result["stages"]), 5)
        self.assertEqual(result["stages"][0]["answers"]["pending"]["conclusion"], "TRUE")
        self.assertTrue(result["stages"][1]["answers"]["pending"]["conflict"])
        self.assertEqual(result["stages"][1]["answers"]["values"]["path"], ["paid", "pending"])
        self.assertEqual(result["stages"][3]["answers"]["paid"]["conclusion"], "TRUE")
        self.assertEqual(result["stages"][4]["answers"]["paid"]["conclusion"], "UNKNOWN")
        self.assertEqual(list(api.rows), ["unrelated"])
        self.assertFalse(any("/clear" in path for _, path, _ in api.calls))

    def test_write_timeout_still_attempts_exact_cleanup_and_never_retries_write(self):
        api = MemoryAPI()
        api.fail_write = True
        with self.assertRaises(demo.DemoError):
            demo.run_demo(api, lambda _: None)
        self.assertEqual(list(api.rows), ["unrelated"])
        self.assertEqual(sum(path == "/v1/relations" for _, path, _ in api.calls), 1)

    def test_evaluate_failure_cleans_demo_records(self):
        api = MemoryAPI()
        api.fail_evaluate = True
        with self.assertRaises(demo.DemoError):
            demo.run_demo(api, lambda _: None)
        self.assertEqual(list(api.rows), ["unrelated"])

    def test_cleanup_failure_is_not_reported_as_success(self):
        api = MemoryAPI()
        api.fail_cleanup = True
        with self.assertRaisesRegex(demo.DemoError, "cleanup"):
            demo.run_demo(api, lambda _: None)

    def test_unexpected_verdict_fails_and_cleans_up(self):
        api = MemoryAPI()
        def broken(method, path, payload):
            result = api(method, path, payload)
            if path == "/v1/evaluate":
                result["answers"]["pending"]["conclusion"] = "FALSE"
            return result
        with self.assertRaises(demo.DemoError):
            demo.run_demo(broken, lambda _: None)
        self.assertEqual(list(api.rows), ["unrelated"])

    def test_each_run_uses_a_new_subject(self):
        api = MemoryAPI()
        a = demo.run_demo(api, lambda _: None)
        b = demo.run_demo(api, lambda _: None)
        self.assertNotEqual(a["source"], b["source"])

    def test_request_rejects_redirect_without_forwarding_key(self):
        handler = demo.NoRedirect()
        with self.assertRaises(demo.DemoError):
            handler.redirect_request(None, None, 302, "Found", {}, "https://elsewhere.example/")

    def test_http_error_does_not_echo_body_or_key(self):
        error = urllib.error.HTTPError(demo.BASE_URL, 401, "Unauthorized", {}, io.BytesIO(b"PRIVATE SECRET"))
        with patch("urllib.request.OpenerDirector.open", side_effect=error):
            with self.assertRaises(demo.DemoError) as caught:
                demo.make_request("private-key")("POST", "/v1/evaluate", {})
        self.assertNotIn("PRIVATE", str(caught.exception))
        self.assertNotIn("private-key", str(caught.exception))
        self.assertIn("401", str(caught.exception))

    def test_invalid_or_extra_answer_fields_rejected(self):
        response = {"answers": {"q": answer("TRUE")}}
        response["answers"]["q"]["internal_state"] = "do not expose"
        with self.assertRaises(demo.DemoError):
            demo.checked_answers(response, {"q": ("TRUE", False)})

    def test_malformed_json_is_a_clear_error(self):
        with patch("urllib.request.OpenerDirector.open") as opened:
            opened.return_value.__enter__.return_value = io.BytesIO(b"not json")
            with self.assertRaises(demo.DemoError):
                demo.make_request("private-key")("POST", "/v1/evaluate", {})


if __name__ == "__main__":
    unittest.main()
