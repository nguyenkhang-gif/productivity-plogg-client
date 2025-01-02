import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  try {
    // Lấy tất cả cookies từ request
    const cookieHeaders = request.headers.get("cookie") || "";

    // Tạo headers mới với cookie từ request
    const headers: Record<string, string> = {
      Cookie: cookieHeaders,
    };
    
    console.log("Set cookie header:", headers);
    // Gửi yêu cầu refresh token và gắn cookies vào headers
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers,
      }
    );

    if (res.ok) {
      console.log("Handle data successfully.");
      const response = NextResponse.next();

      // Nếu cần set cookie mới từ API response:
      const setCookieHeader = res.headers.get("set-cookie");
      if (setCookieHeader) {
        response.headers.set("set-cookie", setCookieHeader);
      }
      console.log("Set cookie header:", setCookieHeader);
      
      return response;
    }

    console.log("Failed to refresh token, redirecting...");
    return NextResponse.redirect(new URL("/auth", request.url));
  } catch (err) {
    console.error("Error in middleware:", err);
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

// Matching paths
export const config = {
  matcher: ["/"],
};
