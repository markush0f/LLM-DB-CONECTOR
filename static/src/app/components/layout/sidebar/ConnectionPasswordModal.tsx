"use client";
import React, { useState } from "react";
import { Lock } from "lucide-react";

interface Props {
    connectionName: string;
    onSubmit: (password: string) => void;
    onCancel: () => void;
}

export default function ConnectionPasswordModal({ connectionName, onSubmit, onCancel }: Props) {
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password.trim()) return;
        setLoading(true);
        await onSubmit(password);
        setLoading(false);
        setPassword("");
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-80 p-5">
                <div className="flex items-center gap-2 mb-4">
                    <Lock className="text-orange-500" size={20} />
                    <h2 className="text-lg font-semibold text-gray-800">Conexión requerida</h2>
                </div>

                <p className="text-sm text-gray-500 mb-3">
                    Introduce la contraseña para conectar con <span className="font-medium text-gray-700">{connectionName}</span>.
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                    />

                    <div className="flex justify-end gap-2 mt-4">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-100"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-3 py-1.5 text-sm rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50"
                        >
                            {loading ? "Conectando..." : "Conectar"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
