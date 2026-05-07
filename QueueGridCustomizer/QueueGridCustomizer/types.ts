import * as React from "react";

export type ColumnDataType = "Text" | "OptionSet" | "Multiple" | "DateAndTime" | "DateOnly";

export interface ColumnDefinition {
    readonly name: string;
    readonly displayName?: string;
}

export interface GetRendererParams {
    readonly colDefs: ColumnDefinition[];
    readonly columnIndex: number;
}

export interface CellRendererProps {
    readonly value: unknown;
    readonly formattedValue?: string;
}

export type CellRendererOverrides = Partial<Record<ColumnDataType, (
        props: CellRendererProps,
        rendererParams: GetRendererParams
    ) => React.ReactElement | null | undefined>>;

export interface PAOneGridCustomizer {
    cellRendererOverrides?: CellRendererOverrides;
}
