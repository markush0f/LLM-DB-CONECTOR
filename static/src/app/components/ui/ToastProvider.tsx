"use client";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
    return (
        <ToastContainer
            position="bottom-right"
            autoClose={2500}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            pauseOnHover
            draggable
            theme="light"
            toastStyle={{
                backgroundColor: "#f9fafb",
                color: "#111827", // dark text
                borderRadius: "10px",
                border: "1px solid #e5e7eb",
                boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
                fontSize: "0.875rem",
                fontFamily: "Inter, sans-serif",
            }}
        />
    );
}
