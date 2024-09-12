const { App } = require('@slack/bolt');
const cron = require('node-cron');
const moment = require('moment-timezone');
require('dotenv').config();

const { loadStats, saveStats } = require('./stats');
const { sendReminder } = require('./reminders');
const { setupCommands } = require('./commands');
const { PORT, SLACK_BOT_TOKEN, SLACK_SIGNING_SECRET } = require('./config');

const app = new App({
  token: SLACK_BOT_TOKEN,
  signingSecret: SLACK_SIGNING_SECRET
});

// 全局错误处理
app.error((error) => {
  console.error('An error occurred:', error);
});

// 设置定时任务
cron.schedule('0,30 10-19 * * 1-5', () => {
  const now = moment().tz('Asia/Tokyo');
  console.log(`Cron job triggered at: ${now.format('YYYY-MM-DD HH:mm:ss')}`);
  const hour = now.hour();
  const minute = now.minute();
  const day = now.day();

  if ((hour > 10 || (hour === 10 && minute === 30)) && hour < 19 && day >= 1 && day <= 5) {
    console.log('Sending reminder...');
    sendReminder(app);
  } else if (hour === 19 && minute === 0 && day >= 1 && day <= 5) {
    console.log('Sending reminder...');
    sendReminder(app);
  }
  else {
    console.log('Outside of reminder hours or not a weekday, not sending.');
  }
}, {
  timezone: "Asia/Tokyo"
});

// 设置命令和动作
setupCommands(app);

// 启动应用
(async () => {
  await app.start(PORT);
  console.log('⚡️ Bolt app is running!');
  // sendReminder(app);
})();