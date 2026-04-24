// auto_update.js —— 自动读取 Excel 并生成 data.js
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ========== 配置区 ==========
// Excel 文件名（和本脚本放在同一目录）
const excelFileName = 'auto_jifen.xlsx';   // 改成你的 Excel 文件名
const excelPath = path.join(__dirname, excelFileName);
const sheetName = '';                  // 留空则默认读取第一个工作表

// ========== 读取 Excel ==========
try {
    const workbook = XLSX.readFile(excelPath);
    const sheet = sheetName ? workbook.Sheets[sheetName] : workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // 假设 Excel 格式：
    // 第1行: 表头（可跳过）
    // 第2行起: 排名 | 选手 | 胜局加分次数 | 败局加分次数 | 打火得分 | 打盾得分 | 助攻得分 | 额外奖励 | 扣分 | 总积分
    // 选手在B列(索引1)，数值从C列(索引2)开始

    const dataRows = rawData.slice(1).filter(row => row.length >= 10); // 至少包含到总积分列

    const detailData = dataRows.map(row => {
        const name = String(row[1] || '').trim();
        const winBonus = Number(row[2]) || 0;
        const loseBonus = Number(row[3]) || 0;
        const fire = Number(row[4]) || 0;
        const shield = Number(row[5]) || 0;
        const assist = Number(row[6]) || 0;
        const extra = Number(row[7]) || 0;
        const penalty = Number(row[8]) || 0;
        const total = Number(row[9]) || 0;
        return { name, winBonus, loseBonus, fire, shield, assist, extra, penalty, total };
    }).filter(item => item.name !== '');

    // 按总积分降序排列
    detailData.sort((a, b) => b.total - a.total);

    // ========== 生成 data.js ==========
    const fileContent = `// 海克斯积分数据 - 自动生成于 ${new Date().toLocaleString()}
const detailData = ${JSON.stringify(detailData, null, 4)};
`;

    const targetPath = path.join(__dirname, 'data.js');
    fs.writeFileSync(targetPath, fileContent, 'utf8');

    console.log(`✅ 已从 ${excelPath} 读取并生成 data.js`);
    console.log(`👥 共 ${detailData.length} 名玩家`);
} catch (err) {
    console.error('❌ 错误：', err.message);
    console.error('请确保 Excel 文件路径正确，且工作表数据格式符合要求。');
}