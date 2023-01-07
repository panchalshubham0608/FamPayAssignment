
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

// returns true if string contains multi-byte characters
function containsMultiByte(str) {
    for (let i = 0; i < str.length; i++) {
        if (str.charCodeAt(i) > 255) return true;
    }
    return false;
}

// exports the functions
module.exports = {
    toNumber,
    toMysqlDate,
    sanitizeLikeString,
    containsMultiByte
};
