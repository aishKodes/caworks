import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

const allowedPaths = ["/", "/pricing", "/blog"];
const blockedPrefixes = ["/api", "/admin", "/dashboard", "/login", "/signup", "/start", "/upload-documents", "/track-status"];

function isPublicRevalidationPath(path: string) {
  return path.startsWith("/") && !path.startsWith("//") && !blockedPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export async function POST(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get("secret") || request.headers.get("x-revalidate-secret");
  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ ok: false, message: "Invalid revalidation secret." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const hasExplicitPaths = Array.isArray(body.paths);
  const paths = hasExplicitPaths ? body.paths : allowedPaths;
  const cleanPaths = paths
    .filter((path: unknown): path is string => typeof path === "string" && isPublicRevalidationPath(path))
    .slice(0, 50);

  const pathsToRevalidate = cleanPaths.length ? cleanPaths : hasExplicitPaths ? [] : allowedPaths;

  for (const path of pathsToRevalidate) {
    revalidatePath(path);
  }

  return NextResponse.json({ ok: true, revalidated: pathsToRevalidate });
}
