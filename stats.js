const fs = require('fs').promises;
const path = require('path');
const moment = require('moment-timezone');

// 定义存储统计数据的文件夹
const STATS_FOLDER = path.join(__dirname, 'stats_data');

// 确保统计数据文件夹存在
async function ensureStatsFolderExists() {
  try {
    await fs.mkdir(STATS_FOLDER, { recursive: true });
  } catch (error) {
    if (error.code !== 'EEXIST') {
      console.error('Error creating stats folder:', error);
      throw error;
    }
  }
}

function getStatsFilename() {
  const date = moment().tz('Asia/Tokyo').format('YYYY-MM-DD');
  return path.join(STATS_FOLDER, `stats_${date}.json`);
}

async function loadStats() {
  await ensureStatsFolderExists();
  const filename = getStatsFilename();
  try {
    const data = await fs.readFile(filename, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.log('No existing stats file for today, starting with empty stats');
      return {
        Issue: 0,
        'breaks': 0,
        'morning rally': 0,
        organize: 0,
        meeting: 0,
        review: 0
      };
    }
    throw error;
  }
}

async function saveStats(stats) {
  await ensureStatsFolderExists();
  const filename = getStatsFilename();
  await fs.writeFile(filename, JSON.stringify(stats, null, 2));
}

module.exports = { loadStats, saveStats, getStatsFilename, STATS_FOLDER };