export default async (req) => {
    if (req.method !== 'GET') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const response = await fetch('https://note.com/lifeoraclejp/rss');
        const xml = await response.text();

        return new Response(xml, {
            status: 200,
            headers: { 'Content-Type': 'application/xml', 'Cache-Control': 's-maxage=3600' },
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};

export const config = { path: '/api/rss' };
