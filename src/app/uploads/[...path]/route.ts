import { promises as fs } from "node:fs";
import path from "node:path";
import { CONTENT_TYPE_BY_EXTENSION, resolveUploadPath } from "@/lib/uploads";

/**
 * Serves admin-uploaded images from data/uploads. They cannot live in public/
 * because `next build` snapshots that directory — files written afterwards are
 * never served by `next start`.
 */
export async function GET(
  _request: Request,
  { params }: RouteContext<"/uploads/[...path]">,
) {
  const { path: segments } = await params;

  const target = resolveUploadPath(segments);
  if (!target) return new Response("Not found", { status: 404 });

  let file: Buffer;
  let stat: Awaited<ReturnType<typeof fs.stat>>;
  try {
    [file, stat] = await Promise.all([fs.readFile(target), fs.stat(target)]);
  } catch {
    return new Response("Not found", { status: 404 });
  }

  const contentType =
    CONTENT_TYPE_BY_EXTENSION[path.extname(target)] ?? "application/octet-stream";

  return new Response(new Uint8Array(file), {
    headers: {
      "Content-Type": contentType,
      "Content-Length": String(stat.size),
      // Filenames carry a random suffix, so a given URL never changes content.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
