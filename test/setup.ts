import React from "react";

function createComponent(name: string) {
    const Component = ({ children }: { children?: React.ReactNode }) =>
        React.createElement(name, null, children);
    Component.displayName = name;
    return Component;
}

const Action = Object.assign(createComponent("Action"), {
    Push: createComponent("Action.Push"),
    SubmitForm: createComponent("Action.SubmitForm"),
    OpenInBrowser: createComponent("Action.OpenInBrowser"),
    CopyToClipboard: createComponent("Action.CopyToClipboard"),
});

const ActionPanel = Object.assign(createComponent("ActionPanel"), {
    Section: createComponent("ActionPanel.Section"),
});

const Icon = new Proxy(
    {},
    {
        get: (_target, property) => String(property),
    },
);

jest.mock("node-fetch", () => jest.fn(), { virtual: true });

jest.mock("@raycast/api", () => ({
    Action,
    ActionPanel,
    Alert: { ActionStyle: { Default: "default", Destructive: "destructive" } },
    Color: {},
    Detail: createComponent("Detail"),
    Form: Object.assign(createComponent("Form"), {
        Description: createComponent("Form.Description"),
        TextArea: createComponent("Form.TextArea"),
        TextField: createComponent("Form.TextField"),
    }),
    Icon,
    List: Object.assign(createComponent("List"), {
        EmptyView: createComponent("List.EmptyView"),
        Item: createComponent("List.Item"),
    }),
    LocalStorage: {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
    },
    Toast: { Style: { Animated: "animated", Failure: "failure", Success: "success" } },
    confirmAlert: jest.fn(),
    environment: { isDevelopment: false },
    getPreferenceValues: jest.fn(() => ({ AppId: "", Secret: "", Login: "", Password: "" })),
    popToRoot: jest.fn(),
    showToast: jest.fn(),
}), { virtual: true });
