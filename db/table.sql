-- drop table if already exists
DROP TABLE IF EXISTS `youtube_video`;
DROP TABLE IF EXISTS `video_thumbnail`;

-- create table
CREATE TABLE `youtube_video` (
  `video_id` varchar(255) NOT NULL PRIMARY KEY,
  `channel_id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `published_at` datetime NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- thumbnail is the url of the thumbnail image
CREATE TABLE `video_thumbnail` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `video_id` varchar(255) NOT NULL,
  `key` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `width` int(11) NOT NULL,
  `height` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

