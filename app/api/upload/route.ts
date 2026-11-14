import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { API_BASE_URL, COOKIE_NAMES } from "@/lib/constants";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const oldUrl = formData.get("oldUrl") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: "Cover image must not exceed 2MB." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    const backendFormData = new FormData();
    backendFormData.append("file", file);
    if (oldUrl) {
      backendFormData.append("oldUrl", oldUrl);
    }

    const res = await fetch(`${API_BASE_URL}/api/v1/upload`, {
      method: "POST",
      headers: {
        ...(token ? { Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}` } : {}),
      },
      body: backendFormData,
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error?.message || data.message || "Failed to upload cover image.",
        },
        { status: res.status }
      );
    }

    // Return uploaded Cloudinary URL
    const uploadedUrl = data.data?.url || data.url;
    return NextResponse.json({
      success: true,
      url: uploadedUrl,
      data: { url: uploadedUrl },
    });
  } catch (error) {
    console.error("Upload proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upload image." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const url = body.url;

    if (!url) {
      return NextResponse.json(
        { success: false, error: "Image URL is required." },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAMES.SESSION_TOKEN)?.value;

    const res = await fetch(`${API_BASE_URL}/api/v1/upload`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Cookie: `${COOKIE_NAMES.SESSION_TOKEN}=${token}` } : {}),
      },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        {
          success: false,
          error: data.error?.message || data.message || "Failed to delete image.",
        },
        { status: res.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data.data,
    });
  } catch (error) {
    console.error("Delete proxy error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete image." },
      { status: 500 }
    );
  }
}
