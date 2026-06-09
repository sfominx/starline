import React from "react";
import { List } from "@raycast/api";

export default function DevicesLoadingFallback() {
    return <List searchBarPlaceholder="Search devices" isLoading />;
}
