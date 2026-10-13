# 7 天开发者试用 / 7-day developer trial

使用独立试用 Key，在自己的程序中调用 Marvnor 托管 API。服务端核心保持闭源；此仓库提供公开文档、示例和测试材料。

## 领取

1. [注册 Marvnor 账号](https://api.marvnor.com/register?lang=zh-CN)。
2. [发送试用申请](mailto:wendelxia@gmail.com?subject=Marvnor%207-day%20developer%20trial)，附上账户 ID、测试用途和预计接入方式。不要发送密码、API Key 或私密数据。
3. 人工审核后签发独立 Key，每个账号限领取一次。注册不会自动签发试用 Key；撤销后也不能重新领取。

## 额度与时间

| 项目 | 规则 |
| --- | --- |
| 期限 | 首次成功业务调用起 7 × 24 小时 |
| 总额度 | 1,000 独立积分，并非 1,000 次请求；消耗按实际 API 计费规则计算 |
| 频率 | 每个试用 Key 每分钟最多 30 次请求；收到 429 时按 `Retry-After` 等待 |
| 结束 | 积分用尽或时间到期即停止，不自动扣付费余额、不自动升级 |
| 数据 | 与普通 Key 隔离；到期不立即删除，连续 30 天未使用或主动撤销时按现有规则清理 |

成功读写记录、纠错、删除或核验会开始计时。查询额度、查看能力、MCP 握手以及失败请求不会开始计时。失败请求不扣试用积分，但经过认证的请求仍受频率限制。

新注册账号原有的 1,000 积分永久赠送与本试用相互独立。试用 Key 不使用注册赠送、充值或套餐余额，也不能管理其他 Key 或操作订单。到期后需要使用普通 Key；试用数据不会自动迁入普通 Key。

## 开始测试

下载 [quickstart.py](https://raw.githubusercontent.com/wendelxia/marvnor/main/examples/quickstart.py)，使用 Python 3.9 或以上版本运行：

```sh
python quickstart.py
```

在隐藏输入提示中粘贴试用 Key。示例通过真实 API 完成保存事实、发现冲突、消除冲突、纠错和删除示例数据。运行会开始试用计时并消耗试用积分。示例仅删除自己写入的合成记录。

在[控制台](https://api.marvnor.com/?lang=zh-CN)查看试用 Key 的状态、剩余积分和到期时间。也可以用同一 Key 调用 `GET https://api.marvnor.com/v1/quota`；有效试用 Key 返回 `trial` 对象，不返回普通钱包余额。已过期或用尽的 Key 请通过控制台查看状态。

| REST HTTP 响应 | 含义 |
| --- | --- |
| `401` / `trial_expired` | 七天期限已到 |
| `402` / `trial_exhausted` | 试用积分已用尽 |
| `402` / `trial_quota_exceeded` | 剩余额度不足以执行本次请求，或部分额度正被进行中的请求预留 |
| `403` / `trial_scope_denied` | 此操作不在试用 Key 权限内 |
| `429` | 请求过快，按 `Retry-After` 重试 |

MCP 工具错误可能包装在 HTTP 200 响应中，请同时检查 JSON-RPC 错误或 `result.isError`。

只把当前问题和相关 Marvnor 结果交给大模型；不要转发完整历史或全量数据。出现冲突时列出冲突值，请用户核对；未知结果不能当作事实。只写入有依据或用户已确认的信息。详见[大模型接入](llm-integration.md)。

## English

[Register an account](https://api.marvnor.com/register?lang=en), then [email a trial request](mailto:wendelxia@gmail.com?subject=Marvnor%207-day%20developer%20trial) with your account ID, intended use and integration method. Do not send passwords, API keys or private data. A separate Key is issued manually, once per account; registration does not issue it automatically, and revocation does not reset eligibility.

The trial includes **1,000 separate points**, permits **30 requests per minute**, and runs for **7 × 24 hours from the first successful business API request**. Points are not a request count. Successful record reads, writes, edits, deletions and evaluations start the clock. Quota/capability checks, MCP handshakes and failed requests do not. Failed requests do not consume trial points, but authenticated requests still count toward the rate limit.

Access stops when time or points run out. It never falls back to signup, paid or subscription funds and never automatically upgrades. The existing permanent signup gift remains separate. Trial keys cannot manage other keys or orders. Their records are isolated from ordinary keys and are not automatically transferred after the trial. Expiry does not immediately delete records; existing cleanup rules apply after 30 days of inactivity or when you revoke the Key.

Run the [Python example](../../examples/README.md) and paste the trial Key at its hidden prompt. This starts the clock and consumes trial points. View trial state, points and expiry in the [console](https://api.marvnor.com/?lang=en), or call `GET /v1/quota` with an active trial Key. An expired or exhausted Key is rejected; use the console to check its state. A `429` response includes `Retry-After`. Share reproducible results and non-sensitive examples with your feedback; keep your Key private.
