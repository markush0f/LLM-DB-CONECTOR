import type { UserMessage, AssistantMessage, Conversation } from "../../types/messages.types";

// Mock data
export const mockUserMessages: UserMessage[] = [
  {
    id: 1,
    content: "Can you help me create a SQL query to get all users who registered in the last 30 days?",
    model_name: "gpt-4",
    created_at: "2025-11-18 10:30:22"
  },
  {
    id: 2,
    content: "Show me the database schema for the orders table",
    model_name: "gpt-4",
    created_at: "2025-11-18 11:15:45"
  },
  {
    id: 3,
    content: "How can I optimize this query: SELECT * FROM products WHERE price > 100",
    model_name: "claude-3-opus",
    created_at: "2025-11-18 12:05:10"
  },
  {
    id: 4,
    content: "Generate a report of top 10 customers by total purchases",
    model_name: "gpt-4",
    created_at: "2025-11-18 13:20:33"
  },
  {
    id: 5,
    content: "What's the difference between INNER JOIN and LEFT JOIN?",
    model_name: "claude-3-opus",
    created_at: "2025-11-18 14:45:18"
  }
];

export const mockAssistantMessages: AssistantMessage[] = [
  {
    id: 1,
    content: "Here's a SQL query to get all users who registered in the last 30 days:\n\n```sql\nSELECT * FROM users\nWHERE created_at >= NOW() - INTERVAL '30 days'\nORDER BY created_at DESC;\n```\n\nThis query uses the `INTERVAL` keyword to subtract 30 days from the current date and filters users whose `created_at` timestamp is greater than or equal to that date.",
    model_name: "gpt-4",
    role: "assistant",
    user_message_id: 1,
    created_at: "2025-11-18 10:30:25"
  },
  {
    id: 2,
    content: "Based on the cached schema, here's the structure of the orders table:\n\n**Table: orders**\n- id (integer, primary key)\n- user_id (integer, foreign key → users.id)\n- total_amount (decimal)\n- status (varchar): pending, completed, cancelled\n- created_at (timestamp)\n- updated_at (timestamp)\n\nThe table has indexes on `user_id` and `created_at` for better query performance.",
    model_name: "gpt-4",
    role: "assistant",
    user_message_id: 2,
    created_at: "2025-11-18 11:15:48"
  },
  {
    id: 3,
    content: "Here are several ways to optimize your query:\n\n1. **Avoid SELECT * ** - Only select the columns you need:\n```sql\nSELECT id, name, price FROM products WHERE price > 100;\n```\n\n2. **Add an index on the price column** if you frequently filter by it:\n```sql\nCREATE INDEX idx_products_price ON products(price);\n```\n\n3. **Use LIMIT if you don't need all results**:\n```sql\nSELECT id, name, price FROM products \nWHERE price > 100 \nLIMIT 100;\n```\n\nThese optimizations will significantly improve query performance, especially on large tables.",
    model_name: "claude-3-opus",
    role: "assistant",
    user_message_id: 3,
    created_at: "2025-11-18 12:05:13"
  },
  {
    id: 4,
    content: "Here's a SQL query to generate a report of the top 10 customers by total purchases:\n\n```sql\nSELECT \n    u.id,\n    u.name,\n    u.email,\n    COUNT(o.id) as total_orders,\n    SUM(o.total_amount) as total_spent\nFROM users u\nINNER JOIN orders o ON u.id = o.user_id\nWHERE o.status = 'completed'\nGROUP BY u.id, u.name, u.email\nORDER BY total_spent DESC\nLIMIT 10;\n```\n\nThis query joins the users and orders tables, calculates the total amount spent by each customer, and returns the top 10.",
    model_name: "gpt-4",
    role: "assistant",
    user_message_id: 4,
    created_at: "2025-11-18 13:20:36"
  },
  {
    id: 5,
    content: "Great question! Here's the difference:\n\n**INNER JOIN:**\n- Returns only rows where there's a match in BOTH tables\n- If a row in the left table has no matching row in the right table, it's excluded\n\n**LEFT JOIN (or LEFT OUTER JOIN):**\n- Returns ALL rows from the left table\n- For rows without a match in the right table, NULL values are returned for right table columns\n\n**Example:**\n```sql\n-- INNER JOIN: Only returns users who have orders\nSELECT u.name, o.id FROM users u\nINNER JOIN orders o ON u.id = o.user_id;\n\n-- LEFT JOIN: Returns all users, even those without orders\nSELECT u.name, o.id FROM users u\nLEFT JOIN orders o ON u.id = o.user_id;\n```\n\nUse INNER JOIN when you need matched data only, and LEFT JOIN when you want to keep all rows from the first table.",
    model_name: "claude-3-opus",
    role: "assistant",
    user_message_id: 5,
    created_at: "2025-11-18 14:45:21"
  }
];

export const getConversations = async (): Promise<Conversation[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const conversations = mockUserMessages.map(userMsg => ({
        userMessage: userMsg,
        assistantMessages: mockAssistantMessages.filter(
          assistantMsg => assistantMsg.user_message_id === userMsg.id
        )
      }));
      resolve(conversations);
    }, 300);
  });
};