// auto_update.js —— Read Excel and generate data.js with diff
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ========== Configuration ==========
const excelFileName = 'auto_jifen.xlsx';   // Excel file name (same directory as this script)
const excelPath = path.join(__dirname, excelFileName);
const dataJsPath = path.join(__dirname, 'data.js');

// ========== Helper: read old detailData from existing data.js ==========
function getOldData() {
    if (!fs.existsSync(dataJsPath)) return null;
    try {
        // Read the file and extract the detailData array using a simple regex
        const content = fs.readFileSync(dataJsPath, 'utf8');
        const match = content.match(/const detailData = (\[\s*\{[\s\S]*?\}\s*\]);/);
        if (match && match[1]) {
            return JSON.parse(match[1]);
        }
    } catch (e) {
        console.warn('⚠️  Could not parse old data.js, diff will be empty.');
    }
    return null;
}

// ========== Read Excel ==========
try {
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
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

    // Sort by total descending
    detailData.sort((a, b) => b.total - a.total);

    // ========== Calculate diff ==========
    const oldData = getOldData();
    let diffData = [];
    if (oldData && oldData.length > 0) {
        const oldMap = new Map(oldData.map(p => [p.name, p]));
        diffData = detailData.map(newPlayer => {
            const oldPlayer = oldMap.get(newPlayer.name);
            if (!oldPlayer) {
                // New player
                return {
                    name: newPlayer.name,
                    winBonus_diff: newPlayer.winBonus,
                    loseBonus_diff: newPlayer.loseBonus,
                    fire_diff: newPlayer.fire,
                    shield_diff: newPlayer.shield,
                    assist_diff: newPlayer.assist,
                    extra_diff: newPlayer.extra,
                    penalty_diff: newPlayer.penalty,
                    total_diff: newPlayer.total,
                    isNew: true
                };
            } else {
                return {
                    name: newPlayer.name,
                    winBonus_diff: newPlayer.winBonus - oldPlayer.winBonus,
                    loseBonus_diff: newPlayer.loseBonus - oldPlayer.loseBonus,
                    fire_diff: newPlayer.fire - oldPlayer.fire,
                    shield_diff: newPlayer.shield - oldPlayer.shield,
                    assist_diff: newPlayer.assist - oldPlayer.assist,
                    extra_diff: newPlayer.extra - oldPlayer.extra,
                    penalty_diff: newPlayer.penalty - oldPlayer.penalty,
                    total_diff: newPlayer.total - oldPlayer.total,
                    isNew: false
                };
            }
        });
    }

    // ========== Generate data.js ==========
    const nowStr = new Date().toLocaleString();
    const fileContent = `// 海克斯积分数据 - 自动生成于 ${nowStr}
const lastUpdateTime = '${nowStr}';
const detailData = ${JSON.stringify(detailData, null, 4)};
const diffData = ${JSON.stringify(diffData, null, 4)};
`;

    fs.writeFileSync(dataJsPath, fileContent, 'utf8');

    console.log(`✅ data.js generated. Players: ${detailData.length}`);
    if (diffData.length > 0) {
        console.log(`📊 Diff data included, compared with previous record.`);
    } else {
        console.log(`📌 No previous data, diff is empty.`);
    }
} catch (err) {
    console.error('❌ Error:', err.message);
}