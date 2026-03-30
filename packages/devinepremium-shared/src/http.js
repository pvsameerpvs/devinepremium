function resolveApiBaseUrl(value, fallbackBaseUrl = "http://localhost:4000") {
  return String(value || fallbackBaseUrl).replace(/\/$/, "");
}

async function apiRequest(path, options = {}) {
  const {
    token,
    headers,
    body,
    baseUrl,
    fallbackBaseUrl,
    ...rest
  } = options;

  const response = await fetch(
    `${resolveApiBaseUrl(baseUrl, fallbackBaseUrl)}${path}`,
    {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body,
    },
  );

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String(payload.message)
        : `Request failed with ${response.status}`;

    throw new Error(message);
  }

  return payload;
}

module.exports = {
  resolveApiBaseUrl,
  apiRequest,
};
