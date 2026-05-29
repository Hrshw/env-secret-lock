/**
 * Parses a string containing .env configuration into a key-value object.
 * Matches standard dotenv parsing rules, including quotes, inline comments,
 * escaped characters, and multiline strings.
 * 
 * @param {string} src The contents of the .env file
 * @returns {Record<string, string>} Object containing key-value pairs
 */
export function parse(src) {
  const result = {};
  if (!src) return result;

  const lines = src.toString().split(/\r?\n/);

  let currentKey = null;
  let currentValue = null;
  let quoteChar = null; // can be '"', "'", or '`'

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // If we are currently parsing a multiline quoted value
    if (currentKey !== null) {
      let idx = 0;
      let escaped = false;
      let foundEnd = false;

      while (idx < line.length) {
        const char = line[idx];
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === quoteChar) {
          foundEnd = true;
          break;
        }
        idx++;
      }

      if (foundEnd) {
        // Add the portion before the closing quote
        const chunk = line.substring(0, idx);
        currentValue += '\n' + chunk;

        // Resolve escape sequences
        let finalValue = currentValue;
        if (quoteChar === '"') {
          finalValue = finalValue
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
        } else if (quoteChar === "'") {
          finalValue = finalValue.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
        } else if (quoteChar === '`') {
          finalValue = finalValue.replace(/\\`/g, '`').replace(/\\\\/g, '\\');
        }

        result[currentKey] = finalValue;
        currentKey = null;
        currentValue = null;
        quoteChar = null;
      } else {
        // No closing quote on this line, append the whole line and continue
        currentValue += '\n' + line;
      }
      continue;
    }

    const trimmedLine = line.trim();

    // Skip empty lines or comment-only lines
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    // Match standard KEY=VALUE lines (optional export prefix)
    const match = line.match(/^\s*(?:export\s+)?([\w.-]+)\s*=\s*(.*)$/);
    if (!match) {
      continue; // Skip malformed or non-key-value lines
    }

    const key = match[1];
    let valPart = match[2].trim();

    // Check if the value starts with a quote char
    const firstChar = valPart.charAt(0);
    if (firstChar === '"' || firstChar === "'" || firstChar === '`') {
      quoteChar = firstChar;
      currentKey = key;

      // Look for closing quote on the same line
      let idx = 1;
      let escaped = false;
      let foundEnd = false;

      while (idx < valPart.length) {
        const char = valPart[idx];
        if (escaped) {
          escaped = false;
        } else if (char === '\\') {
          escaped = true;
        } else if (char === quoteChar) {
          foundEnd = true;
          break;
        }
        idx++;
      }

      if (foundEnd) {
        const quotedVal = valPart.substring(1, idx);
        let finalValue = quotedVal;
        if (quoteChar === '"') {
          finalValue = finalValue
            .replace(/\\n/g, '\n')
            .replace(/\\r/g, '\r')
            .replace(/\\t/g, '\t')
            .replace(/\\"/g, '"')
            .replace(/\\\\/g, '\\');
        } else if (quoteChar === "'") {
          finalValue = finalValue.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
        } else if (quoteChar === '`') {
          finalValue = finalValue.replace(/\\`/g, '`').replace(/\\\\/g, '\\');
        }

        result[key] = finalValue;
        currentKey = null;
        currentValue = null;
        quoteChar = null;
      } else {
        // Value continues onto the next line
        currentValue = valPart.substring(1);
      }
    } else {
      // Unquoted value. Handle inline comments.
      let endIdx = valPart.indexOf('#');
      if (endIdx !== -1) {
        // Only treat as comment if preceded by whitespace
        const beforeComment = valPart.substring(0, endIdx);
        if (endIdx === 0 || /\s$/.test(beforeComment)) {
          valPart = beforeComment.trim();
        }
      }
      result[key] = valPart;
    }
  }

  return result;
}
