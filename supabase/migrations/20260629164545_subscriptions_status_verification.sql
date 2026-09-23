-- Se elimina esta validación para poder cambiar el tipo de dato de la columna status de text a enum
ALTER TABLE "public"."subscriptions" DROP CONSTRAINT "subscriptions_status_check";
CREATE TYPE "public"."subscription_status" AS ENUM ('INSERTED', 'APPROVAL_PENDING', 'APPROVED', 'ACTIVE', 'SUSPENDED', 'CANCELLED', 'EXPIRED');
ALTER TABLE "public"."subscriptions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "public"."subscriptions" ALTER COLUMN "status" type "public"."subscription_status" using ("status"::"public"."subscription_status");
