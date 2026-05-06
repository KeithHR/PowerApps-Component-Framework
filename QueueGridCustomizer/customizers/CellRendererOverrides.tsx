import * as React from "react";
import { CellRendererOverrides, CellRendererProps, GetRendererParams } from "../types";

const ICON_BLUE = "#1f6feb";
const CURRENT_YEAR = 2026;
const GREEN_TEXT = "#1a7f37";
const RED_TEXT = "#cf222e";

function isOriginColumn(params: GetRendererParams): boolean {
    const col = params.colDefs[params.columnIndex];
    const logicalName = (col?.name ?? "").trim().toLowerCase();
    const displayName = (col?.displayName ?? "").trim().toLowerCase();
    return logicalName.includes("origin") || displayName === "origin (object)" || displayName === "origin";
}

function getIconByOriginText(formattedValue: string): string | null {
    const normalized = formattedValue.trim().toLowerCase();

    if (normalized === "phone") {
        return "☎";
    }

    if (normalized === "mail") {
        return "✉";
    }

    if (normalized === "online") {
        return "◉";
    }

    return null;
}

function renderOriginIconWithText(formattedValue: string): React.ReactElement | undefined {
    const icon = getIconByOriginText(formattedValue);
    if (!icon) {
        return undefined;
    }

    return React.createElement(
        "span",
        {
            style: {
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
            },
        },
        React.createElement(
            "span",
            {
                style: {
                    color: ICON_BLUE,
                    fontSize: "14px",
                    lineHeight: "1",
                },
            },
            icon
        ),
        React.createElement("span", null, formattedValue)
    );
}

function isEnteredQueueColumn(params: GetRendererParams): boolean {
    const col = params.colDefs[params.columnIndex];
    const logicalName = (col?.name ?? "").trim().toLowerCase();
    const displayName = (col?.displayName ?? "").trim().toLowerCase();
    return (
        logicalName.includes("enteredqueue") ||
        logicalName.includes("entered_queue") ||
        displayName === "entered queue"
    );
}

function extractYearFromDate(dateString: string): number | null {
    if (!dateString) {
        return null;
    }

    // Try to match 4-digit year anywhere in the string
    const yearMatch = dateString.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
        return parseInt(yearMatch[0], 10);
    }

    // Try parsing as date
    try {
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
            return date.getFullYear();
        }
    } catch {
        // Fall through to return null
    }

    return null;
}

function renderEnteredQueueCell(props: CellRendererProps, params: GetRendererParams): React.ReactElement | undefined {
    if (!isEnteredQueueColumn(params)) {
        return undefined;
    }

    const formattedValue = props.formattedValue ?? "";
    const year = extractYearFromDate(formattedValue);
    const textColor = year === CURRENT_YEAR ? GREEN_TEXT : RED_TEXT;

    return React.createElement(
        "span",
        { style: { color: textColor } },
        formattedValue
    );
}

function renderTextCell(props: CellRendererProps, params: GetRendererParams): React.ReactElement | undefined {
    // Try entered queue first
    const enteredResult = renderEnteredQueueCell(props, params);
    if (enteredResult) {
        return enteredResult;
    }

    // Try origin
    if (!isOriginColumn(params)) {
        return undefined;
    }

    const formattedValue = props.formattedValue ?? "";
    return renderOriginIconWithText(formattedValue);
}

export const cellRendererOverrides: CellRendererOverrides = {
    Text: renderTextCell,
    OptionSet: renderTextCell,
    Multiple: renderTextCell,
    DateAndTime: renderTextCell,
    DateOnly: renderTextCell,
};
