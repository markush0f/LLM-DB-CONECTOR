import {
    Database,
    Server,
    User,
    Pencil,
    Trash2,
    PlugZap,
    HardDrive
} from "lucide-react";
import type { SavedConnection } from "../../types/DBConnection.types";

interface Props {
    connection: SavedConnection;
    onEdit: (id: number) => void;
    onDelete: (id: number) => void;
    onTest: (id: number) => void;
}

export default function ConnectionItem({ connection, onEdit, onDelete, onTest }: Props) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">

            {/* HEADER */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">

                    {/* Icon */}
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Database className="w-6 h-6 text-gray-600" />
                    </div>

                    {/* Title + status */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {connection.name}
                            </h3>

                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                Disconnected
                            </span>
                        </div>

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">

                            {/* Host */}
                            <div className="flex items-center gap-2">
                                <Server className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-500">Host:</span>
                                <span className="truncate">
                                    {connection.host}:{connection.port}
                                </span>
                            </div>

                            {/* Database */}
                            <div className="flex items-center gap-2">
                                <HardDrive className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-500">Database:</span>
                                <span>{connection.database}</span>
                            </div>

                            {/* User */}
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-gray-500" />
                                <span className="font-medium text-gray-500">User:</span>
                                <span className="truncate">{connection.user}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">

                {/* Created at */}
                {/* <div className="text-xs text-gray-500">
                    {connection. && (
                        <span>
                            Created: {new Date(connection.created_at).toLocaleString()}
                        </span>
                    )}
                </div> */}

                {/* Actions */}
                <div className="flex items-center gap-2">

                    <button
                        onClick={() => onTest(connection.id)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1"
                    >
                        <PlugZap className="w-4 h-4" />
                        Test
                    </button>

                    <button
                        onClick={() => onEdit(connection.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <Pencil className="w-5 h-5" />
                    </button>

                    <button
                        onClick={() => onDelete(connection.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
