import { describe, it, expect } from "vitest";
import { deriveChannelKey, deriveRecipientTag, formatTag } from "./channel";

describe("channel & recipient tag derivation", () => {
  it("derives consistent channel keys for matching seeds", () => {
    const seed = "12345678901234567890";
    const payerContext = "98765432109876543210";

    const key1 = deriveChannelKey(seed, payerContext);
    const key2 = deriveChannelKey(seed, payerContext);

    expect(key1).toBe(key2);
    expect(key1).toBeTypeOf("bigint");
  });

  it("produces distinct recipient tags for distinct channel keys", () => {
    const key1 = deriveChannelKey("1111", "2222");
    const key2 = deriveChannelKey("3333", "4444");

    const tag1 = deriveRecipientTag(key1);
    const tag2 = deriveRecipientTag(key2);

    expect(tag1).not.toBe(tag2);
  });

  it("formats recipient tags as padded hex strings", () => {
    const key = deriveChannelKey("123", "456");
    const tag = deriveRecipientTag(key);
    const formatted = formatTag(tag);

    expect(formatted.startsWith("0x")).toBe(true);
    expect(formatted.length).toBe(66); // 0x + 64 hex chars
  });
});
