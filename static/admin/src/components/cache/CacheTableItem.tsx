import {
  Trash2,
  RefreshCw,
  Table2,
  Columns3,
  List,
  HardDrive
} from "lucide-react";
import type { NormalizedTable } from "../../types/cache.types";


export interface CacheTableItemProps extends NormalizedTable {
  onClear: () => void;
  onRefresh: () => void;
}

export default function CacheTableItem({
  table,
  columns,
  rows,
  size,
  cachedAt,
  onClear,
  onRefresh
}: CacheTableItemProps) {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">

        <div className="flex items-center gap-4 flex-1">

          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <Table2 className="w-5 h-5 text-gray-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-gray-900 mb-1">
              {table}
            </h4>

            <div className="flex items-center gap-6 text-sm text-gray-600">

              <span className="flex items-center gap-1.5">
                <Columns3 className="w-4 h-4" />
                <span className="font-medium">{columns}</span> columns
              </span>

              <span className="flex items-center gap-1.5">
                <List className="w-4 h-4" />
                <span className="font-medium">
                  {rows.toLocaleString()}
                </span> rows
              </span>

              <span className="flex items-center gap-1.5">
                <HardDrive className="w-4 h-4" />
                <span className="font-medium">{size}</span>
              </span>

            </div>
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500 mb-0.5">Cached</p>
            <p className="text-sm font-medium text-gray-700">{cachedAt}</p>
          </div>

        </div>

        <div className="flex items-center gap-2 ml-6">

          <button
            onClick={onRefresh}
            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <button
            onClick={onClear}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>

        </div>

      </div>
    </div>
  );
}
