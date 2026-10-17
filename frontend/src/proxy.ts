import { isServerActionRequest } from "@lib/proxy/serverAction";
import { NextResponse } from "next/server";

import type { NextRequest } from "next/server";

/**
 * Only here to turn away Server Action probes (BMK-76). This front has no Server Actions, so every
 * request carrying a `Next-Action` header is unwanted. The matcher runs it on those requests and on
 * nothing else, so pages and assets never pass through it.
 */
const proxy = (request: NextRequest): NextResponse =>
  isServerActionRequest(request.headers) ? new NextResponse(null, { status: 400 }) : NextResponse.next();

export default proxy;

export const config = {
  matcher: [{ source: "/((?!_next/static|_next/image).*)", has: [{ type: "header", key: "next-action" }] }],
};
