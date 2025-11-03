"use client";
import React from "react";
import {
  ReactFlow,
  Background,
  Controls,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const mockSchema = {
  tables: [
    { name: "usuario", columns: ["id", "nombre", "apellidos"] },
    { name: "pedido", columns: ["id", "usuario_id", "fecha", "total"] },
    { name: "producto", columns: ["id", "nombre", "precio"] },
    { name: "pedido_producto", columns: ["pedido_id", "producto_id", "cantidad"] },
  ],
  relations: [
    { from: "pedido.usuario_id", to: "usuario.id" },
    { from: "pedido_producto.pedido_id", to: "pedido.id" },
    { from: "pedido_producto.producto_id", to: "producto.id" },
  ],
};

const TableNode = ({ data }: any) => (
  <div className="bg-white border border-gray-300 rounded-lg shadow-sm p-3 min-w-[160px]">
    <div className="font-semibold text-gray-800 mb-2 text-sm">{data.name}</div>
    <ul className="text-xs text-gray-600 space-y-1">
      {data.columns.map((col: string, i: number) => (
        <li key={i}>• {col}</li>
      ))}
    </ul>
    <Handle type="target" position={Position.Top} />
    <Handle type="source" position={Position.Bottom} />
  </div>
);

export default function DatabaseDiagram() {
  const nodes = mockSchema.tables.map((table, i) => ({
    id: table.name,
    type: "tableNode",
    position: { x: i * 220, y: 100 },
    data: table,
  }));

  const edges = mockSchema.relations.map((rel, i) => ({
    id: `e${i}`,
    source: rel.from.split(".")[0],
    target: rel.to.split(".")[0],
    animated: true,
    style: { stroke: "#f97316" },
  }));

  return (
    <div className="h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ tableNode: TableNode }}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#f3f4f6" gap={16} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}
