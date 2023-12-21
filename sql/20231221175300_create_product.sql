CREATE TABLE IF NOT EXISTS
  `product` (
    `uuid` varchar(36) NOT NULL,
    `name` varchar(255) NOT NULL,
    `sku` varchar(32) NOT NULL,
    `width` decimal(9, 2) DEFAULT NULL,
    `length` decimal(9, 2) DEFAULT NULL,
    `height` decimal(9, 2) DEFAULT NULL,
    `volume` decimal(9, 5) DEFAULT NULL,
    `weight` decimal(7, 2) DEFAULT NULL,
    `status` varchar(16) NOT NULL,
    `created_at` datetime NOT NULL,
    `modified_at` datetime NOT NULL,
    `shopify_id` varchar(32) DEFAULT NULL,
    `shopify_variant_id` varchar(32) DEFAULT NULL,
    PRIMARY KEY (`uuid`)
  ) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4