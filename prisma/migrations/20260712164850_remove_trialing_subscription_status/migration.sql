-- AlterEnum
BEGIN;
CREATE TYPE "subscription_status_new" AS ENUM ('ACTIVE', 'CANCELED', 'PAST_DUE');
ALTER TABLE "user_subscriptions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "user_subscriptions" ALTER COLUMN "status" TYPE "subscription_status_new" USING ("status"::text::"subscription_status_new");
ALTER TYPE "subscription_status" RENAME TO "subscription_status_old";
ALTER TYPE "subscription_status_new" RENAME TO "subscription_status";
DROP TYPE "subscription_status_old";
ALTER TABLE "user_subscriptions" ALTER COLUMN "status" SET DEFAULT 'ACTIVE';
COMMIT;
