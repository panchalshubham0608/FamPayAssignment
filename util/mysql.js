// imports
const mysql = require('mysql');
const logger = require('./logger');
const parser = require('./parser');

// create singleton connection
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});


// connect to the database
connection.connect(function (err) {
    if (err) {
        logger.error(err);
        return;
    }
    logger.info('Connection established');
});

// finds the last published_at date
function lastPublishedAt() {
    return new Promise((resolve, reject) => {
        let query = 'SELECT `published_at` FROM `youtube_video` ORDER BY `published_at` DESC LIMIT 1';
        connection.query(query, function (err, result) {
            if (err) {
                logger.error('Error finding last published_at date', { error: err });
                return reject(err);
            }
            // if there are no videos in the database, return the default date
            if (!result.length) {
                // return the default date
                return resolve(new Date(process.env.PUBLISHED_AFTER || '2023-01-01T00:00:00Z'));
            }
            // return the last published_at date
            resolve(new Date(result[0].published_at));
        });
    });
}

// helper function to filter out the videos that already exist in the database
// this function is used to avoid duplicate entries in the database
function filterOutExistingVideos(videoIds) {
    // return a promise
    return new Promise((resolve, reject) => {
        // if there are no videos to insert, return
        if (!videoIds.length) {
            // return an empty array
            return resolve([]);
        }
        // find if the videos already exist in the database
        let query = 'SELECT `video_id` FROM `youtube_video` WHERE `video_id` IN (?)';
        // execute the query
        connection.query(query, [videoIds], function (err, result) {
            if (err) {
                // for other errors, log the error and return
                logger.error('Error finding videos in the database', { error: err });
                return reject(err);
            }
            // collect the video ids that already exist in the database
            let existingVideoIds = result.map(video => video.video_id);
            // filter out the videos that already exist in the database
            let filteredVideoIds = videoIds.filter(videoId => !existingVideoIds.includes(videoId));
            // return the filtered video ids
            resolve(filteredVideoIds);
        });
    });
}

// insert thumbnail into the database
function insertManyThumbnails(videos) {
    // return a promise
    return new Promise((resolve, reject) => {
        // insert the thumbnails into the database
        let thumbnails = videos.map((video) => {
            return Object.keys(video.thumbnails).map((key) => {
                return [
                    video.videoId,
                    key,
                    video.thumbnails[key].url,
                    video.thumbnails[key].width,
                    video.thumbnails[key].height
                ];
            });
        });
        // flatten the array
        thumbnails = [].concat.apply([], thumbnails);
        logger.info(`Inserting ${thumbnails.length} thumbnails into the database`);
        // insert the thumbnails into the database
        let query = 'INSERT INTO `video_thumbnail` (`video_id`, `key`, `url`, `width`, `height`) VALUES ?';
        // insert the thumbnails into the database
        connection.query(query, [thumbnails], function (err, result) {
            if (err) {
                logger.error('Error inserting thumbnails into the database', { error: err, thumbnails: thumbnails });
                return reject(err);
            }
            resolve(result);
        });
    });
}

// insert multiple videos into the database
function insertManyVideos(videos) {
    // return a promise
    return new Promise((resolve, reject) => {
        // if there are no videos to insert, return
        if (!videos.length) {
            return resolve();
        }
        // collect video ids
        let videoIds = videos.map(video => video.videoId);
        // filter out the videos that already exist in the database
        filterOutExistingVideos(videoIds).then(filteredVideoIds => {
            // insert filtered videos into the database
            let filteredVideos = videos.filter(video => filteredVideoIds.includes(video.videoId));
            // check if there are any videos to insert
            if (!filteredVideos.length) {
                logger.info('No new videos to insert');
                return resolve();
            }
            // insert the videos into the database
            let query = 'INSERT INTO `youtube_video` (`video_id`, `channel_id`, `title`, `description`, `published_at`) VALUES ?';
            // convert the videos into appropriate format
            let args = filteredVideos.map((video) => {
                return [
                    video.videoId,
                    video.channelId,
                    parser.toBase64(video.title),
                    parser.toBase64(video.description),
                    video.publishedAt,
                ];
            });
            // insert the videos into the database
            logger.info(`Inserting ${filteredVideos.length} videos into the database`);
            connection.query(query, [args], function (err, result) {
                if (err) {
                    logger.error('Error inserting videos into the database', { error: err, videos: filteredVideos });
                    return reject(err);
                }
                // insert the thumbnails into the database
                insertManyThumbnails(filteredVideos).then(result => {
                    logger.info('Successfully inserted videos into the database');
                    resolve(result);
                }).catch(err => {
                    logger.error('Error inserting thumbnails into the database', { error: err });
                    return reject(err);
                });
            });
        }).catch(err => {
            logger.error('Error filtering out existing videos');
            return reject(err);
        });
    });
}

// export the connection
module.exports = {
    lastPublishedAt,
    insertManyVideos
};
