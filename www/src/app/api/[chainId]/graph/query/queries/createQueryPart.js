export default function createQueryPart(key, value) {
    if (key === 'block') {
        // Handle block number as a numerical value
        return `${key}: { number: ${parseInt(value, 10)} }`;
    } else if (key === 'orderDirection' || key === 'orderBy') {
        // Keep order-related strings
        return `${key}: "${value}"`;
    } else if (key === 'where') {
        // Special handling for 'where' clause
        try {
            const objValue = typeof value === 'string' ? JSON.parse(decodeURIComponent(value)) : value;
            const whereClause = JSON.stringify(objValue).replace(/"([^"]+)":/g, '$1:');
            return `${key}: ${whereClause}`;
        } catch (e) {
            console.error('Failed to parse where clause:', value);
            return `${key}: {}`; // Fallback to an empty object on failure
        }
    } else if (key === 'first' || key === 'skip') {
        // Ensure 'first' and 'skip' are treated as integers
        const numValue = parseInt(value, 10);
        if (isNaN(numValue)) {
            console.warn(`Expected a number for ${key}, but got: ${value}`);
            return `${key}: 0`; // Fallback to 0 if not a valid number
        }
        return `${key}: ${numValue}`;
    } else {
        // Handle booleans and arrays
        if (typeof value === 'boolean' || Array.isArray(value)) {
            return `${key}: ${JSON.stringify(value).replace(/"([^"]+)":/g, '$1:')}`;
        }

        // For all other cases, assume the value is a string
        return `${key}: "${value}"`;
    }
}
