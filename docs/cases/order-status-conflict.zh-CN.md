# 同一订单同时出现 `pending` 和 `paid`，该怎么回答？

[English](order-status-conflict.md) · [API 文档](../../PUBLIC_EVALUATION_API.md) · [示例源码](../../examples/quickstart.py)

用户问客服助手：“这个订单付款了吗？”两条记录却给出不同状态：`pending`（待处理）和 `paid`（已支付）。应用需要先把冲突找出来，再让大模型组织回答。

这个案例使用合成记录，依据是 **2026 年 10 月 10 日 12:09:46 UTC** 的[真实 API 录制结果](../../examples/recorded-run.json)。它验证了一组订单状态的完整操作流程，不代表所有输入都能得到正确结果。

## 冲突实际返回什么

示例保存两种状态后，调用 `POST /v1/evaluate`。指定 `target: "paid"` 的问题返回 `UNKNOWN`，并标记 `conflict: true`。省略 `target` 则查询已知候选值。以下六字段答案直接取自录制结果的第二阶段：

```json
{
  "conclusion": "UNKNOWN",
  "conflict": true,
  "reason": "conflicting_values",
  "path": ["paid", "pending"],
  "decision": "needs_review",
  "evidence_kind": "conflict"
}
```

应用只把当前问题和相关六字段答案交给大模型。助手可以回答：“记录存在冲突：一条是 `paid`，另一条是 `pending`。请确认哪个状态有依据。”不能因为某个值出现得更晚就直接采信。完整接入方式见[大模型集成指南](../customer/llm-integration.md)。

## 解除冲突、纠错，再删除

[Python 示例](../../examples/README.md)对持久化记录执行五个阶段：

| 操作 | 是否为 `pending` | 是否为 `paid` | 有无冲突 |
| --- | --- | --- | --- |
| 保存 `pending` | TRUE | UNKNOWN | 无 |
| 再保存 `paid` | UNKNOWN | UNKNOWN | 有 |
| 删除造成冲突的 `paid` 记录 | TRUE | UNKNOWN | 无 |
| 把剩余记录改为 `paid` | UNKNOWN | TRUE | 无 |
| 删除演示记录 | UNKNOWN | UNKNOWN | 无 |

脚本按既定步骤修改合成数据。真实业务中，应先核对来源或取得用户确认，再决定删除或纠正哪条记录。写入成功并不表示该状态已得到独立的现实核验。

定向删除后，录制的候选值答案为：

```json
{
  "conclusion": "UNKNOWN",
  "conflict": false,
  "reason": "no_known_values",
  "path": [],
  "decision": "unknown",
  "evidence_kind": "unknown"
}
```

没有剩余证据，不等于“未付款”。助手应说明：现有记录已无法确定订单状态。

## 自己复现

准备 Python 3.9 或更高版本，克隆或下载本仓库后运行：

```sh
cd examples
python quickstart.py --replay
```

回放只读取仓库中的录制文件，不联网，也不需要账号。要重新调用真实 API，运行：

```sh
python quickstart.py --output my-demo-run.json
```

在隐藏输入提示中填写自己的 Key。真实调用消耗账号额度，创建随机演示对象，检查五阶段结果，并尝试定向清理。其他记录和 Key 会保留。输出文件不能已存在。中途停止时，请参考[接入与清理说明](../../examples/README.md)。

`POST /v1/evaluate` 也支持提交临时事实；这些事实仅用于当次请求，不会保存。要复现持久化写入、编辑和删除流程，请使用上面的 Python 示例。
