"use client";
import React from "react";
import { motion } from "framer-motion";
import TableHeader from "./TableHeader";
import TableColumnList from "./TableColumnList";


interface TableNodeProps {
  data: any;
  prevSchema?: any;
}

/**
 * TableNode renders a table node with header and animated columns.
 */
export default function TableNode({ data, prevSchema }: TableNodeProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-slate-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 min-w-[260px]"
    >
      <TableHeader name={data.name} />
      <TableColumnList
        tableName={data.name}
        columns={data.columns}
        prevSchema={prevSchema}
      />
      <div className="h-0.5 bg-gradient-to-r from-orange-400 to-orange-500" />
    </motion.div>
  );
}
