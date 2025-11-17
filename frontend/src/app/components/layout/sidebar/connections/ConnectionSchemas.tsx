"use client";
import React from "react";
import SchemaDropdown from "../SchemaDropdown";

interface ConnectionSchemasProps {
    schemas: string[];
    onSchemaSelect: (schema: string) => void;
}

export default function ConnectionSchemas({ schemas, onSchemaSelect }: ConnectionSchemasProps) {
    return (
        <div className="border-t border-orange-200 bg-orange-50/50 px-4 py-2">
            <SchemaDropdown schemas={schemas} onTableSelect={onSchemaSelect} />
        </div>
    );
}
