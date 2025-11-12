const API_BASE = "http://localhost:8000/llmsql";

export async function generateSQL(userInput: string) {
    const res = await fetch(`${API_BASE}/generate_sql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: userInput }),
    });

    if (!res.ok) throw new Error(`Error generating SQL: ${res.statusText}`);
    return res.json();
}

export async function executeSQL(sql: string) {
    const res = await fetch(`${API_BASE}/execute_sql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
    });

    if (!res.ok) throw new Error(`Error executing SQL: ${res.statusText}`);
    return res.json();
}