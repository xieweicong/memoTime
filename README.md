# MenoTime Slack Bot

MenoTime 是一个专为工作时间跟踪和统计设计的 Slack 机器人。它能够定期发送提醒，让用户记录他们的工作活动，并提供日常和月度的时间统计报告。

## 功能

- 定时发送工作活动提醒（每30分钟，工作日 10:00-19:00）
- 记录用户的工作活动（Issue、休憩、レビュー、資料整理、朝会、ミーティング）
- 提供日常工作时间统计（`/stats` 命令）
- 生成指定日期的工作时间报告（`/stats_date` 命令）
- 生成月度工作时间报告（`/stats_month` 命令）
- 清除统计数据（`/clear` 命令）

## 技术栈

- Node.js
- @slack/bolt: Slack Bot 框架
- moment-timezone: 时区处理
- node-cron: 定时任务
- dotenv: 环境变量管理
- PM2: 进程管理器

## 前置要求

- Node.js (版本 12 或更高)
- npm (通常随 Node.js 一起安装)
- PM2 (全局安装: `npm install -g pm2`)
- Slack 工作区的管理员权限

## 安装

1. 克隆仓库：
   ```
   git clone https://github.com/你的用户名/menotime.git
   cd menotime
   ```

2. 安装依赖：
   ```
   npm install
   ```

3. 创建 `.env` 文件并填写必要的环境变量：
   ```
   SLACK_BOT_TOKEN=xoxb-your-bot-token
   SLACK_SIGNING_SECRET=your-signing-secret
   PORT=3232
   ```

## 配置 Slack App

1. 在 [Slack API 网站](https://api.slack.com/apps) 创建一个新的 Slack App。
2. 在 "OAuth & Permissions" 页面，添加以下 Bot Token Scopes：
   - chat:write
   - commands
3. 安装 App 到你的工作区。
4. 在 "Basic Information" 页面获取 Signing Secret。
5. 在 "OAuth & Permissions" 页面获取 Bot User OAuth Token。

## 运行应用

使用 PM2 启动应用：

```
pm2 start app.js --name "menotime"
```

其他 PM2 常用命令：
- 查看日志：`pm2 logs menotime`
- 重启应用：`pm2 restart menotime`
- 停止应用：`pm2 stop menotime`
- 删除应用：`pm2 delete menotime`

## Slack 配置

1. 使用 ngrok 或类似工具为应用创建一个公共 URL。

2. 在 Slack App 配置页面的 "Event Subscriptions" 中，使用这个公共 URL 加上 `/slack/events`。

3. 在 "Slash Commands" 中，添加以下命令：
   - `/stats`: 获取今日统计
   - `/stats_date`: 获取指定日期统计
   - `/stats_month`: 获取指定月份统计
   - `/clear`: 清除统计数据

## 使用方法

- `/stats`: 显示今天的工作时间统计
- `/stats_date YYYY-MM-DD`: 显示指定日期的工作时间统计
- `/stats_month YYYY-MM`: 显示指定月份的工作时间统计
- `/clear`: 清除当前的统计数据

统计数据存储在 `stats_data` 文件夹中，每天一个 JSON 文件。

## 项目结构

- `app.js`: 主应用文件，设置 Slack Bot 和定时任务
- `commands.js`: 定义和处理 Slack 斜杠命令
- `reminders.js`: 处理定时提醒功能
- `stats.js`: 处理统计数据的读写
- `config.js`: 配置文件，从 .env 加载环境变量

## 注意事项

- 确保服务器时区设置为 `Asia/Tokyo`，或在代码中明确使用 `moment-timezone` 设置时区
- 定时提醒仅在工作日（周一至周五）的 10:00 到 19:00 之间每半小时发送一次
- 统计数据按日存储，确保 `stats_data` 文件夹有适当的读写权限
- 使用 `/clear` 命令时要谨慎，它会重置当天的所有统计数据

## 贡献

欢迎提交 issues 和 pull requests。

## 许可证

[MIT](https://choosealicense.com/licenses/mit/)
