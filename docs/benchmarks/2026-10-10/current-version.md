# Current-version evidence review

Checked on October 10, 2026 (Asia/Shanghai).

## Summary

The review replayed saved test cases against an isolated local instance and checked behaviors that had changed since earlier tests. All **500 expected verdicts across 25 sequential requests** matched, and **14 targeted feature checks** passed.

A read-only comparison confirmed that all 21 imported Python source files used in this replay matched the active public-service release. This ties the results to current source, not to an equivalent production environment: dependencies, configuration, real account data, worker layout, network conditions, and capacity were not retested.

[Full sanitized per-question results](current-version.json) · [Revised benefits](highlights.md)

## Conclusions that changed

| Earlier conclusion or uncertainty | Current observation | What may now be said |
| --- | --- | --- |
| Time/context-wrapped compound logic is unsupported | A scoped AND query passed in its valid time and context; outside either it returned UNKNOWN | Supported through the documented `scope` operator; the old outer-field syntax is still rejected |
| Facts without timestamps become unknown in a timed query | Supplied unrestricted facts supported a time-scoped compound query | Missing time metadata alone does not invalidate an otherwise supported fact |
| `supports` cannot follow a multi-hop path | Five hops returned TRUE and a six-node path | The tested `supports` chain works; do not generalize this to arbitrary custom predicates |
| Conflict detection only compares evidence in a single request | Two persisted values of a single-valued custom attribute made either query UNKNOWN with conflict true | Applicable saved records can conflict across writes |
| A query cannot return candidate values without a target | Omitting `target` returned both conflicting values | Candidate-value queries are supported; omitting a field is not the same as sending an empty string |
| Editing a custom attribute may leave the old claim active | The replacement returned TRUE and the previous value UNKNOWN | The tested in-place custom-attribute edit works |
| Cleanup may require clearing the entire key | Targeted deletion removed one fact and preserved other memory | Use scoped record management; clearing all memory is a separate operation |

These are narrow functional observations. Conflict rules apply to structured records, their value cardinality, context, and validity. They do not establish automatic detection of every contradiction in free-form text.

## Historical cases replayed

| Group | Current local requests | Expected verdicts matched | Input provenance |
| --- | ---: | ---: | --- |
| A: long chains and compound logic | 1 | 20/20 | Saved request payload |
| B: time, environments and conflicts | 1 | 20/20 | Saved request payload |
| C: seven generated datasets, three versions each | 21 | 420/420 | Archived deterministic generator; expectations checked against saved records |
| D: complex conditions and identifiers | 1 | 20/20 | Saved request payload |
| E: deep logic and alternative paths | 1 | 20/20 | Archived deterministic generator; shape and expectations checked against saved records |
| Total | 25 | 500/500 | Local sequential replay only |

Every replay request returned HTTP 200, and every answer contained exactly the six public answer fields. The replay checked verdicts and field sets; it did not compare every reason string or evidence path byte for byte. Expected verdicts for A and B were also reviewed using independent path and time/context calculations.

C and E used synthetic local namespaces when regenerating inputs. The expected answers were unchanged. There are repeated question templates and input variants in the total, so it is not a score on 500 independent new questions.

E's archived payload included 64 nested NOT operators and was accepted in the current replay. Use the [API reference](../../../PUBLIC_EVALUATION_API.md) for current validation limits, rather than inferring a new limit from this example.

## Fourteen targeted checks

| Check | Expected and observed result |
| --- | --- |
| Scoped compound query inside the validity window | TRUE |
| Same query before its validity window | UNKNOWN |
| Same query in a different context | UNKNOWN |
| Time-scoped compound query over supplied unrestricted facts | TRUE |
| Unsupported outer time/context fields beside a compound claim | HTTP 400 |
| Five-hop `supports` chain | TRUE, six path nodes |
| First of two saved single-valued attribute values | UNKNOWN, conflict true |
| Second saved value | UNKNOWN, conflict true |
| Candidate-value query with `target` omitted | UNKNOWN, conflict true, both values returned |
| Delete one conflicting record and query the remaining one | TRUE, no conflict |
| Edit a custom attribute and query its replacement | TRUE |
| Query the previous value after that edit | UNKNOWN |
| Delete the replacement and query it again | UNKNOWN |
| Query unrelated saved memory after targeted deletion | TRUE |

All temporary writes and deletions were confined to the local test instance. No customer records, paid model calls, or production API requests were used.

## Results not refreshed by this review

- DeepSeek's historical 16/20 and 15/20 answers were not rerun. Pairing them with a current local replay does not create a new head-to-head comparison.
- The 10- and 20-request concurrency runs, including the roughly 597 ms median, describe October 7 only. Current latency, throughput, mixed-workload behavior, and production capacity remain unmeasured here.
- The 98.2% token reduction describes one October 8 final-query example. Extraction, retrieval, updates, fees, and cache pricing are needed for a total-cost comparison. No new token or cost run was made.
- The October 9 local Qwen confirmation workflow was not rerun. Its 8/8 workflow checks were not eight perfect model answers.
- The older ProofWriter, NLGraph, and 10-question general-capability summaries were not revalidated. They are not current-version capability scores.

The original figures remain in the [historical methods](methods.md) and [historical data](data.json), with their dates. A later release needs its own verification before using these current-source conclusions as current again.
