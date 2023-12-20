CREATE TABLE
  `subscriptions` (
    `id` char(26) NOT NULL,
    `email` varchar(255) NOT NULL,
    `product_sku` varchar(255) NOT NULL,
    `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (`id`),
    KEY `product_sku_index` (`product_sku`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;