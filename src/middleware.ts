import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// Middleware function
export async function middleware(request: NextRequest) {
  try {
    const allCookies = await cookies();
    console.log(request.headers.get('cookie'))
    console.log(request.headers)
    console.log(request.cookies)
    // Tạo header mới và thêm cookie
    const headers: Record<string, string> = {};
    allCookies.getAll().forEach((cookie) => {
      headers["Cookie"] = `${cookie.name}=${cookie.value}`;
    });

    console.log("Headers with cookies:", headers);

    // Gửi yêu cầu refresh token
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
      {
        method: "POST",
        headers,
      }
    );

    if (res.ok) {
      console.log("Token refreshed successfully.");
      const response = NextResponse.next();

      // Gắn cookie mới nếu API trả về
      const setCookieHeader = res.headers.get("set-cookie");
      if (setCookieHeader) {
        response.headers.set("set-cookie", setCookieHeader);
      }

      return response;
    } else {
      console.error("Failed to refresh token. Redirecting to /auth.");
      return NextResponse.redirect(new URL("/auth", request.url));
    }
  } catch (err) {
    console.error("Error in middleware:", err);
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

// Matching paths
export const config = {
  matcher: ["/"],
};
