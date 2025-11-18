import { useState, useEffect } from "react";

import { X } from "lucide-react";
import type { PGDBConnector, SavedConnection } from "../../types/DBConnection.types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (connection: PGDBConnector) => void;
    editConnection?: SavedConnection | null;
}

export default function ConnectionFormModal({
    isOpen,
    onClose,
    onSave,
    editConnection
}: Props) {

    const [formData, setFormData] = useState<PGDBConnector>({
        name: "",
        host: "",
        port: 5432,
        user: "",
        database: "",
    });

    // Load edit data when modal opens
    useEffect(() => {
        if (editConnection) {
            setFormData({
                name: editConnection.name,
                host: editConnection.host,
                port: editConnection.port,
                user: editConnection.user,
                database: editConnection.database
            });
        } else {
            setFormData({
                name: "",
                host: "",
                port: 5432,
                user: "",
                database: "",
            });
        }
    }, [editConnection]);


    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };


    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editConnection ? "Edit Connection" : "New Connection"}
                    </h2>

                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Connection Name *
                        </label>
                        <input
                            required
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Production DB"
                        />
                    </div>

                    {/* Host + Port */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Host *
                            </label>
                            <input
                                required
                                value={formData.host}
                                onChange={e => setFormData({ ...formData, host: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="localhost"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Port *
                            </label>
                            <input
                                type="number"
                                required
                                value={formData.port}
                                onChange={e =>
                                    setFormData({ ...formData, port: parseInt(e.target.value) })
                                }
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Database */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Database Name *
                        </label>
                        <input
                            required
                            value={formData.database}
                            onChange={e =>
                                setFormData({ ...formData, database: e.target.value })
                            }
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="my_database"
                        />
                    </div>

                    {/* User */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            User *
                        </label>
                        <input
                            required
                            value={formData.user}
                            onChange={e => setFormData({ ...formData, user: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="db_user"
                        />
                    </div>

                    {/* Footer buttons */}
                    <div className="flex items-center gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {editConnection ? "Update Connection" : "Create Connection"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
