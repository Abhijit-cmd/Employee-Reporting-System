/*
  Warnings:

  - Made the column `challenges` on table `reports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `salesBooking` on table `reports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `targetVsAchievement` on table `reports` required. This step will fail if there are existing NULL values in that column.
  - Made the column `accomplishments` on table `reports` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `reports` MODIFY `challenges` TEXT NOT NULL,
    MODIFY `salesBooking` TEXT NOT NULL,
    MODIFY `targetVsAchievement` TEXT NOT NULL,
    MODIFY `accomplishments` TEXT NOT NULL;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(191) NOT NULL,
    `userId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `RefreshToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;