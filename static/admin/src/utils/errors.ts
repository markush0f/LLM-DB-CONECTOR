
export async function handleAPIError(res: Response) {
  if (res.ok) return;

  let detail = "Unknown error";

  try {
    const data = await res.json();
    detail = data.detail || detail;
  } catch (_) {}

  throw new Error(detail);
}
