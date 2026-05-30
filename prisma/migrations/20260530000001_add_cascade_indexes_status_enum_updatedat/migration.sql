-- Add updated_at to roles (backfill with CURRENT_TIMESTAMP)
ALTER TABLE `roles` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Add updated_at to user (backfill with CURRENT_TIMESTAMP)
ALTER TABLE `user` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Add updated_at to reports (backfill with CURRENT_TIMESTAMP)
ALTER TABLE `reports` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Add updated_at to report_status (backfill with CURRENT_TIMESTAMP)
ALTER TABLE `report_status` ADD COLUMN `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- Change status on user from VARCHAR to ENUM
ALTER TABLE `user` MODIFY `status` ENUM('active','inactive') NOT NULL DEFAULT 'active';

-- Widen text columns in reports to TEXT
ALTER TABLE `reports`
  MODIFY `challenges` TEXT NULL,
  MODIFY `salesBooking` TEXT NULL,
  MODIFY `targetVsAchievement` TEXT NULL,
  MODIFY `accomplishments` TEXT NULL;

-- Indexes on user
CREATE INDEX `user_role_id_idx` ON `user`(`role_id`);
CREATE INDEX `user_status_idx` ON `user`(`status`);

-- Indexes on reports
CREATE INDEX `reports_user_id_idx` ON `reports`(`user_id`);
CREATE INDEX `reports_report_status_id_idx` ON `reports`(`report_status_id`);
CREATE INDEX `reports_mmyyyy_idx` ON `reports`(`mmyyyy`);

-- Indexes on notifications
CREATE INDEX `notifications_user_id_idx` ON `notifications`(`user_id`);
CREATE INDEX `notifications_is_read_idx` ON `notifications`(`is_read`);

-- Indexes on targets
CREATE INDEX `targets_employee_id_idx` ON `targets`(`employee_id`);

-- Indexes on login_logs
CREATE INDEX `login_logs_user_id_idx` ON `login_logs`(`user_id`);

-- Drop and recreate FK on reports.user_id with CASCADE
ALTER TABLE `reports` DROP FOREIGN KEY `reports_user_id_fkey`;
ALTER TABLE `reports` ADD CONSTRAINT `reports_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop and recreate FK on notifications.user_id with CASCADE
ALTER TABLE `notifications` DROP FOREIGN KEY `notifications_user_id_fkey`;
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop and recreate FK on targets.employee_id with CASCADE
ALTER TABLE `targets` DROP FOREIGN KEY `targets_employee_id_fkey`;
ALTER TABLE `targets` ADD CONSTRAINT `targets_employee_id_fkey`
  FOREIGN KEY (`employee_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- Drop and recreate FK on login_logs.user_id with CASCADE
ALTER TABLE `login_logs` DROP FOREIGN KEY `login_logs_user_id_fkey`;
ALTER TABLE `login_logs` ADD CONSTRAINT `login_logs_user_id_fkey`
  FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
