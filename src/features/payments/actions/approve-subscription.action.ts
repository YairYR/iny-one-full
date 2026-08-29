import { logger } from "@/lib/logger";

const log = logger.child({ action: "approve-subscription" });

export async function actionApproveSubscription() {
  const logAction = log.child({ action: "approve subscription" });
  logAction.info("Approve subscription");
}
