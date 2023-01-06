
// configure environment variables
require('dotenv').config();
// axios is a promise based HTTP client for the browser and node.js
const axios = require('axios');
const { insertManyVideos } = require('./mysql');
const logger = require('./logger');

// set default configuration for axios
axios.defaults.baseURL = 'https://www.googleapis.com/youtube/v3';
axios.defaults.params = {};
axios.defaults.params['key'] = process.env.YOUTUBE_API_KEY;


// search for videos
function searchVideos({ searchQuery, searchPart, searchType, searchOrder, maxResults, publishedAfter }) {
    // return a promise
    return axios.get('/search', {
        // set the parameters
        params: {
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
            publishedAfter: publishedAfter
        }
    });
}

// get video details
function syncDB() {
    // stores the time when the videos were last updated
    let lastUpdated = new Date(process.env.PUBLISHED_AFTER || '2023-01-01T00:00:00Z');
    // repeatedly refresh the videos every `REFRESH_INTERVAL` seconds
    let refreshInterval = (process.env.REFRESH_INTERVAL || 60) * 1000;
    setInterval(async () => {
        // call searchVideos function
        logger.info(`Syncing cache...Searching for videos published after ${lastUpdated.toISOString()}`);
        try {
            // search for videos
            let response = await searchVideos({
                searchQuery: process.env.SEARCH_QUERY || 'cricket',
                searchPart: process.env.SEARCH_PART || 'snippet',
                searchType: process.env.SEARCH_TYPE || 'video',
                searchOrder: process.env.ORDER || 'date',
                maxResults: process.env.MAX_RESULTS || 5,
                publishedAfter: lastUpdated
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
            // update the last updated time
            lastUpdated = new Date();
        } catch (error) {
            // log the error
            logger.error(error);
        }
    }, refreshInterval);
}

// sync the database
syncDB();
