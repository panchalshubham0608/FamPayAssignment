
// converts the string to base64 encoding so that it can be inserted into the database
function toBase64(str) {
    return Buffer.from(str).toString('base64');
}

// converts the base64 encoded string to normal string
function fromBase64(str) {
    return Buffer.from(str, 'base64').toString();
}

// exports the functions
module.exports = {
    toBase64,
    fromBase64,
};
