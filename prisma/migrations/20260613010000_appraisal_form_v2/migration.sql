-- AlterTable
ALTER TABLE `appraisal_kpi_entries` ADD COLUMN `achievement` TEXT NULL,
    ADD COLUMN `section` ENUM('KPI', 'COMPETENCY', 'CREDIT_CONTROL') NOT NULL DEFAULT 'KPI',
    ADD COLUMN `target` TEXT NULL,
    ADD COLUMN `weight` INTEGER NULL;

-- AlterTable
ALTER TABLE `appraisals` ADD COLUMN `acknowledged_at` DATETIME(3) NULL,
    ADD COLUMN `action_performance_incentive` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `action_promotion` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `action_role_enhancement` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `action_salary_increment` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `action_training_development` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `ceo_name` VARCHAR(191) NULL,
    ADD COLUMN `ceo_sign_date` VARCHAR(191) NULL,
    ADD COLUMN `credit_control_comment` TEXT NULL,
    ADD COLUMN `final_rating` INTEGER NULL,
    ADD COLUMN `hr_name` VARCHAR(191) NULL,
    ADD COLUMN `hr_sign_date` VARCHAR(191) NULL,
    ADD COLUMN `manager_development_areas` TEXT NULL,
    ADD COLUMN `manager_strengths` TEXT NULL,
    ADD COLUMN `period_quarter` INTEGER NULL,
    ADD COLUMN `self_achievements` TEXT NULL,
    ADD COLUMN `self_challenges` TEXT NULL,
    ADD COLUMN `self_improvements` TEXT NULL,
    ADD COLUMN `self_support_needed` TEXT NULL;

-- AlterTable
ALTER TABLE `kpi_templates` ADD COLUMN `section` ENUM('KPI', 'COMPETENCY', 'CREDIT_CONTROL') NOT NULL DEFAULT 'KPI',
    ADD COLUMN `weight` INTEGER NULL;

-- AlterTable
ALTER TABLE `user` ADD COLUMN `designation` VARCHAR(191) NULL,
    ADD COLUMN `location` VARCHAR(191) NULL;
