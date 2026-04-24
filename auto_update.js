// auto_update.js —— Read Excel and generate data.js automatically
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ========== Configuration ==========
const excelFileName = 'auto_jifen.xlsx';   // Excel file name (same directory as this script)
const excelPath = path.join(__dirname, excelFileName);

try {
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];  // Read the first sheet
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const dataRows = rawData.slice(1).filter(row => row.length >= 10);

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

    detailData.sort((a, b) => b.total - a.total);

    // 生成 data.js，额外输出 lastUpdateTime 变量
    const fileContent = `// 海克斯积分数据 - 自动生成于 ${new Date().toLocaleString()}
const lastUpdateTime = '${new Date().toLocaleString()}';
const detailData = ${JSON.stringify(detailData, null, 4)};
`;

    const targetPath = path.join(__dirname, 'data.js');
    fs.writeFileSync(targetPath, fileContent, 'utf8');

    console.log(`✅ data.js generated successfully. Total players: ${detailData.length}`);
} catch (err) {
    console.error('❌ Error:', err.message);
}