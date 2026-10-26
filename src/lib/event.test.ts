import { describe, expect, it } from "vitest";
import { allowNewRegistration, registerPageMode } from "./event";

describe("registration status", () => {
  it("is closed while the event has started", () => {
    expect(allowNewRegistration()).toBe(false);
    expect(registerPageMode()).toBe("closed");
  });
});
