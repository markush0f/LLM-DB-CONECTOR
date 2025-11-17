"use client";
import { toast } from "react-toastify";
import { CheckCircle, XCircle, Info } from "lucide-react";

/** ✅ Success notification */
export function notifySuccess(message: string) {
    toast.success(message, {
        icon: <CheckCircle size={18} className="text-green-600" />,
        autoClose: 2500,
        style: {
            borderLeft: "4px solid #16a34a",
            backgroundColor: "#f0fdf4",
            color: "#166534",
            borderRadius: "8px",
            fontFamily: "Inter, sans-serif",
        },
    });
}

/** ❌ Error notification */
export function notifyError(message: string) {
    toast.error(message, {
        icon: <XCircle size={18} className="text-red-600" />,
        autoClose: 3000,
        style: {
            borderLeft: "4px solid #dc2626",
            backgroundColor: "#fef2f2",
            color: "#991b1b",
            borderRadius: "8px",
            fontFamily: "Inter, sans-serif",
        },
    });
}

/** ℹ️ Info notification */
export function notifyInfo(message: string) {
    toast.info(message, {
        icon: <Info size={18} className="text-blue-600" />,
        autoClose: 3000,
        style: {
            borderLeft: "4px solid #3b82f6",
            backgroundColor: "#eff6ff",
            color: "#1e3a8a",
            borderRadius: "8px",
            fontFamily: "Inter, sans-serif",
        },
    });
}
