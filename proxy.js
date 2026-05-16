import { NextResponse } from "next/server";

function isBlockedPage(pathname) {
  return pathname === "/social-account-analyzer" || pathname.startsWith("/social-account-analyzer/");
}

function isBlockedApi(pathname) {
  return pathname === "/api/social-account-analyzer" || pathname.startsWith("/api/social-account-analyzer/");
}

export function proxy(request) {
  const { pathname } = request.nextUrl;

  // Block API access while the tool is in Upcoming state.
  if (isBlockedApi(pathname)) {
    return NextResponse.json(
      { error: "This tool is currently upcoming and not publicly accessible yet." },
      { status: 403 }
    );
  }

  // Block direct page access and send users back to homepage.
  if (isBlockedPage(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    redirectUrl.searchParams.set("focus", "tools");
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/social-account-analyzer/:path*", "/api/social-account-analyzer/:path*"],
};
