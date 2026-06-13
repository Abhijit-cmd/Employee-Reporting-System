-- Allow `target_month` to be NULL: a target with no month represents a yearly target,
-- scoped only by `target_year`.
ALTER TABLE `targets` MODIFY `target_month` VARCHAR(191) NULL;
