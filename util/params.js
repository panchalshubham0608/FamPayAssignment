// imports
const { toNumber, toMysqlDate, sanitizeLikeString } = require('./parser');

// list of allowed thumbnail sizes
const THUMBNAIL_SIZES = ['DEFAULT', 'MEDIUM', 'HIGH'];

// filter out the query parameters
function searchQueryParams(query) {
    // return the query parameters
    let params =  {
        limit: toNumber(query.limit, 10),
        page: toNumber(query.page, 1),
        order: (query.order && query.order.toUpperCase() !== 'ASC') ? 'DESC' : 'ASC',
        thumbnailSize: (query.thumbnailSize && THUMBNAIL_SIZES.includes(query.thumbnailSize.toUpperCase())) ? query.thumbnailSize.toUpperCase() : 'DEFAULT'
    };
    if (params.limit < 1) params.limit = 1;
    if (params.page < 1) params.page = 1;
    if (query.search) params.search = sanitizeLikeString(query.search);
    if (query.publishedAfter) params.publishedAfter = toMysqlDate(query.publishedAfter);
    if (query.publishedBefore) params.publishedBefore = toMysqlDate(query.publishedBefore);
    return params;
}

// exports
module.exports = {
    searchQueryParams
};
