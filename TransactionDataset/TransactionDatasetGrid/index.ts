import { IInputs, IOutputs } from "./generated/ManifestTypes";
type DataSet = ComponentFramework.PropertyTypes.DataSet;
type DataSetColumn = DataSet["columns"][number];
interface ResolvedColumn {
    header: string;
    logicalName?: string;
}

interface TargetColumn {
    header: string;
    logicalNames: string[];
    displayNames: string[];
}

export class TransactionDatasetGrid implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private static readonly targetColumns: TargetColumn[] = [
        { header: "Created On", logicalNames: ["createdon"], displayNames: ["Created On"] },
        { header: "Subject (Regarding)", logicalNames: ["subject"], displayNames: ["Subject (Regarding)", "Subject"] },
        { header: "Origin (Regarding)", logicalNames: ["new_origin", "origin"], displayNames: ["Origin (Regarding)", "Origin"] },
        { header: "Case Title (Regarding)", logicalNames: ["new_casetitle", "casetitle"], displayNames: ["Case Title (Regarding)", "Case Title"] },
        { header: "Activity Status", logicalNames: ["statuscode", "statecode"], displayNames: ["Activity Status", "Status", "Status Reason"] },
        { header: "Actual End", logicalNames: ["actualend"], displayNames: ["Actual End"] },
        { header: "Owner", logicalNames: ["ownerid"], displayNames: ["Owner"] }
    ];

    private container: HTMLDivElement;
    private titleElement: HTMLDivElement;
    private statusElement: HTMLDivElement;
    private tableElement: HTMLTableElement;
    private theadElement: HTMLTableSectionElement;
    private tbodyElement: HTMLTableSectionElement;
    private loadMoreButton: HTMLButtonElement;
    private loadMoreClickHandler: (() => void) | undefined;

    constructor() {
        this.container = document.createElement("div");
        this.titleElement = document.createElement("div");
        this.statusElement = document.createElement("div");
        this.tableElement = document.createElement("table");
        this.theadElement = document.createElement("thead");
        this.tbodyElement = document.createElement("tbody");
        this.loadMoreButton = document.createElement("button");
    }

    /**
     * Used to initialize the control instance. Controls can kick off remote server calls and other initialization actions here.
     * Data-set values are not initialized here, use updateView.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to property names defined in the manifest, as well as utility functions.
     * @param notifyOutputChanged A callback method to alert the framework that the control has new outputs ready to be retrieved asynchronously.
     * @param state A piece of data that persists in one session for a single user. Can be set at any point in a controls life cycle by calling 'setControlState' in the Mode interface.
     * @param container If a control is marked control-type='standard', it will receive an empty div element within which it can render its content.
     */
    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary,
        container: HTMLDivElement
    ): void {
        this.container.className = "transaction-grid";

        this.titleElement.className = "transaction-grid__title";
        this.titleElement.textContent = "Transactions";

        this.statusElement.className = "transaction-grid__status";

        this.tableElement.className = "transaction-grid__table";
        this.tableElement.appendChild(this.theadElement);
        this.tableElement.appendChild(this.tbodyElement);

        this.loadMoreButton.className = "transaction-grid__load-more";
        this.loadMoreButton.textContent = "Load more";
        this.loadMoreButton.type = "button";
        this.loadMoreClickHandler = () => {
            const dataSet = context.parameters.sampleDataSet;
            if (dataSet.paging.hasNextPage) {
                dataSet.paging.loadNextPage();
            }
        };
        this.loadMoreButton.addEventListener("click", this.loadMoreClickHandler);

        this.container.appendChild(this.titleElement);
        this.container.appendChild(this.statusElement);
        this.container.appendChild(this.tableElement);
        this.container.appendChild(this.loadMoreButton);

        container.appendChild(this.container);

        void notifyOutputChanged;
        void state;
    }


    /**
     * Called when any value in the property bag has changed. This includes field values, data-sets, global values such as container height and width, offline status, control metadata values such as label, visible, etc.
     * @param context The entire property bag available to control via Context Object; It contains values as set up by the customizer mapped to names defined in the manifest, as well as utility functions
     */
    public updateView(context: ComponentFramework.Context<IInputs>): void {
        const dataSet: DataSet = context.parameters.sampleDataSet;

        if (dataSet.loading) {
            this.statusElement.textContent = "Loading transactions...";
            this.tableElement.style.display = "none";
            this.loadMoreButton.style.display = "none";
            return;
        }

        const columnsToRender = this.getResolvedColumns(dataSet.columns);
        const sortedRecordIds = dataSet.sortedRecordIds;

        this.renderHeader(columnsToRender);
        this.renderRows(dataSet, columnsToRender, sortedRecordIds);

        if (sortedRecordIds.length === 0) {
            this.statusElement.textContent = "No transactions found for this view.";
            this.tableElement.style.display = "table";
        } else {
            this.statusElement.textContent = `${sortedRecordIds.length} transaction record(s) loaded.`;
            this.tableElement.style.display = "table";
        }

        this.loadMoreButton.style.display = dataSet.paging.hasNextPage ? "inline-flex" : "none";
    }

    private renderHeader(columns: ResolvedColumn[]): void {
        this.theadElement.innerHTML = "";

        const headerRow = document.createElement("tr");
        for (const column of columns) {
            const headerCell = document.createElement("th");
            headerCell.textContent = column.header;
            headerRow.appendChild(headerCell);
        }

        this.theadElement.appendChild(headerRow);
    }

    private renderRows(dataSet: DataSet, columns: ResolvedColumn[], recordIds: string[]): void {
        this.tbodyElement.innerHTML = "";

        for (const recordId of recordIds) {
            const record = dataSet.records[recordId];
            const row = document.createElement("tr");

            for (const column of columns) {
                const cell = document.createElement("td");
                cell.textContent = column.logicalName ? record.getFormattedValue(column.logicalName) : "";
                row.appendChild(cell);
            }

            this.tbodyElement.appendChild(row);
        }

        if (recordIds.length === 0) {
            const emptyRow = document.createElement("tr");
            const emptyCell = document.createElement("td");
            emptyCell.colSpan = Math.max(columns.length, 1);
            emptyCell.textContent = "No rows to display in preview.";
            emptyRow.appendChild(emptyCell);
            this.tbodyElement.appendChild(emptyRow);
        }
    }

    private getResolvedColumns(allColumns: DataSetColumn[]): ResolvedColumn[] {
        const visibleColumns = allColumns.filter((column) => !column.isHidden);

        const resolvedColumns: ResolvedColumn[] = [];
        for (const targetColumn of TransactionDatasetGrid.targetColumns) {
            const match = visibleColumns.find((column) => {
                const logicalNameMatches = targetColumn.logicalNames.some(
                    (logicalName) => logicalName.toLowerCase() === column.name.toLowerCase()
                );
                const displayNameMatches = targetColumn.displayNames.some(
                    (displayName) =>
                        displayName.localeCompare(column.displayName, undefined, { sensitivity: "accent" }) === 0
                );

                return logicalNameMatches || displayNameMatches;
            });

            resolvedColumns.push({
                header: targetColumn.header,
                logicalName: match?.name
            });
        }

        return resolvedColumns;
    }

    /**
     * It is called by the framework prior to a control receiving new data.
     * @returns an object based on nomenclature defined in manifest, expecting object[s] for property marked as "bound" or "output"
     */
    public getOutputs(): IOutputs {
        return {};
    }

    /**
     * Called when the control is to be removed from the DOM tree. Controls should use this call for cleanup.
     * i.e. cancelling any pending remote calls, removing listeners, etc.
     */
    public destroy(): void {
        if (this.loadMoreClickHandler) {
            this.loadMoreButton.removeEventListener("click", this.loadMoreClickHandler);
        }
    }
}
