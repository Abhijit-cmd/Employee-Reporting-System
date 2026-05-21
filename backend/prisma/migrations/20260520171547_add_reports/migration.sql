/*
  Warnings:

  - You are about to alter the column `role` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - You are about to alter the column `status` on the `user` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `user` MODIFY `role` VARCHAR(191) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE `reports` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `report_month` VARCHAR(191) NOT NULL,
    `report_year` DATETIME(3) NOT NULL,
    `customers_registered` INTEGER NOT NULL DEFAULT 0,
    `suppliers_registered` INTEGER NOT NULL DEFAULT 0,
    `new_brand_products` INTEGER NOT NULL DEFAULT 0,
    `success_stories` INTEGER NOT NULL DEFAULT 0,
    `website_visitors` INTEGER NOT NULL DEFAULT 0,
    `customer_challenges` VARCHAR(191) NULL,
    `supplier_challenges` VARCHAR(191) NULL,
    `logistics_challenges` VARCHAR(191) NULL,
    `finance_challenges` VARCHAR(191) NULL,
    `individual_metrics` VARCHAR(191) NULL,
    `ytd_achievement` VARCHAR(191) NULL,
    `top_accomplishments` VARCHAR(191) NULL,
    `strengths_comments` VARCHAR(191) NULL,
    `report_status` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_employee_id_key` TO `user_employee_id_key`;
