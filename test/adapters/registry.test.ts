import { describe, expect, it } from "vitest";
import { adapters, getAdapter } from "../../src/adapters/registry";

describe("adapter registry", () => {
  it("exposes greenhouse, lever, ashby", () => {
    const names = adapters.map((a) => a.name).sort();
    expect(names).toEqual(["ashby", "greenhouse", "lever"]);
  });

  it("getAdapter returns the adapter by name", () => {
    expect(getAdapter("greenhouse")?.name).toBe("greenhouse");
    expect(getAdapter("nope")).toBeUndefined();
  });
});
