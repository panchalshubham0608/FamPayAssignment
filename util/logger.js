// imports
const winston = require('winston');
const { createLogger, format } = winston;
const { combine, timestamp, printf } = format;

// define the custom settings for each transport (file, console)
const options = {
    file: {
        level: 'info',
        format: combine(
            format.errors({ stack: true }),
            format.metadata(),
            format.json(),
            timestamp(),
            printf(info => {
                let metadata = '';
                if (info.metadata) {
                    try {
                        metadata = JSON.stringify(info.metadata);
                    } catch (e) {
                        metadata = info.metadata;
                    }
                }
                return `${info.timestamp} ${info.level}: ${info.message} ${metadata}`
            }),
        ),
        defaultMeta: { service: 'user-service' },
        transports: [
            new winston.transports.File({ filename: `${__dirname}/../logs/error.log`, level: 'error' }),
            new winston.transports.File({ filename: `${__dirname}/../logs/combined.log` }),
        ],
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
    },
};


// instantiate a new Winston Logger with the settings defined above
const logger = createLogger(options.file);

// If not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
if (process.env.ENVIRONMENT !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

// export the logger
module.exports = logger;
