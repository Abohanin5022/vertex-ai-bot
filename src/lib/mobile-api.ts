type JsonBody = Record<string, unknown> | unknown[];

export async function postJson<TResponse>(
  url: string,
  body: JsonBody,
  init?: RequestInit
) {
  const response = await fetch(url, {
    ...init,
    method: init?.method || "POST",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    body: JSON.stringify(body),
  });

  const data = (await response.json().catch(() => null)) as TResponse | null;

  if (!response.ok) {
    const message =
      data && typeof data === "object" && "error" in data
        ? String((data as { error?: unknown }).error)
        : "تعذر تنفيذ العملية";

    throw new Error(message);
  }

  return data as TResponse;
}

export async function getJson<TResponse>(url: string, init?: RequestInit) {
  const response = await fetch(url, {
    ...init,
    method: "GET",
  });

  const data = (await response.json().catch(() => null)) as TResponse | null;

  if (!response.ok) {
    throw new Error("تعذر تحميل البيانات");
  }

  return data as TResponse;
}
