export const mockSchema = {
    tables: [
        {
            name: "usuario",
            columns: [
                { name: "id", type: "INT", isPK: true },
                { name: "nombre", type: "VARCHAR(100)" },
                { name: "apellidos", type: "VARCHAR(100)" },
            ],
        },
        {
            name: "pedido",
            columns: [
                { name: "id", type: "INT", isPK: true },
                { name: "usuario_id", type: "INT", isFK: true },
                { name: "fecha", type: "DATETIME" },
                { name: "total", type: "DECIMAL(10,2)" },
            ],
        },
        {
            name: "producto",
            columns: [
                { name: "id", type: "INT", isPK: true },
                { name: "nombre", type: "VARCHAR(200)" },
                { name: "precio", type: "DECIMAL(10,2)" },
            ],
        },
        {
            name: "pedido_producto",
            columns: [
                { name: "pedido_id", type: "INT", isFK: true, isPK: true },
                { name: "producto_id", type: "INT", isFK: true, isPK: true },
                { name: "cantidad", type: "INT" },
            ],
        },
    ],
    relations: [
        { from: "pedido.usuario_id", to: "usuario.id" },
        { from: "pedido_producto.pedido_id", to: "pedido.id" },
        { from: "pedido_producto.producto_id", to: "producto.id" },
    ],
};
