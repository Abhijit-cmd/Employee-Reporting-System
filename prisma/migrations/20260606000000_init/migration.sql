-- Employee Reporting System — Clean Initial Migration
-- Creates all tables from scratch in dependency order.

-- ── Lookup tables (no foreign keys) ──────────────────────────────────────────

CREATE TABLE `roles` (
    `id`         INTEGER NOT NULL AUTO_INCREMENT,
    `role_name`  VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `roles_role_name_key`(`role_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `report_status` (
    `id`          INTEGER NOT NULL AUTO_INCREMENT,
    `status_name` VARCHAR(191) NOT NULL,
    `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `report_status_status_name_key`(`status_name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ── Users ─────────────────────────────────────────────────────────────────────

CREATE TABLE `user` (
    `id`                  INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id`         VARCHAR(191) NULL,
    `name`                VARCHAR(191) NOT NULL,
    `email`               VARCHAR(191) NOT NULL,
    `password`            VARCHAR(191) NOT NULL,
    `role_id`             INTEGER NOT NULL,
    `phone`               VARCHAR(191) NOT NULL,
    `status`              ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
    `created_at`          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at`          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `user_employee_id_key`(`employee_id`),
    UNIQUE INDEX `user_email_key`(`email`),
    INDEX `user_role_id_idx`(`role_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `user` ADD CONSTRAINT `user_role_id_fkey`
    FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Reports ───────────────────────────────────────────────────────────────────

CREATE TABLE `reports` (
    `id`                  INTEGER NOT NULL AUTO_INCREMENT,
    `user_id`             INTEGER NOT NULL,
    `mmyyyy`              VARCHAR(191) NOT NULL,
    `businessOwner`       VARCHAR(191) NOT NULL,
    `preparedBy`          VARCHAR(191) NOT NULL,
    `reviewedBy`          VARCHAR(191) NOT NULL,
    `customersRegistered` INTEGER NOT NULL DEFAULT 0,
    `suppliersRegistered` INTEGER NOT NULL DEFAULT 0,
    `newBrandProducts`    INTEGER NOT NULL DEFAULT 0,
    `successStories`      INTEGER NOT NULL DEFAULT 0,
    `websiteVisitors`     INTEGER NOT NULL DEFAULT 0,
    `challenges`          TEXT NOT NULL,
    `salesBooking`        TEXT NOT NULL,
    `targetVsAchievement` TEXT NOT NULL,
    `accomplishments`     TEXT NOT NULL,
    `report_status_id`    INTEGER NOT NULL,
    `created_at`          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at`          DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `reports_user_id_mmyyyy_key`(`user_id`, `mmyyyy`),
    INDEX `reports_user_id_idx`(`user_id`),
    INDEX `reports_report_status_id_idx`(`report_status_id`),
    INDEX `reports_mmyyyy_idx`(`mmyyyy`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `reports` ADD CONSTRAINT `reports_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE `reports` ADD CONSTRAINT `reports_report_status_id_fkey`
    FOREIGN KEY (`report_status_id`) REFERENCES `report_status`(`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── Notifications ─────────────────────────────────────────────────────────────

CREATE TABLE `notifications` (
    `id`                INTEGER NOT NULL AUTO_INCREMENT,
    `user_id`           INTEGER NOT NULL,
    `title`             VARCHAR(191) NOT NULL,
    `message`           VARCHAR(191) NOT NULL,
    `notification_type` VARCHAR(191) NOT NULL,
    `is_read`           BOOLEAN NOT NULL DEFAULT false,
    `created_at`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at`        DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `notifications_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Announcements ─────────────────────────────────────────────────────────────

CREATE TABLE `announcements` (
    `id`         INTEGER NOT NULL AUTO_INCREMENT,
    `title`      VARCHAR(191) NOT NULL,
    `body`       TEXT NOT NULL,
    `created_by` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `announcements_created_by_idx`(`created_by`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `announcements` ADD CONSTRAINT `announcements_created_by_fkey`
    FOREIGN KEY (`created_by`) REFERENCES `user`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Targets ───────────────────────────────────────────────────────────────────

CREATE TABLE `targets` (
    `id`            INTEGER NOT NULL AUTO_INCREMENT,
    `employee_id`   INTEGER NOT NULL,
    `target_title`  VARCHAR(191) NOT NULL,
    `description`   VARCHAR(191) NULL,
    `target_value`  DOUBLE NOT NULL,
    `achieved_value` DOUBLE NOT NULL DEFAULT 0,
    `target_month`  VARCHAR(191) NOT NULL,
    `target_year`   INTEGER NOT NULL,
    `created_at`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at`    DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `targets_employee_id_idx`(`employee_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `targets` ADD CONSTRAINT `targets_employee_id_fkey`
    FOREIGN KEY (`employee_id`) REFERENCES `user`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Login Logs ────────────────────────────────────────────────────────────────

CREATE TABLE `login_logs` (
    `id`          INTEGER NOT NULL AUTO_INCREMENT,
    `user_id`     INTEGER NOT NULL,
    `login_time`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `logout_time` DATETIME(3) NULL,
    `ip_address`  VARCHAR(191) NULL,
    `device_info` VARCHAR(191) NULL,
    `created_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `login_logs_user_id_idx`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `login_logs` ADD CONSTRAINT `login_logs_user_id_fkey`
    FOREIGN KEY (`user_id`) REFERENCES `user`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ── Refresh Tokens ────────────────────────────────────────────────────────────

CREATE TABLE `refresh_tokens` (
    `id`        INTEGER NOT NULL AUTO_INCREMENT,
    `token`     VARCHAR(512) NOT NULL,
    `userId`    INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `user`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
