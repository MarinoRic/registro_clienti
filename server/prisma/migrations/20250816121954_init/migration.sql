/*
  Warnings:

  - You are about to drop the column `clientsId` on the `client_addresses` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `client_addresses` DROP FOREIGN KEY `client_addresses_clientsId_fkey`;

-- DropIndex
DROP INDEX `client_addresses_clientsId_fkey` ON `client_addresses`;

-- AlterTable
ALTER TABLE `client_addresses` DROP COLUMN `clientsId`,
    ADD COLUMN `client_id` BIGINT UNSIGNED NULL;

-- AddForeignKey
ALTER TABLE `client_addresses` ADD CONSTRAINT `client_addresses_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
