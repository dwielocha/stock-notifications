CREATE TABLE IF NOT EXISTS
  `notifications` (
    `id` char(26) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `email` varchar(255) NOT NULL,
    `event_type` varchar(255) NOT NULL,
    `related_id` varchar(255) NOT NULL,
    `sent_at` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `email` (`email`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4