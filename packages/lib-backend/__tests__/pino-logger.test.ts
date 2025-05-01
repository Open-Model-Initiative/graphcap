import { afterEach, describe, expect, it, vi } from "vitest";

describe("pinoLogger middleware", () => {
  // Common mocking setup function
  const setupMocks = (envConfig: Record<string, string> | undefined) => {
    vi.doMock("@graphcap/lib", () => ({ env: envConfig }));

    const loggerSpy = vi.fn();
    vi.doMock("hono-pino", () => ({ pinoLogger: loggerSpy }));

    const pinoSpy = vi.fn((options: unknown, transport: unknown) => ({
      options,
      transport,
    }));
    vi.doMock("pino", () => ({ default: pinoSpy }));

    const prettySpy = vi.fn(() => "prettyStream");
    vi.doMock("pino-pretty", () => ({ default: prettySpy }));

    return { loggerSpy, pinoSpy, prettySpy };
  };

  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  /**
   * GIVEN: no env variable exported from "@graphcap/lib"
   * WHEN: the middleware factory is imported & executed
   * THEN: it throws the expected error
   */
  it("throws when env is not provided", async () => {
    setupMocks(undefined);

    const { pinoLogger } = await import("../src/middlewares/pino-logger");

    expect(() => pinoLogger()).toThrowError("env is not provided");
  });

  /**
   * Parameterized test for different environment configurations
   */
  it.each([
    {
      name: "development environment",
      env: { NODE_ENV: "development", LOG_LEVEL: "info" } as const,
      expectPretty: true,
      expectedLevel: "info",
    },
    {
      name: "production environment",
      env: { NODE_ENV: "production", LOG_LEVEL: "debug" } as const,
      expectPretty: false,
      expectedLevel: "debug",
    },
  ])("configures logger correctly for $name", async ({ env, expectPretty, expectedLevel }) => {
    const { pinoSpy, prettySpy } = setupMocks(env);
    
    const { pinoLogger } = await import("../src/middlewares/pino-logger");
    pinoLogger();

    expect(pinoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: expectedLevel,
        redact: ["req.headers.cookie"],
      }),
      expectPretty ? "prettyStream" : undefined,
    );
    
    if (expectPretty) {
      expect(prettySpy).toHaveBeenCalled();
    } else {
      expect(prettySpy).not.toHaveBeenCalled();
    }
  });
}); 