import { createServer } from "node:http";
import { spawn } from "node:child_process";

const users = new Map();
const getUser = (id) => {
  if (!users.has(id)) users.set(id, { id, email: "reader@example.invalid", aud: "authenticated", role: "authenticated", app_metadata: {}, user_metadata: {}, created_at: "2026-10-16T00:00:00Z" });
  return users.get(id);
};
const server = createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json");
  const token = request.headers.authorization?.replace("Bearer ", "");
  let id;
  try { id = JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString()).sub; } catch {}
  if (request.url?.startsWith("/auth/v1/user") && id) {
    const user = getUser(id);
    if (request.method === "PUT") {
      let body = "";
      for await (const chunk of request) body += chunk;
      user.user_metadata = { ...user.user_metadata, ...JSON.parse(body).data };
    }
    response.end(JSON.stringify(user));
  } else if (request.url?.startsWith("/rest/v1/books")) {
    response.end(JSON.stringify([{ id: "00000000-0000-4000-8000-000000000099", user_id: id, title: "The Original Title", author: "Original Author", status: "reading", total_pages: 300, current_page: 12, current_section: "Chapter One", note: "Original note", created_at: "2026-10-16T00:00:00Z", updated_at: "2026-10-16T00:00:00Z" }]));
  } else {
    response.statusCode = 401;
    response.end(JSON.stringify({ message: "Test session missing" }));
  }
});
server.listen(3211, "127.0.0.1");
const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--port", "3210"], {
  stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3211", NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key" },
});
const stop = () => { child.kill(); server.close(); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
child.on("exit", () => { server.close(); process.exitCode = 0; });
