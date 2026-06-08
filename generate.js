const fs = require('fs');
const path = require('path');

const csvFilePath = path.join(__dirname, 'darkpunks.csv');
const outputDir = path.join(__dirname, 'metadata');

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

const baseImageUri = "https://raw.githubusercontent.com/darkpunksnft/darkpunksimages/main/images/";

function parseCSV(csvText) {
    const lines = csvText.split(/\r?\n/);
    if (lines.length === 0) return [];

    const rawHeaders = lines[0].split(',');
    let accessoryCount = 1;
    const headers = rawHeaders.map(h => {
        const trimmed = h.trim().toLowerCase();
        if (trimmed === 'accessories') {
            return `accessories_${accessoryCount++}`;
        }
        return trimmed;
    });

    const results = [];

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        const currentLine = lines[i].split(',');
        const obj = {};
        
        headers.forEach((header, index) => {
            obj[header] = currentLine[index] ? currentLine[index].trim() : '';
        });
        results.push(obj);
    }
    return results;
}

fs.readFile(csvFilePath, 'utf8', (err, data) => {
    if (err) {
        console.error("Error reading CSV file:", err);
        return;
    }

    const rows = parseCSV(data);

    rows.forEach((row) => {
        const id = row['id'];
        if (id === undefined || id === '') return;

        const metadata = {
            name: `DarkPunk #${id}`,
            description: `DarkPunks NFT Collection Item #${id}`,
            image: `${baseImageUri}${id}.png`,
            attributes: []
        };

        if (row['type']) metadata.attributes.push({ trait_type: "Type", value: row['type'] });
        if (row['gender']) metadata.attributes.push({ trait_type: "Gender", value: row['gender'] });
        if (row['skin tone']) metadata.attributes.push({ trait_type: "Skin Tone", value: row['skin tone'] });

        for (let i = 1; i <= 7; i++) {
            const accessory = row[`accessories_${i}`];
            if (accessory && accessory !== '') {
                metadata.attributes.push({
                    trait_type: "Accessory",
                    value: accessory
                });
            }
        }

        // Saved without .json extension
        fs.writeFileSync(
            path.join(outputDir, `${id}`),
            JSON.stringify(metadata, null, 2)
        );
    });

    console.log("Successfully generated all metadata files without extensions!");
});
