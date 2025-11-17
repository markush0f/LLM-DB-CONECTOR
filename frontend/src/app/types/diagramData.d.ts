interface Column {
    name: string;
    type: string;
    nullable: string;
    default: string | null;
}

interface ForeignKey {
    column: string;
    ref_table: string;
    ref_column: string;
}

interface TableSchema {
    columns: Column[];
    primary_keys: string[];
    foreign_keys: ForeignKey[];
}

interface DatabaseSchema {
    [tableName: string]: TableSchema;
}

interface TableColumn {
    name: string;
    type: string;
    isPK: boolean;
    isFK: boolean;
}

export interface DiagramData {
    name: string;
    columns: TableColumn[];
}


