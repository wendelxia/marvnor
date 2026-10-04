# Marvnor 是做什么的

大模型负责读资料、写答案；Marvnor 负责算清关键判断。应用把要核对的结论和已整理的信息交给它，它默认返回六项结果，供模型和应用继续使用。

## 六项返回值

| 字段 | 你能从中看到什么 |
|---|---|
| `conclusion` | 待核对结论是 `TRUE`、`FALSE`，还是暂时无法判断的 `UNKNOWN`。 |
| `evidence_kind` | 依据的类型，例如直接、间接、组合、冲突或未知。 |
| `conflict` | 是否存在互相矛盾的依据。 |
| `reason` | 得出这个结果的原因代码，方便应用识别。 |
| `decision` | 给应用的处理信号，例如作答、放行、拦截或澄清；最终动作由应用决定。 |
| `path` | 可供回看的依据路径；没有可用路径时为空。 |

例如，应用交来的资料同时支持和反对同一个结论时，单个问题的返回可以是这样（`A`、`B` 仅作示意）：

```json
{
  "conclusion": "UNKNOWN",
  "evidence_kind": "conflict",
  "conflict": true,
  "reason": "conflicting_evidence",
  "decision": "clarify",
  "path": ["A", "B"]
}
```

这时模型不用选一边硬答，可以提醒使用者先核对冲突。资料没交给 Marvnor，它就不能替你判断；重要决策仍应回看原始资料。

想试用，可以从一个答案能人工核对的问题开始。[使用方法](USAGE.md)写了起步步骤，[测试页](TESTS.md)列出目前公开的接入效果。

[打开用户端](https://marvnor.com)
