// imports
const mysql = require('mysql');
const logger = require('./logger');

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


// insert multiple videos into the database
function insertManyVideos(videos) {
    // return a promise
    return new Promise((resolve, reject) => {
        // if there are no videos to insert, return
        if (!videos.length) {
            return resolve();
        }
        // insert the videos into the database
        let query = 'INSERT INTO `youtube_video` (`video_id`, `channel_id`, `title`, `description`, `published_at`) VALUES ?';
        // convert the videos into appropriate format
        let values = videos.map((video) => {
            return [
                video.videoId,
                video.channelId,
                video.title,
                video.description,
                video.publishedAt,
            ];
        });
        // insert the videos into the database
        logger.info(`Inserting ${videos.length} videos into the database`);
        // logger.info(values);
        connection.query(query, [values], function (err, result) {
            if (err) {
                logger.error('Error inserting videos into the database');
                return reject(err);
            }
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
            // logger.info(thumbnails);
            // insert the thumbnails into the database
            let query = 'INSERT INTO `video_thumbnail` (`video_id`, `key`, `url`, `width`, `height`) VALUES ?';
            // insert the thumbnails into the database
            connection.query(query, [thumbnails], function (err, result) {
                if (err) {
                    logger.error('Error inserting thumbnails into the database');
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
}


// export the connection
module.exports = {
    insertManyVideos
};
