function formatValue(val) {
    if (typeof val === 'number') {
        return val;
    } else if (typeof val === 'boolean') {
        return val;
    } else if (Array.isArray(val)) {
        return `[${val.map(item => formatValue(item)).join(', ')}]`;
    } else if (typeof val === 'object') {
        return `{${Object.entries(val).map(([k, v]) => `${k}: ${formatValue(v)}`).join(', ')}}`;
    } else {
        // if has { then it is a stringified object
        if (val.includes('{')) {
            return val;
        }
        return `"${val}"`;  // Default to treating as a string with added quotes for safety
    }
}

function jsonParseAndDecodeURI(value) {
    const decodedValue = decodeURIComponent(value);
    try {
        return JSON.parse(decodedValue);
    } catch (e) {
        return decodedValue.trim();
    }
}

export default function createQueryPart(key, value) {
    switch (key) {
        case 'block':
            const blockNumber = parseInt(value, 10);
            return isNaN(blockNumber) ? null : `${key}: { number: ${blockNumber} }`;
        case 'orderDirection':
        case 'orderBy':
            return `${key}: "${value}"`;
        case 'where':
            try {
                const objValue = typeof value === 'string' ? jsonParseAndDecodeURI(value) : value;
                return `${key}: ${formatValue(objValue)}`;
            } catch (e) {
                console.error('Failed to parse where clause:', value, e);
                return `${key}: ${formatValue(value)}`;
                // return `${key}: {}`; // Fallback to an empty object on failure
            }
        case 'first':
        case 'skip':
            const numValue = parseInt(value, 10);
            if (isNaN(numValue)) {
                console.warn(`Expected a number for ${key}, but got: ${value}`);
                return `${key}: 0`; // Fallback to 0 if not a valid number
            }
            return `${key}: ${numValue}`;
        default:
            // Handle booleans, arrays, and other types safely
            return `${key}: ${formatValue(value)}`;
    }
}
