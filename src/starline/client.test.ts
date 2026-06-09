import fetch from "node-fetch";

import { StarLineClient } from "./client";

class TestStarLineClient extends StarLineClient {
    protected auth() {
        return Promise.resolve({ userId: "1", slnetUserToken: "token" });
    }

    callRequest<T>(url = "https://example.test") {
        return this.request<T>(url);
    }
}

describe("StarLineClient", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("turns non-JSON API errors into displayable errors", async () => {
        jest.mocked(fetch).mockResolvedValue({
            status: 500,
            text: () => Promise.resolve("upstream unavailable"),
        } as never);

        await expect(new TestStarLineClient().callRequest()).rejects.toThrow(
            "upstream unavailable",
        );
    });

    it("rejects API envelopes with unsuccessful codes even when HTTP status is 200", async () => {
        jest.mocked(fetch).mockResolvedValue({
            status: 200,
            text: () => Promise.resolve(JSON.stringify({ code: 500, codestring: "failed" })),
        } as never);

        await expect(new TestStarLineClient().callRequest()).rejects.toThrow("failed");
    });
});
