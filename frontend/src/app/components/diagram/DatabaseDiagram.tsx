"use client";
import { useMemo } from "react";
import { useSchemas } from "@/app/context/SchemaContext";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { motion } from "framer-motion";
import TableNode from "./TableNode";
import { getLayoutedElements } from "./layout";

export default function DatabaseDiagram() {
  const { schema, prevSchema, changedTables, loading, error } = useSchemas();

  if (loading)
    return <div className="text-gray-400 p-4 text-center">Cargando esquema...</div>;
  if (error)
    return <div className="text-red-500 p-4 text-center">{error}</div>;
  if (!schema)
    return <div className="text-gray-400 p-4 text-center">Sin datos de esquema</div>;

  // 🧠 Recalcular solo cuando el esquema cambia
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const nodes = Object.entries(schema).map(([tableKey, tableData]) => {
      const [, tableName] = tableKey.split(".");
      const isChanged = changedTables.includes(tableKey);

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
        type: "animatedTableNode",
        data,
        position: { x: 0, y: 0 },
        style: isChanged
          ? {
            border: "2px solid #f97316",
            boxShadow: "0 0 10px #fb923c",
            transform: "scale(1.03)",
            transition: "all 0.3s ease-in-out",
          }
          : {},
      };
    });

    const edges = Object.entries(schema).flatMap(([tableKey, tableData]) => {
      const [, sourceTable] = tableKey.split(".");
      return tableData.foreign_keys.map((fk, i) => ({
        id: `${sourceTable}-${fk.column}-${i}`,
        source: sourceTable,
        target: fk.ref_table,
        animated: true,
        style: { stroke: "#f97316", strokeWidth: 2 },
        type: "smoothstep",
      }));
    });

    return getLayoutedElements(nodes, edges);
  }, [schema, changedTables]);

  const [nodes, , onNodesChange] = useNodesState(layoutedNodes);
  const [edges, , onEdgesChange] = useEdgesState(layoutedEdges);

  // ⚙️ Nodo animado estable
  const nodeTypes = useMemo(
    () => ({
      animatedTableNode: (props) => (
        <motion.div
          key={props.id}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.85 }}
          transition={{ duration: 0.3 }}
          style={{ transformOrigin: "center" }}
        >
          <TableNode {...props} prevSchema={prevSchema} />
        </motion.div>
      ),
    }),
    [prevSchema]
  );

  return (
    <div className="h-full w-full bg-slate-50 flex items-center justify-center">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
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
