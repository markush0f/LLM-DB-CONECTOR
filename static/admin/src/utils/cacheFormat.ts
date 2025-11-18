export function formatExpiry(seconds: number): string {
    if (seconds <= 0) return "Expired";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}m ${secs}s`;
}

export function getExpiryColor(seconds: number): string {
    if (seconds <= 0) return "text-red-600";
    if (seconds < 60) return "text-orange-500";
    if (seconds < 180) return "text-yellow-500";
    return "text-green-600";
}
