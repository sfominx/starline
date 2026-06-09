import { List } from "@raycast/api";
import React from "react";

export default function DevicesLoadingFallback() {
    return <List searchBarPlaceholder="Search devices" isLoading />;
}
