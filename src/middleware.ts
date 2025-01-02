import axios from "@/lib/axiosInstance";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { cookies } from "next/headers";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  try {
    const allCookies = await cookies();
    

    // Tạo một đối tượng headers mới và thêm cookies vào đó
    const headers: Record<string, string> = {};
    allCookies.getAll().forEach((cookie) => {
      headers[`Cookie`] = `${cookie.name}=${cookie.value}`;
    });

    // Gửi yêu cầu refresh token và gắn cookies vào headers
    const res = await axios.post("/auth/refresh-token", {}, { headers });
    console.log(res.data,"handle datat ");
    // Giả sử API trả về một cookie mới, chúng ta sẽ gán cookie này vào response
    const response = NextResponse.next();
    // return NextResponse.redirect(new URL("/", request.url));
  
    return response;

  } catch (err) {
    console.log("Error in middleware:", err);
    return NextResponse.redirect(new URL("/auth", request.url));
  }
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/"],
};
