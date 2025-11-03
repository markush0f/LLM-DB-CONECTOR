import Input from "./Input";

export default function Chat() {
    return (
        <div className="flex flex-col h-screen bg-white">
            {/* Área central scrollable */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-4">
                {/* Aquí luego irán los mensajes */}
                <div className="text-gray-400 text-center mt-10">
                    Escribe una instrucción para comenzar 💬
                </div>
            </div>

            {/* Input fijo abajo */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100">
                <Input />
            </div>
        </div>
    );
}
