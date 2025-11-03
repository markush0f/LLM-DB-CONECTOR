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
    {
      name: "usuario", columns: [
        { name: "id", type: "INT", isPK: true },
        { name: "nombre", type: "VARCHAR(100)" },
        { name: "apellidos", type: "VARCHAR(100)" }
      ]
    },
    {
      name: "pedido", columns: [
        { name: "id", type: "INT", isPK: true },
        { name: "usuario_id", type: "INT", isFK: true },
        { name: "fecha", type: "DATETIME" },
        { name: "total", type: "DECIMAL(10,2)" }
      ]
    },
    {
      name: "producto", columns: [
        { name: "id", type: "INT", isPK: true },
        { name: "nombre", type: "VARCHAR(200)" },
        { name: "precio", type: "DECIMAL(10,2)" }
      ]
    },
    {
      name: "pedido_producto", columns: [
        { name: "pedido_id", type: "INT", isFK: true, isPK: true },
        { name: "producto_id", type: "INT", isFK: true, isPK: true },
        { name: "cantidad", type: "INT" }
      ]
    },
  ],
  relations: [
    { from: "pedido.usuario_id", to: "usuario.id" },
    { from: "pedido_producto.pedido_id", to: "pedido.id" },
    { from: "pedido_producto.producto_id", to: "producto.id" },
  ],
};

const TableNode = ({ data }: any) => (
  <div className="bg-white border-2 border-slate-400 rounded-md shadow-lg overflow-hidden min-w-[240px]">
    {/* Table Header */}
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2.5 flex items-center gap-2">
      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
      </svg>
      <span className="font-bold text-white text-sm tracking-wide">{data.name}</span>
    </div>

    {/* Table Columns */}
    <div className="bg-slate-50">
      {data.columns.map((col: any, i: number) => (
        <div
          key={i}
          className="flex items-center justify-between px-4 py-2 border-b border-slate-200 last:border-b-0 hover:bg-slate-100 transition-colors"
        >
          <div className="flex items-center gap-2 flex-1">
            {col.isPK && (
              <svg className="w-3.5 h-3.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
            )}
            {col.isFK && !col.isPK && (
              <svg className="w-3.5 h-3.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
              </svg>
            )}
            {!col.isPK && !col.isFK && <div className="w-3.5" />}
            <span className="font-medium text-slate-800 text-xs">{col.name}</span>
          </div>
          <span className="text-xs text-slate-500 font-mono">{col.type}</span>
        </div>
      ))}
    </div>

    <Handle type="target" position={Position.Top} className="w-3 h-3 bg-blue-500 border-2 border-white" />
    <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-blue-500 border-2 border-white" />
  </div>
);

export default function DatabaseDiagram() {
  const nodes = mockSchema.tables.map((table, i) => ({
    id: table.name,
    type: "tableNode",
    position: { x: i * 280, y: i % 2 === 0 ? 100 : 300 },
    data: table,
  }));

  const edges = mockSchema.relations.map((rel, i) => ({
    id: `e${i}`,
    source: rel.from.split(".")[0],
    target: rel.to.split(".")[0],
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2 },
    type: "smoothstep",
  }));

  return (
    <div className="h-full w-full bg-slate-100">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={{ tableNode: TableNode }}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#cbd5e1" gap={20} size={1} />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  );
}