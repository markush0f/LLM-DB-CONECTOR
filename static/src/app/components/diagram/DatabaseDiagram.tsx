"use client";
import React, { useMemo } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import TableNode from "./TableNode";
import { mockSchema } from "./mockSchema";
import { getLayoutedElements } from "./layout";

export default function DatabaseDiagram() {
  const initialNodes = mockSchema.tables.map((table) => ({
    id: table.name,
    type: "tableNode",
    data: table,
  }));

  const initialEdges = mockSchema.relations.map((rel, i) => {
    const [sourceTable, sourceField] = rel.from.split(".");
    const [targetTable, targetField] = rel.to.split(".");
    return {
      id: `e${i}`,
      source: sourceTable,
      sourceHandle: `${sourceTable}-${sourceField}-source`,
      target: targetTable,
      targetHandle: `${targetTable}-${targetField}-target`,
      animated: true,
      style: { stroke: "#f97316", strokeWidth: 2 },
      type: "smoothstep",
    };
  });

  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(
    () => getLayoutedElements(initialNodes, initialEdges),
    []
  );

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
