export async function POST(request: Request) {
  const body = await request.json();

  const payload = {
    ...body,
    model: "ilmu-glm-5.1",
  };

  console.log(`[Proxy] Sending to ILMU API, model: ${payload.model}, messages: ${payload.messages?.length}, total chars: ${JSON.stringify(payload).length}`);

  try {
    const response = await fetch('https://api.ilmu.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.NEXT_PUBLIC_ANTHROPIC_AUTH_TOKEN || ''}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(`[Proxy] ILMU API error ${response.status}:`, JSON.stringify(data).slice(0, 500));
      return Response.json({ error: data }, { status: response.status });
    }

    const content = data.choices?.[0]?.message?.content;
    console.log(`[Proxy] Success, response length: ${content?.length || 0} chars`);

    return Response.json(data);
  } catch (error) {
    console.error('[Proxy] Fetch failed:', error);
    return Response.json({ error: 'Proxy request failed' }, { status: 500 });
  }
}
