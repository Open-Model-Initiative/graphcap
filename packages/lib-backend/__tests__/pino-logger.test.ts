import { afterEach, describe, expect, it, vi } from "vitest";

describe("pinoLogger middleware", () => {
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
    vi.doMock("@graphcap/lib", () => ({ env: undefined }));

    const { pinoLogger } = await import("../src/middlewares/pino-logger");

    expect(() => pinoLogger()).toThrowError("env is not provided");
  });

  /**
   * GIVEN: a non-production env and mocked dependencies
   * WHEN: the middleware is created
   * THEN: pino is instantiated with a pretty stream for formatted output
   */
  it("uses pino-pretty when NODE_ENV is not 'production'", async () => {
    const envMock = { NODE_ENV: "development", LOG_LEVEL: "info" } as const;
    vi.doMock("@graphcap/lib", () => ({ env: envMock }));

    const loggerSpy = vi.fn();
    vi.doMock("hono-pino", () => ({ pinoLogger: loggerSpy }));

    const pinoSpy = vi.fn((options: unknown, transport: unknown) => ({
      options,
      transport,
    }));
    vi.doMock("pino", () => ({ default: pinoSpy }));

    const prettySpy = vi.fn(() => "prettyStream");
    vi.doMock("pino-pretty", () => ({ default: prettySpy }));

    const { pinoLogger } = await import("../src/middlewares/pino-logger");
    pinoLogger();

    expect(pinoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "info",
        redact: ["req.headers.cookie"],
      }),
      "prettyStream",
    );
  });

  /**
   * GIVEN: a production env and mocked dependencies
   * WHEN: the middleware is created
   * THEN: pino is instantiated with undefined transport (no pretty printing)
   *      and pino-pretty is never called
   */
  it("does NOT use pino-pretty when NODE_ENV is 'production'", async () => {
    const envMock = { NODE_ENV: "production", LOG_LEVEL: "debug" } as const;
    vi.doMock("@graphcap/lib", () => ({ env: envMock }));

    const loggerSpy = vi.fn();
    vi.doMock("hono-pino", () => ({ pinoLogger: loggerSpy }));

    const pinoSpy = vi.fn((options: unknown, transport: unknown) => ({
      options,
      transport,
    }));
    vi.doMock("pino", () => ({ default: pinoSpy }));

    const prettySpy = vi.fn(() => "prettyStream");
    vi.doMock("pino-pretty", () => ({ default: prettySpy }));

    const { pinoLogger } = await import("../src/middlewares/pino-logger");
    pinoLogger();

    expect(pinoSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        level: "debug",
        redact: ["req.headers.cookie"],
      }),
      undefined,
    );
    expect(prettySpy).not.toHaveBeenCalled();
  });
}); 