"use client";
import React, { useState } from 'react';
import { Send } from 'lucide-react';

export default function Input() {
    const [value, setValue] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (value.trim()) {
            console.log('Enviado:', value);
            setValue('');
        }
    };

    return (
        <div className="w-full border-t border-gray-100 bg-slate-50 backdrop-blur-sm p-4">
            <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSubmit} className="relative">
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="w-full px-6 py-4 pr-14 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-400 rounded-2xl shadow-lg shadow-gray-200/50 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:shadow-xl focus:bg-white transition-all duration-300 text-base border border-gray-100/50"
                    />
                    <button
                        type="submit"
                        disabled={!value.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-orange-100 text-orange-600 rounded-xl hover:bg-orange-200 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}