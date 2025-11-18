import { useState } from "react";
import type { DBConnectionForm, DBConnection } from "../../types/DBConnection.types";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (connection: DBConnectionForm) => void;
    editConnection?: DBConnection | null;
}

export default function ConnectionFormModal({ isOpen, onClose, onSave, editConnection }: Props) {
    const [formData, setFormData] = useState<DBConnectionForm>({
        name: editConnection?.name || "",
        type: editConnection?.type || "postgresql",
        host: editConnection?.host || "",
        port: editConnection?.port || 5432,
        database: editConnection?.database || "",
        username: editConnection?.username || "",
        password: ""
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    const handleTypeChange = (type: DBConnectionForm['type']) => {
        const defaultPorts = {
            postgresql: 5432,
            mysql: 3306,
            mongodb: 27017,
            sqlite: 0
        };

        setFormData({
            ...formData,
            type,
            port: defaultPorts[type]
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        {editConnection ? 'Edit Connection' : 'New Connection'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-4">
                        {/* Connection Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Connection Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Production Database"
                            />
                        </div>

                        {/* Database Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Database Type *
                            </label>
                            <div className="grid grid-cols-4 gap-3">
                                {(['postgresql', 'mysql', 'mongodb', 'sqlite'] as const).map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleTypeChange(type)}
                                        className={`px-4 py-3 border-2 rounded-lg font-medium transition-all ${formData.type === type
                                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                                            }`}
                                    >
                                        {type.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Host and Port */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Host *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.host}
                                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                                    onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Database Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Database Name *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.database}
                                onChange={(e) => setFormData({ ...formData, database: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="my_database"
                            />
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Username *
                            </label>
                            <input
                                type="text"
                                required
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="db_user"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Password *
                            </label>
                            <input
                                type="password"
                                required={!editConnection}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder={editConnection ? "Leave empty to keep current password" : "••••••••"}
                            />
                            {editConnection && (
                                <p className="text-xs text-gray-500 mt-1">
                                    Leave empty to keep the current password
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            {editConnection ? 'Update Connection' : 'Create Connection'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}