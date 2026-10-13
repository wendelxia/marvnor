# 免费开始使用 Marvnor / Start with free points

注册即送 **1,000 积分，永久有效**。在控制台创建 API Key，就可以接入 Marvnor 托管 API。服务端核心保持闭源；此仓库提供公开文档、示例和测试材料。

## 三步接入

1. [注册 Marvnor 账号](https://api.marvnor.com/register?lang=zh-CN)，领取 1,000 积分。
2. 在[控制台](https://api.marvnor.com/?lang=zh-CN)创建 API Key，妥善保存。
3. 将 Key 配置到自己的应用，或运行下面的示例。

积分按 API 计费规则消耗，并非请求次数。费用依次使用赠送积分、套餐额度和已充值余额，不会从外部支付账户自动扣款。

## 运行示例

下载 [quickstart.py](https://raw.githubusercontent.com/wendelxia/marvnor/main/examples/quickstart.py)，使用 Python 3.9 或以上版本运行：

```sh
python quickstart.py
```

在隐藏输入提示中粘贴 API Key。示例通过真实 API 完成保存事实、发现冲突、消除冲突、纠错和删除示例数据，会按实际调用消耗积分。它仅删除自己写入的合成记录。

在[控制台](https://api.marvnor.com/?lang=zh-CN)查看剩余额度，也可以用同一 Key 调用 `GET https://api.marvnor.com/v1/quota`。不要把 Key 写入聊天记录、公开仓库或反馈邮件。

只把当前问题和相关 Marvnor 结果交给大模型；不要转发完整历史或全量数据。出现冲突时列出冲突值，请用户核对；未知结果不能当作事实。只写入有依据或用户已确认的信息。

[大模型接入](llm-integration.md) · [API 文档](../../PUBLIC_EVALUATION_API.md) · [示例与运行记录](../../examples/README.md)

## English

Sign up to receive **1,000 free points that never expire**. Create an API Key in the console, then connect to Marvnor's hosted API. The server core remains proprietary; this repository contains public documentation, examples and test materials.

1. [Register an account](https://api.marvnor.com/register?lang=en) to receive your 1,000 points.
2. Create an API Key in the [console](https://api.marvnor.com/?lang=en) and keep it private.
3. Configure the Key in your application or run the [Python example](../../examples/README.md).

Points are usage credits, not a request count. Usage draws from gift points, then subscription allowance, then your topped-up balance; no external payment method is charged automatically.

Run `python quickstart.py` with Python 3.9+ and paste your Key at the hidden prompt. The example saves a fact, detects and resolves a conflict, corrects the fact, then deletes only its own synthetic records. API calls consume points according to the current pricing.

Check your remaining credit in the [console](https://api.marvnor.com/?lang=en), or call `GET /v1/quota` with the same Key. Keep the Key out of chats, public repositories and feedback emails.

Send only the current question and relevant Marvnor results to your model. List conflicting values and ask the user to confirm; do not treat unknown results as facts. Save only information supported by evidence or confirmed by the user. See [LLM integration](llm-integration.md).
