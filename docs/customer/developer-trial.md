# 免费开始使用 Marvnor / Start with free points

先在[产品首页](https://api.marvnor.com/home?lang=zh-CN)免注册创建测试 Key，获得 **500 积分、30 天试用**，可以使用自己的资料。试用到期前，在同一浏览器注册并确认接续，原 Key 与已保存的事实保留；注册另赠 **1,000 积分**，未用完的访客积分不转入账户。服务端核心保持闭源；此仓库提供公开文档、示例和测试材料。

## 三步接入

1. 在[首页](https://api.marvnor.com/home?lang=zh-CN)点击“创建测试 API Key”，马上保存一次性显示的 Key。
2. 在[试用空间](https://api.marvnor.com/try)导入自己的资料，或把 Key 接入 AI 工具与下面的示例。
3. 试用到期前，在同一浏览器中[注册](https://api.marvnor.com/register?lang=zh-CN)或登录，并确认接续试用资料。

积分按 API 计费规则消耗，并非请求次数。试用期间使用试用额度；注册接续后按账户当前套餐计费，不会从外部支付账户自动扣款。

## 运行示例

下载 [quickstart.py](https://raw.githubusercontent.com/wendelxia/marvnor/main/examples/quickstart.py)，使用 Python 3.9 或以上版本运行：

```sh
python quickstart.py
```

在隐藏输入提示中粘贴 API Key。示例通过真实 API 完成保存事实、发现冲突、消除冲突、纠错和删除示例数据，会按实际调用消耗积分。它仅删除自己写入的合成记录。

在[试用空间](https://api.marvnor.com/try)查看剩余额度，也可以用同一 Key 调用 `GET https://api.marvnor.com/v1/quota`。不要把 Key 写入聊天记录、公开仓库或反馈邮件。

只把当前问题和相关 Marvnor 结果交给大模型；不要转发完整历史或全量数据。出现冲突时列出冲突值，请用户核对；未知结果不能当作事实。只写入有依据或用户已确认的信息。

[大模型接入](llm-integration.md) · [API 文档](../../PUBLIC_EVALUATION_API.md) · [示例与运行记录](../../examples/README.md)

## English

Start on the [product home](https://api.marvnor.com/home?lang=en) without signing up: create a test Key with **500 points for 30 days** and use your own material. Before the trial expires, register or sign in in the same browser and confirm the transfer to keep the same Key and saved facts. Registration separately grants **1,000 points**; unused guest points do not transfer. The server core remains proprietary; this repository contains public documentation, examples and test materials.

1. Select “Create a test API Key” on the [home page](https://api.marvnor.com/home?lang=en), and save the once-shown Key.
2. Use your own material in the [trial space](https://api.marvnor.com/try), connect the Key to your AI tool, or run the [Python example](../../examples/README.md).
3. Before the trial expires, [register](https://api.marvnor.com/register?lang=en) or sign in in the same browser, then confirm the transfer.

Points are usage credits, not a request count. Trial calls use the trial allowance; after registration, usage follows the current account plan. No external payment method is charged automatically.

Run `python quickstart.py` with Python 3.9+ and paste your Key at the hidden prompt. The example saves a fact, detects and resolves a conflict, corrects the fact, then deletes only its own synthetic records. API calls consume points according to the current pricing.

Check your remaining credit in the [trial space](https://api.marvnor.com/try), or call `GET /v1/quota` with the same Key. Keep the Key out of chats, public repositories and feedback emails.

Send only the current question and relevant Marvnor results to your model. List conflicting values and ask the user to confirm; do not treat unknown results as facts. Save only information supported by evidence or confirmed by the user. See [LLM integration](llm-integration.md).
