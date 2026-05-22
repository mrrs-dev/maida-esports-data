interface Env { ADMIN_CODE: string; }

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const code = request.headers.get("X-Admin-Code");
  const ok = !!code && code === env.ADMIN_CODE;
  return new Response(JSON.stringify({ ok }), {
    status: ok ? 200 : 401,
    headers: { "content-type": "application/json" }
  });
};
