-- drop table if already exists
DROP TABLE IF EXISTS `youtube_video`;
DROP TABLE IF EXISTS `video_thumbnail`;

-- create table
CREATE TABLE `youtube_video` (
  `video_id`        varchar(255) NOT NULL 
                    PRIMARY KEY 
                    COMMENT 'id of the video',

  `channel_id`      varchar(255) NOT NULL 
                    COMMENT 'channel id of the video',

  `title`           text NOT NULL
                    COMMENT 'title of the video',

  `description`     text NOT NULL
                    COMMENT 'description of the video',

  `published_at`    datetime NOT NULL 
                    COMMENT 'published date of the video',

  `created_at`      datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
                    COMMENT 'created date of the video',

  `updated_at`      datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
                    COMMENT 'updated date of the video'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- thumbnail is the url of the thumbnail image
CREATE TABLE `video_thumbnail` (
  `id`              int(11) NOT NULL AUTO_INCREMENT
                    COMMENT 'id of the thumbnail',

  `video_id`        varchar(255) NOT NULL
                    COMMENT 'id of the video',

  `key`             varchar(255) NOT NULL
                    COMMENT 'key of the thumbnail',

  `url`             varchar(255) NOT NULL
                    COMMENT 'url of the thumbnail',

  `width`           int(11) NOT NULL
                    COMMENT 'width of the thumbnail',

  `height`          int(11) NOT NULL
                    COMMENT 'height of the thumbnail',

  `created_at`      datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
                    COMMENT 'created date of the thumbnail',

  `updated_at`      datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                    COMMENT 'updated date of the thumbnail',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

