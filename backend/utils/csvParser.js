const fs = require("fs");

/**
 * Robust RFC 4180 compliant CSV Parser.
 * Handles:
 * - UTF-8 BOM characters
 * - Quoted fields with commas, escaped quotes (""), and multiline content
 * - Windows (CRLF) and Unix (LF) line terminators
 * - Flexible column name aliases and whitespace trimming
 */

/**
 * Tokenizes raw CSV string into an array of rows, each row being an array of string values.
 * @param {string} csvText
 * @returns {string[][]}
 */
function parseCsvRows(csvText) {
    // Remove UTF-8 Byte Order Mark (BOM) if present
    let text = csvText;
    if (text.charCodeAt(0) === 0xFEFF) {
        text = text.slice(1);
    }

    const rows = [];
    let currentRow = [];
    let currentField = "";
    let insideQuotes = false;
    let i = 0;
    const len = text.length;

    while (i < len) {
        const char = text[i];
        const nextChar = text[i + 1];

        if (insideQuotes) {
            if (char === '"') {
                if (nextChar === '"') {
                    // Escaped quote: "" -> "
                    currentField += '"';
                    i += 2;
                    continue;
                } else {
                    // End of quoted field
                    insideQuotes = false;
                    i++;
                    continue;
                }
            } else {
                currentField += char;
                i++;
                continue;
            }
        } else {
            if (char === '"') {
                insideQuotes = true;
                i++;
                continue;
            } else if (char === ',') {
                // Field separator
                currentRow.push(currentField.trim());
                currentField = "";
                i++;
                continue;
            } else if (char === '\r') {
                if (nextChar === '\n') {
                    i++; // Consume \n
                }
                // End of row
                currentRow.push(currentField.trim());
                if (currentRow.some((f) => f.length > 0)) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentField = "";
                i++;
                continue;
            } else if (char === '\n') {
                // End of row
                currentRow.push(currentField.trim());
                if (currentRow.some((f) => f.length > 0)) {
                    rows.push(currentRow);
                }
                currentRow = [];
                currentField = "";
                i++;
                continue;
            } else {
                currentField += char;
                i++;
                continue;
            }
        }
    }

    // Push the last field/row if not empty
    if (currentField.length > 0 || currentRow.length > 0) {
        currentRow.push(currentField.trim());
        if (currentRow.some((f) => f.length > 0)) {
            rows.push(currentRow);
        }
    }

    return rows;
}

/**
 * Normalize header string to alphanumeric lowercase for robust alias matching
 * e.g. "Chapter Number" -> "chapternumber", "faculty_id" -> "facultyid"
 * @param {string} header
 * @returns {string}
 */
function normalizeHeaderKey(header) {
    if (!header) return "";
    return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Parses a CSV file from disk into an array of objects mapped by headers.
 * @param {string} filePath
 * @param {Object} [aliasMap] Optional map of standard field -> array of aliases
 * @returns {Array<Object>}
 */
function parseCsvFile(filePath, aliasMap = {}) {
    if (!fs.existsSync(filePath)) {
        throw new Error(`CSV file not found at path: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, "utf-8");
    const rawRows = parseCsvRows(fileContent);

    if (rawRows.length === 0) {
        return [];
    }

    const rawHeaders = rawRows[0];
    const normalizedHeaders = rawHeaders.map((h) => normalizeHeaderKey(h));

    // Build mapping from column index to normalized standard field name
    const columnFieldMap = {};

    normalizedHeaders.forEach((header, index) => {
        let matchedField = null;

        // Check against provided aliasMap
        for (const [standardField, aliases] of Object.entries(aliasMap)) {
            const normalizedAliases = [
                normalizeHeaderKey(standardField),
                ...aliases.map((a) => normalizeHeaderKey(a)),
            ];

            if (normalizedAliases.includes(header)) {
                matchedField = standardField;
                break;
            }
        }

        // Default to raw header if no alias matched
        columnFieldMap[index] = matchedField || rawHeaders[index].trim();
    });

    const parsedData = [];

    for (let r = 1; r < rawRows.length; r++) {
        const row = rawRows[r];
        const rowObj = { _rowNumber: r + 1 }; // 1-indexed line number for user-friendly errors
        let hasValue = false;

        for (let c = 0; c < row.length; c++) {
            const fieldName = columnFieldMap[c] || `column_${c}`;
            const val = row[c] !== undefined ? row[c].trim() : "";
            rowObj[fieldName] = val;
            if (val.length > 0) hasValue = true;
        }

        if (hasValue) {
            parsedData.push(rowObj);
        }
    }

    return parsedData;
}

module.exports = {
    parseCsvRows,
    parseCsvFile,
    normalizeHeaderKey,
};
