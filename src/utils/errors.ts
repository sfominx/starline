/* eslint max-classes-per-file: 0 */
class ManuallyThrownError extends Error {}

export class DisplayableError extends ManuallyThrownError {}

export function getDisplayableErrorMessage(error: unknown) {
    if (error instanceof DisplayableError) return error.message;
    return undefined;
}

export class InvalidSecretError extends DisplayableError {
    constructor(message?: string) {
        super(message ?? "Failed to load devices items. Invalid secret.");
        this.name = "InvalidSecretError";
    }
}

export class CaptchaNeededError extends DisplayableError {
    captchaSid: string | undefined;

    captchaImg: string | undefined;

    constructor(message?: string, captchaSid?: string, captchaImg?: string) {
        super(message ?? "Failed to load devices items. Captcha needed.");
        this.name = "CaptchaNeededError";
        this.captchaSid = captchaSid;
        this.captchaImg = captchaImg;
    }
}

export class FailedToLoadDevicesItemsError extends ManuallyThrownError {
    constructor(message?: string) {
        super(message ?? "Failed to load devices items");
        this.name = "FailedToLoadDevicesItemsError";
    }
}
