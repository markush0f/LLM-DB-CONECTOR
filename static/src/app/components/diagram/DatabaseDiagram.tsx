"use client";
import { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import TableNode from "./TableNode";
import { getLayoutedElements } from "./layout";
import { useSchemas } from "@/app/context/SchemaContext";

export default function DatabaseDiagram() {
  const { loading, error } = useSchemas();

  // 1️⃣ Mostrar estados de carga o error
  if (loading) return <div className="text-gray-400 p-4">Cargando esquema...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;
  if (!schema) return <div className="text-gray-400 p-4">Sin datos de esquema</div>;

  // 2️⃣ Transformar el JSON del backend → nodos
  const initialNodes = useMemo(() => {
    const nodes = Object.entries(schema).map(([tableKey, tableData]) => {
      const [, tableName] = tableKey.split("."); // quita el "public."
      const data = {
        name: tableName,
        columns: tableData.columns.map((col) => ({
          name: col.name,
          type: col.type,
          isPK: tableData.primary_keys.includes(col.name),
          isFK: tableData.foreign_keys.some((fk) => fk.column === col.name),
        })),
      };
      return {
        id: tableName,
        type: "tableNode",
        data,
        position: { x: 0, y: 0 },
      };
    });
    return nodes;
  }, [schema]);

  // 3️⃣ Transformar relaciones del backend → edges
  const initialEdges = useMemo(() => {
    const edges: any[] = [];

    Object.entries(schema).forEach(([tableKey, tableData]) => {
      const [, sourceTable] = tableKey.split(".");
      tableData.foreign_keys.forEach((fk, i) => {
        const targetTable = fk.ref_table;
        edges.push({
          id: `${sourceTable}-${fk.column}-${i}`,
          source: sourceTable,
          sourceHandle: `${sourceTable}-${fk.column}-source`,
          target: targetTable,
          targetHandle: `${targetTable}-${fk.ref_column}-target`,
          animated: true,
          style: { stroke: "#f97316", strokeWidth: 2 },
          type: "smoothstep",
        });
      });
    });

    return edges;
  }, [schema]);

  // 4️⃣ Aplicar layout automático
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    [initialNodes, initialEdges]
  );

  // 5️⃣ Estados controlados por ReactFlow
  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

  return (
    <div className="h-full w-full bg-slate-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ tableNode: TableNode }}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        nodesDraggable
        nodesConnectable={false}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={20} size={1} />
        <Controls
          showInteractive={false}
          className="bg-white border border-slate-200 rounded-lg shadow-md"
        />
      </ReactFlow>
    </div>
  );
}
