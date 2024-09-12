const path = require('path');
const fs = require('fs').promises;
const moment = require('moment-timezone');
const { STATS_FOLDER, loadStats, saveStats } = require('./stats');

function setupCommands(app) {
  app.action(/^(Issue|breaks|morning rally|organize|meeting|meeting-not|review)$/, async ({ ack, body, client }) => {
    await ack();
    const activity = body.actions[0].action_id;
    
    let stats = await loadStats();
    stats[activity] = (stats[activity] || 0) + 0.5;
    await saveStats(stats);

    try {
      await client.chat.update({
        channel: body.channel.id,
        ts: body.message.ts,
        text: `選択しました: ${activity}`,
        blocks: []
      });
      console.log(`用户选择了 ${activity}`);
    } catch (error) {
      console.error('更新消息时出错:', error);
    }
  });

  app.command('/stats', async ({ ack, say }) => {
    console.log('Received /stats command');
    try {
      await ack();
      console.log('/stats command acknowledged');

      const stats = await loadStats();
      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      const statsMessage = Object.entries(stats)
        .map(([activity, hours]) => `${activity}: ${hours.toFixed(1)} 時間 (${(hours/total*100).toFixed(2)}%)`)
        .join('\n');
      const date = moment().tz('Asia/Tokyo').format('YYYY-MM-DD');
      
      await say(`${date} の統計:\n${statsMessage}\n合計: ${total.toFixed(1)} 時間`);
      
      console.log(`/stats command completed successfully for date: ${date}`);
    } catch (error) {
      console.error('Error processing /stats command:', error);
      await say('統計情報の取得中にエラーが発生しました。');
    }
  });

  app.command('/clear', async ({ ack, say }) => {
    await ack();
    const emptyStats = {
      Issue: 0,
      'breaks': 0,
      'morning rally': 0,
      organize: 0,
      meeting: 0,
      review: 0
    };
    await saveStats(emptyStats);
    await say('統計情報がクリアされました。');
  });
  
  app.command('/stats_date', async ({ command, ack, say }) => {
    await ack();
    const date = command.text.trim(); // 用户输入的日期
    const filename = path.join(STATS_FOLDER, `stats_${date}.json`);
    console.log(filename);
    
    try {
      const data = await fs.readFile(filename, 'utf8');
      console.log(data);
      const stats = JSON.parse(data);
      const total = Object.values(stats).reduce((a, b) => a + b, 0);
      const statsMessage = Object.entries(stats)
        .map(([activity, hours]) => `${activity}: ${hours.toFixed(1)} 時間 (${(hours/total*100).toFixed(2)}%)`)
        .join('\n');
      await say(`${date} の統計:\n${statsMessage}\n合計: ${total.toFixed(1)} 時間`);
    } catch (error) {
      if (error.code === 'ENOENT') {
        await say(`${date} の統計情報が見つかりませんでした。`);
      } else {
        console.error('Error reading stats file:', error);
        await say('統計情報の取得中にエラーが発生しました。');
      }
    }
  });

  console.log('Setting up /stats_month command');
  app.command('/stats_month', async ({ command, ack, say, client }) => {
    console.log('Received /stats_month command');
    await ack();
    console.log('Command acknowledged');

    const yearMonth = command.text.trim();
    
    if (!/^\d{4}-\d{2}$/.test(yearMonth)) {
      await say('请输入正确的年月格式，例如: 2023-05');
      return;
    }

    const initialMessage = await say('正在处理您的请求，请稍候...');

    try {
      const [year, month] = yearMonth.split('-');
      const stats = {};
      let totalHours = 0;

      console.log(`Processing stats for ${yearMonth}`);
      const files = await fs.readdir(STATS_FOLDER);
      const relevantFiles = files.filter(file => file.startsWith(`stats_${year}-${month}`) && file.endsWith('.json'));

      console.log(`Found ${relevantFiles.length} relevant files`);
      for (const file of relevantFiles) {
        const data = await fs.readFile(path.join(STATS_FOLDER, file), 'utf8');
        const dailyStats = JSON.parse(data);
        
        for (const [activity, hours] of Object.entries(dailyStats)) {
          stats[activity] = (stats[activity] || 0) + hours;
          totalHours += hours;
        }
      }

      if (totalHours === 0) {
        await client.chat.update({
          channel: initialMessage.channel,
          ts: initialMessage.ts,
          text: `${yearMonth} 没有找到统计数据。`
        });
        return;
      }

      const statsMessage = Object.entries(stats)
        .map(([activity, hours]) => `${activity}: ${hours.toFixed(1)} 小时 (${(hours/totalHours*100).toFixed(2)}%)`)
        .join('\n');

      await client.chat.update({
        channel: initialMessage.channel,
        ts: initialMessage.ts,
        text: `${yearMonth} 的月度统计:\n${statsMessage}\n总计: ${totalHours.toFixed(1)} 小时`
      });
      console.log('Monthly stats sent successfully');
    } catch (error) {
      console.error('Error processing monthly stats:', error);
      await client.chat.update({
        channel: initialMessage.channel,
        ts: initialMessage.ts,
        text: '获取月度统计信息时发生错误。'
      });
    }
  });

  console.log('All commands set up');
}

module.exports = { setupCommands };