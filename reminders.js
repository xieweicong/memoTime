async function sendReminder(app) {
  try {
    await app.client.chat.postMessage({
      channel: 'C07J570PATS', // 替换为实际的频道ID
      text: '過去の30分、何をやりましたか？',
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: '過去の30分、何をやりましたか？'
          }
        },
        {
          type: 'actions',
          elements: [
            { type: 'button', text: { type: 'plain_text', text: 'Issue' }, action_id: 'Issue' },
            { type: 'button', text: { type: 'plain_text', text: '休憩' }, action_id: 'breaks' },
            { type: 'button', text: { type: 'plain_text', text: 'レビュー' }, action_id: 'review' },
            { type: 'button', text: { type: 'plain_text', text: '資料整理' }, action_id: 'organize' },
            { type: 'button', text: { type: 'plain_text', text: '朝会' }, action_id: 'morning rally' },
            { type: 'button', text: { type: 'plain_text', text: 'ミーティング' }, action_id: 'meeting' },
            { type: 'button', text: { type: 'plain_text', text: 'ミーティング-not' }, action_id: 'meeting-not' }
          ]
        }
      ]
    });
    console.log("提醒消息发送成功");
  } catch (error) {
    console.error('发送提醒消息时出错:', error);
  }
}

module.exports = { sendReminder };