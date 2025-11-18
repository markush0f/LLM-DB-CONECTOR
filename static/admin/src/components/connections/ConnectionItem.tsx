import type { DBConnection } from "../../types/DBConnection.types";

interface Props {
    connection: DBConnection;
    onEdit: (id: string) => void;
    onDelete: (id: string) => void;
    onTest: (id: string) => void;
}

const getStatusColor = (status: DBConnection['status']) => {
    switch (status) {
        case 'connected':
            return 'bg-green-100 text-green-700';
        case 'disconnected':
            return 'bg-gray-100 text-gray-700';
        case 'error':
            return 'bg-red-100 text-red-700';
    }
};

const getStatusText = (status: DBConnection['status']) => {
    switch (status) {
        case 'connected':
            return 'Connected';
        case 'disconnected':
            return 'Disconnected';
        case 'error':
            return 'Error';
    }
};

const getDBIcon = (type: DBConnection['type']) => {
    const iconClass = "w-6 h-6 text-gray-600";

    switch (type) {
        case 'postgresql':
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
            );
        case 'mysql':
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                </svg>
            );
        case 'mongodb':
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
            );
        case 'sqlite':
            return (
                <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
            );
    }
};

export default function ConnectionItem({ connection, onEdit, onDelete, onTest }: Props) {
    return (
        <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-300 hover:shadow-lg transition-all duration-200">
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getDBIcon(connection.type)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{connection.name}</h3>
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(connection.status)}`}>
                                {getStatusText(connection.status)}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-500">Type:</span>
                                <span className="uppercase">{connection.type}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-500">Database:</span>
                                <span className="truncate">{connection.database}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-500">Host:</span>
                                <span className="truncate">{connection.host}:{connection.port}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-500">User:</span>
                                <span className="truncate">{connection.username}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                    {connection.lastConnected && (
                        <span>Last connected: {connection.lastConnected}</span>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onTest(connection.id)}
                        className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    >
                        Test Connection
                    </button>
                    <button
                        onClick={() => onEdit(connection.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button
                        onClick={() => onDelete(connection.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}