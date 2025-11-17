export interface Column {
    name: string;
    type: string;
    nullable: string;
    default: string | null;
}

export interface ForeignKey {
    column: string;
    ref_table: string;
    ref_column: string;
}

export interface TableData {
    columns: Column[];
    primary_keys: string[];
    foreign_keys: ForeignKey[];
}
