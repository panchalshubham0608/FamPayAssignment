
// configure environment variables
require('dotenv').config();
// axios is a promise based HTTP client for the browser and node.js
const axios = require('axios');
const { lastPublishedAt, insertManyVideos } = require('./mysql');
const logger = require('./logger');

// set default configuration for axios
axios.defaults.baseURL = 'https://www.googleapis.com/youtube/v3';
axios.defaults.params = {};

// get the list of API keys
const apiKeys = process.env.YOUTUBE_API_KEYS ? process.env.YOUTUBE_API_KEYS.split(',') : [];
// the index of the API key to be used
let apiKeyIndex = 0;


// search for videos
function searchVideos({ searchQuery, searchPart, searchType, searchOrder, maxResults, publishedAfter, pageToken }) {
    // construct the parameters
    let params = {
        // the search query
        q: searchQuery,
        // the part of the video to be returned
        part: searchPart,
        // the type of the video
        type: searchType,
        // the order in which the videos are to be returned
        order: searchOrder,
        // the maximum number of videos to be returned
        maxResults: maxResults,
        // the date after which the videos are to be returned
        publishedAfter: publishedAfter,
    }
    // if the page token is present, add it to the parameters
    if (pageToken) {
        params.pageToken = pageToken;
    }

    // return a promise
    return new Promise(async (resolve, reject) => {

        // if there are no API keys, reject the promise
        if (!apiKeys.length) {
            return reject('No API keys found');
        }
        // try the next API key if the current one is exhausted
        // number of API keys tried
        let apiKeysTried = 0;
        do {
            // set the API key
            axios.defaults.params['key'] = apiKeys[apiKeyIndex];
            // search for videos
            try {
                let response = await axios.get('/search', { params: params });
                // resolve the promise with the response
                return resolve(response);
            } catch (error ) {
                // check for quota exhausted
                if (error.response.status === 403) {
                    // log the error
                    logger.error(`Quota exhausted for API KEY ${apiKeyIndex + 1}`, { error: error });
                    // try the next API key
                    apiKeyIndex = (apiKeyIndex + 1) % apiKeys.length;
                    // increment the number of API keys tried
                    apiKeysTried++;
                } else {
                    // log the error
                    logger.error('Error searching for videos', { error: error });
                    // reject the promise
                    return reject(error);
                }
            }
        } while (apiKeysTried < apiKeys.length);
        // reject the promise if all the API keys are exhausted
        reject('All API keys exhausted');
    });
}

// get video details
function syncDB() {
    // repeatedly refresh the videos every `REFRESH_INTERVAL` seconds
    let refreshInterval = (process.env.REFRESH_INTERVAL || 60) * 1000;
    setInterval(async () => {
        // log the refresh
        logger.info('Refreshing the videos');
        // get the last updated time
        let lastUpdated = null;
        try {
            lastUpdated = await lastPublishedAt();
        } catch (error) {
            logger.error(error);
            lastUpdated = new Date(process.env.PUBLISHED_AFTER || '2023-01-01T00:00:00Z');
        }
        // search for videos
        logger.info(`Searching for videos published after ${lastUpdated}`);
        try {

            // repeat the search until all the videos are fetched
            let nextPageToken = null;
            do {
                // search for videos
                let response = await searchVideos({
                    searchQuery: process.env.SEARCH_QUERY || 'cricket',
                    searchPart: process.env.SEARCH_PART || 'snippet',
                    searchType: process.env.SEARCH_TYPE || 'video',
                    searchOrder: process.env.ORDER || 'date',
                    maxResults: process.env.SEARCH_MAX_RESULTS || 5,
                    publishedAfter: lastUpdated,
                    pageToken: nextPageToken
                });
                // convert the videos into appropriate format
                let videos = response.data.items.map((item) => {
                    return {
                        videoId: item.id.videoId,
                        channelId: item.snippet.channelId,
                        title: item.snippet.title,
                        description: item.snippet.description,
                        // format the date such that it can be inserted into the database
                        publishedAt: new Date(item.snippet.publishedAt).toISOString().slice(0, 19).replace('T', ' '),
                        thumbnails: item.snippet.thumbnails
                    }
                });
                // insert the videos into the database
                await insertManyVideos(videos);

                // update the next page token
                nextPageToken = response.data.nextPageToken;
            } while (nextPageToken);
        } catch (error) {
            // log the error
            logger.error(error);
        }
    }, refreshInterval);
}

// sync the database
// syncDB();
