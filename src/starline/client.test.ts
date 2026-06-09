import { LocalStorage } from "@raycast/api";
import fetch from "node-fetch";

import { StarLineClient } from "./client";
import { LOCAL_STORAGE } from "./constants";

class TestStarLineClient extends StarLineClient {
    protected auth() {
        return Promise.resolve({ userId: "1", slnetUserToken: "token" });
    }

    callRequest<T>(url = "https://example.test") {
        return this.request<T>(url);
    }
}

class FullAuthStarLineClient extends StarLineClient {
    callRequest<T>(url = "https://example.test") {
        return this.request<T>(url);
    }
}

const jsonResponse = (data: unknown, headers?: { get: (name: string) => string | null }) =>
    ({ json: () => Promise.resolve(data), headers }) as never;

const textResponse = (status: number, text: string) =>
    ({ status, text: () => Promise.resolve(text) }) as never;

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

    it("does not persist auth bearer tokens or cookies in LocalStorage", async () => {
        jest.mocked(LocalStorage.getItem).mockResolvedValue(undefined);
        jest.mocked(fetch)
            .mockResolvedValueOnce(jsonResponse({ state: 1, desc: { code: "app-code" } }))
            .mockResolvedValueOnce(jsonResponse({ state: 1, desc: { token: "app-token" } }))
            .mockResolvedValueOnce(jsonResponse({ state: 1, desc: { user_token: "slid-token" } }))
            .mockResolvedValueOnce(
                jsonResponse({ user_id: "user-1" }, { get: () => "slnet=slnet-cookie; Path=/" }),
            )
            .mockResolvedValueOnce(textResponse(200, JSON.stringify({ code: 200 })));

        await new FullAuthStarLineClient().callRequest();

        expect(jest.mocked(LocalStorage.setItem).mock.calls).toEqual([
            [LOCAL_STORAGE.USER_ID, "user-1"],
        ]);
    });

    it("only clears persisted auth metadata from LocalStorage", async () => {
        await StarLineClient.clearAuthCache();

        expect(jest.mocked(LocalStorage.removeItem).mock.calls).toEqual([
            [LOCAL_STORAGE.CAPTCHA_SID],
            [LOCAL_STORAGE.CAPTCHA_IMG],
            [LOCAL_STORAGE.USER_ID],
        ]);
    });
});
