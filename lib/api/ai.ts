export interface StreamAiOptions {
  feature: "compose" | "rephrase" | "summarise";
  context?: string;
  prompt?: string;
  tone?: string;
  postId?: string;
  signal?: AbortSignal;
  onToken: (token: string) => void;
  onComplete?: () => void;
  onError?: (error: Error, isRateLimit?: boolean) => void;
}

export async function streamAiCompletion({
  feature,
  context = "",
  prompt,
  tone,
  postId,
  signal,
  onToken,
  onComplete,
  onError,
}: StreamAiOptions): Promise<void> {
  try {
    const res = await fetch("/api/ai/stream", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        feature,
        context,
        prompt,
        tone,
        postId,
      }),
      signal,
    });

    if (res.status === 429) {
      const errorJson = await res.json().catch(() => ({}));
      const message =
        errorJson.error?.message ||
        "You've reached your daily AI limit. Upgrade your plan.";
      onError?.(new Error(message), true);
      return;
    }

    if (!res.ok) {
      const errorText = await res.text().catch(() => "AI request failed");
      onError?.(new Error(errorText), false);
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) {
      onError?.(new Error("Response body is not readable"), false);
      return;
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const rawPayload = line.slice(5).trimStart();

        if (rawPayload.trim() === "[DONE]") {
          onComplete?.();
          return;
        }

        if (rawPayload.startsWith("[ERROR]")) {
          onError?.(new Error(rawPayload.slice(7).trim()), false);
          return;
        }

        try {
          const parsed = JSON.parse(rawPayload);
          if (typeof parsed.token === "string") {
            onToken(parsed.token);
            continue;
          }
        } catch {
          // If not JSON, use payload as-is
        }

        onToken(rawPayload);
      }
    }

    onComplete?.();
  } catch (error: any) {
    if (error.name === "AbortError" || signal?.aborted) {
      // Aborted by user; clean exit
      return;
    }
    onError?.(error instanceof Error ? error : new Error(String(error)), false);
  }
}
