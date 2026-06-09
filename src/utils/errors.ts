/* eslint max-classes-per-file: 0 */
const UNKNOWN_ERROR_MESSAGE = "Unknown error";

class ManuallyThrownError extends Error {}

export class DisplayableError extends ManuallyThrownError {}

export function getErrorMessage(error: unknown, fallback = UNKNOWN_ERROR_MESSAGE) {
    return error instanceof Error ? error.message : fallback;
}

export function getDisplayableErrorMessage(error: unknown) {
    return error instanceof DisplayableError ? error.message : undefined;
}

export class CaptchaNeededError extends DisplayableError {
    constructor(
        message = "Failed to load devices items. Captcha needed.",
        readonly captchaSid?: string,
        readonly captchaImg?: string,
    ) {
        super(message);
        this.name = "CaptchaNeededError";
    }
}
