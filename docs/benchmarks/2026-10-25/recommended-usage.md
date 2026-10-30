# Recommended usage: evidence from paired tests

Date: October 25, 2026.

## Result

Use Marvnor as an on-demand project-memory and record-verification layer. Call it when the current question depends on saved project facts, constraints, decisions, states, or a deterministic stored path. Do not force unrelated, self-contained tasks through it, and do not replace source files or original material with extracted facts.

When Marvnor is used, send the final model the current question and all six fields of only the relevant results. A conclusion alone is not enough when the answer depends on a path, conflict, or missing evidence.

## Evidence

| Test | Observed result | Usage implication |
| --- | --- | --- |
| 59 paired third-party general questions with no usable project memory | Corrected score tied at 44/59; the Marvnor arm used 6.8% more model tokens | Bypass Marvnor for self-contained tasks |
| 97 non-repeated valid HaluEval items across two runs | Model-only 96/97; Marvnor arm 94/97 | A true stored record is not proof of the whole natural-language answer |
| Six questions from a pinned `psf/requests` revision | Direct source 6/6; extracted facts replacing source 0/6 | Keep source/code tools; store stable project decisions and constraints instead |
| 20 third-party LongProc high-hop path questions | On 19 complete pairs, both arms scored 19/19; the Marvnor arm's median answer latency was 33.9% lower | Deterministic stored paths are an appropriate use case |
| Current public five-edge verification | `TRUE`, a six-node path, no conflict, and a compact public reason code | The deployed six-field result can carry a compact verified path |
| New conclusion-only ablation on an unseen 359-hop LongProc item | Qwen 3 4B invented a route; exact score failed from the first hop | Preserve `path`; do not forward only `conclusion` |

The new ablation used the unmodified LongProc item `path_traversal_8k_158`, question SHA256 `a8d6f1754da26030ee028aceae9cac145daf764f4560cbb02d8fd431d4827a7f`. The local model used temperature 0 and a fixed seed. It received the named query and `TRUE`, but no path; it returned an unsupported route after 164.964 seconds. This isolates an integration error: the model was told that a route exists but was not given the route evidence.

The planned DeepSeek transport ablation received HTTP 402 for every request and produced no scored answers. The local four-arm continuation completed only the conclusion-only arm before it was stopped, so no result is reported for the unfinished arms. The full-result recommendation also relies on the completed earlier LongProc paired runs and the current production response contract, not on those unfinished calls.

## Recommended flow

1. Use one key for one independent project.
2. Save only important user-confirmed or sourced facts and update changes in place.
3. Use `recall` for a current memory question or to list saved fields for a known subject, and `verify` for a precise claim.
4. Forward the current question and all six fields of relevant results. Request source excerpts only when citations are needed.
5. Ask the user to resolve conflicts. Treat `UNKNOWN` as insufficient evidence for the named claim, not as false and not as a verdict on the whole task.
6. Continue to use source, file, RAG, compiler, and other domain tools for the material they own.

Sources: [PrincetonPLI/LongProc](https://github.com/princeton-pli/LongProc), [HaluEval](https://github.com/RUCAIBox/HaluEval), and the public [`psf/requests`](https://github.com/psf/requests) repository. These are project-run tests, not an independent audit.

