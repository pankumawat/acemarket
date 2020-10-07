USE qlinks;

CREATE TABLE `links` (
  `short_name` varchar(100) NOT NULL,
  `long_url` varchar(1986) NOT NULL,
  `owner` varchar(50) NOT NULL,
  `createdDt` datetime DEFAULT CURRENT_TIMESTAMP,
  `modifiedDt` datetime DEFAULT CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT 'ACTIVE',
  PRIMARY KEY (`short_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `stats` (
  `short_name` varchar(100) NOT NULL,
  `limit_type` varchar(50) NOT NULL,
  `count` int unsigned DEFAULT '0',
  PRIMARY KEY (`short_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `stats_detailed` (
  `short_name` varchar(100) NOT NULL,
  `createdDt` datetime DEFAULT CURRENT_TIMESTAMP,
  `client_ip` varchar(50) DEFAULT NULL,
  `browser` varchar(50) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL,
  `device_type` varchar(50) DEFAULT NULL,
  `custom1` varchar(50) DEFAULT NULL,
  `custom2` varchar(50) DEFAULT NULL,
  `custom3` varchar(50) DEFAULT NULL,
  `custom4` varchar(50) DEFAULT NULL,
  `custom5` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`short_name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_configurations` (
  `username` varchar(100) NOT NULL,
  `config_name` varchar(50) NOT NULL,
  `value` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_limits` (
  `username` varchar(100) NOT NULL,
  `limit_type` varchar(50) NOT NULL,
  `count` int unsigned DEFAULT '0',
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users` (
  `username` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `org_type` varchar(30) DEFAULT NULL,
  `full_name` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `users_auth` (
  `username` varchar(100) NOT NULL,
  `password` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_subscription` (
  `username` varchar(100) NOT NULL,
  `subscription_type` varchar(50) NOT NULL,
  `valid_till` datetime NOT NULL,
  PRIMARY KEY (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
