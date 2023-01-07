
// converts the string to base64 encoding so that it can be inserted into the database
function toBase64(str) {
    return Buffer.from(str).toString('base64');
}

// converts the base64 encoded string to normal string
function fromBase64(str) {
    return Buffer.from(str, 'base64').toString();
}

// converts the string to number and returns the number
// if the string is not a number, returns default value
function toNumber(str, defaultValue) {
    if (typeof str !== 'string') return defaultValue;
    try {
        let num = parseInt(str);
        return isNaN(num) ? defaultValue : num;    
    } catch (e) {
        return defaultValue;
    }
}

// converts the date to mysql date format
function toMysqlDate(date) {
    if (typeof date === 'string') date = new Date(date);
    if (typeof date !== 'object' || !(date instanceof Date)) throw new Error('Invalid date');
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

// sanitizes the string to be used in LIKE query
function sanitizeLikeString(str) {
    return str.replace(/\\/g, '\\\\').replace(/%/g, '\\%').replace(/_/g, '\\_');
}

// exports the functions
module.exports = {
    toBase64,
    fromBase64,
    toNumber,
    toMysqlDate,
    sanitizeLikeString
};
