import { StarLineCommands } from "./commands";

import type { AsyncCommandResponse } from "../types/starline";

type RecordedRequest = { url: string; options?: unknown };

class TestStarLineCommands extends StarLineCommands {
    readonly requests: RecordedRequest[] = [];

    constructor(private readonly responses: unknown[]) {
        super();
    }

    protected request<T>(url: string, options?: unknown): Promise<T> {
        this.requests.push({ url, options });
        return Promise.resolve(this.responses.shift() as T);
    }
}

const asyncResponse = (status: AsyncCommandResponse["status"]): AsyncCommandResponse => ({
    code: 200,
    codestring: "OK",
    status,
});

describe("StarLineCommands", () => {
    it("does not fallback to legacy command when async command returns device failure", async () => {
        const client = new TestStarLineCommands([asyncResponse(4)]);

        await expect(client.sendCommandWithAsyncFallback("42", "poke", 1)).rejects.toThrow(
            "Device is offline",
        );

        expect(client.requests).toHaveLength(1);
    });
});
