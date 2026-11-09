import 'server-only';
import { UAParser } from "ua-parser-js";
import { Bots } from "ua-parser-js/extensions";
import { userAgent } from 'next/server';
import { isBot } from "ua-parser-js/bot-detection";

export type UserAgent = ReturnType<typeof userAgent>;

export function getUserAgent(headers: Headers): UserAgent {
  const result = UAParser(Bots, headers);
  return {
    ua: result.ua,
    isBot: isBot(result),
    browser: {
      name: result.browser.name,
      version: result.browser.version,
      major: result.browser.major,
    },
    device: {
      type: result.device.type,
      vendor: result.device.vendor,
      model: result.device.model,
    },
    os: {
      name: result.os.name,
      version: result.os.version,
    },
    engine: {
      name: result.engine.name,
      version: result.engine.version,
    },
    cpu: {
      architecture: result.cpu.architecture,
    }
  };
}