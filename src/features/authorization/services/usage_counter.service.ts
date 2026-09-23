import { getUsageCounterRepository } from "@/infra/db/usage_counter.repository";
import { supabase_service } from "@/infra/db/supabase_service";
import { ShorterRepository } from "@/infra/db/shorter.repository";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";

dayjs.extend(utc);

export class UsageCounterService {
  private usageRepo: ReturnType<typeof getUsageCounterRepository>;
  private shorterRepo: ShorterRepository;

  constructor(shorterRepo: ShorterRepository) {
    this.usageRepo = getUsageCounterRepository(supabase_service);
    this.shorterRepo = shorterRepo;
  }

  async checkRateLimitByUser(userId: string) {
    const date = dayjs().utc().date(1);
    const { data, error } = await this.usageRepo.getMetric('user', userId, 'links.created', date.toDate());

    if (error) {
      return { count: undefined, error };
    }

    return { count: data?.used, error: undefined };
  }

  async checkRateLimitByIp(ip: string) {
    return this.shorterRepo.countLinksByIpInLastMonth(ip);
  }
}