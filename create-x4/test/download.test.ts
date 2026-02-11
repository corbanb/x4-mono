import { describe, expect, test, mock, beforeEach } from "bun:test";

// We need to mock giget before importing download
const mockDownloadTemplate = mock(async () => {});

mock.module("giget", () => ({
  downloadTemplate: mockDownloadTemplate,
}));

// Import after mock
const { downloadTemplate_ } = await import("../src/download.js");

describe("downloadTemplate_", () => {
  beforeEach(() => {
    mockDownloadTemplate.mockClear();
  });

  test("calls giget with correct source URL", async () => {
    mockDownloadTemplate.mockResolvedValueOnce(undefined as never);

    await downloadTemplate_({
      targetDir: "/tmp/test-dir",
      branch: "main",
      verbose: false,
    });

    expect(mockDownloadTemplate).toHaveBeenCalledTimes(1);
    const [source, opts] = mockDownloadTemplate.mock.calls[0];
    expect(source).toBe("github:corbanb/x4-mono#main");
    expect(opts).toEqual({ dir: "/tmp/test-dir", force: true });
  });

  test("uses custom branch in source URL", async () => {
    mockDownloadTemplate.mockResolvedValueOnce(undefined as never);

    await downloadTemplate_({
      targetDir: "/tmp/test",
      branch: "feat/new-thing",
      verbose: false,
    });

    const [source] = mockDownloadTemplate.mock.calls[0];
    expect(source).toBe("github:corbanb/x4-mono#feat/new-thing");
  });

  test("succeeds on first attempt", async () => {
    mockDownloadTemplate.mockResolvedValueOnce(undefined as never);

    await downloadTemplate_({
      targetDir: "/tmp/test",
      branch: "main",
      verbose: false,
    });

    expect(mockDownloadTemplate).toHaveBeenCalledTimes(1);
  });

  test("retries on failure, succeeds on 2nd attempt", async () => {
    mockDownloadTemplate
      .mockRejectedValueOnce(new Error("network error") as never)
      .mockResolvedValueOnce(undefined as never);

    await downloadTemplate_({
      targetDir: "/tmp/test",
      branch: "main",
      verbose: false,
    });

    expect(mockDownloadTemplate).toHaveBeenCalledTimes(2);
  });

  test("retries on failure, succeeds on 3rd attempt", async () => {
    mockDownloadTemplate
      .mockRejectedValueOnce(new Error("fail 1") as never)
      .mockRejectedValueOnce(new Error("fail 2") as never)
      .mockResolvedValueOnce(undefined as never);

    await downloadTemplate_({
      targetDir: "/tmp/test",
      branch: "main",
      verbose: false,
    });

    expect(mockDownloadTemplate).toHaveBeenCalledTimes(3);
  });

  test("throws after 3 failures with GIGET_AUTH hint", async () => {
    mockDownloadTemplate
      .mockRejectedValueOnce(new Error("rate limited") as never)
      .mockRejectedValueOnce(new Error("rate limited") as never)
      .mockRejectedValueOnce(new Error("rate limited") as never);

    try {
      await downloadTemplate_({
        targetDir: "/tmp/test",
        branch: "main",
        verbose: false,
      });
      expect.unreachable("Should have thrown");
    } catch (err) {
      const msg = (err as Error).message;
      expect(msg).toContain("Failed to download template after 3 attempts");
      expect(msg).toContain("rate limited");
      expect(msg).toContain("GIGET_AUTH");
    }
  });

  test("handles non-Error rejections", async () => {
    mockDownloadTemplate
      .mockRejectedValueOnce("string error" as never)
      .mockRejectedValueOnce("string error" as never)
      .mockRejectedValueOnce("string error" as never);

    try {
      await downloadTemplate_({
        targetDir: "/tmp/test",
        branch: "main",
        verbose: false,
      });
      expect.unreachable("Should have thrown");
    } catch (err) {
      expect((err as Error).message).toContain("string error");
    }
  });

  test("passes targetDir and force option to giget", async () => {
    mockDownloadTemplate.mockResolvedValueOnce(undefined as never);

    await downloadTemplate_({
      targetDir: "/home/user/projects/my-app",
      branch: "main",
      verbose: false,
    });

    const [, opts] = mockDownloadTemplate.mock.calls[0];
    expect(opts.dir).toBe("/home/user/projects/my-app");
    expect(opts.force).toBe(true);
  });
});
