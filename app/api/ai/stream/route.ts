import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL, COOKIE_NAMES } from "@/lib/constants";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    const backendRes = await fetch(`${API_BASE_URL}/api/v1/ai/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}` } : {}),
      },
      body: JSON.stringify(body),
      signal: req.signal,
    });

    if (backendRes.status === 429) {
      const data = await backendRes.json().catch(() => ({}));
      return NextResponse.json(
        data || {
          success: false,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "You've reached your daily AI limit. Upgrade your plan.",
          },
        },
        { status: 429 }
      );
    }

    if (!backendRes.ok) {
      const errorText = await backendRes.text().catch(() => "Failed to fetch stream");
      return new NextResponse(errorText, { status: backendRes.status });
    }

    // Pipe SSE stream directly to client
    return new NextResponse(backendRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error: any) {
    if (error.name === "AbortError") {
      return new NextResponse("Stream aborted", { status: 499 });
    }
    console.error("AI stream proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
