const LINEAR_API = 'https://api.linear.app/graphql';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Bot-Secret');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const secret = req.headers['x-bot-secret'];
  if (!process.env.BOT_SHARED_SECRET || secret !== process.env.BOT_SHARED_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { projectId, targetDate } = req.body || {};
  if (!projectId || !targetDate) {
    return res.status(400).json({ error: 'projectId y targetDate son requeridos (targetDate formato YYYY-MM-DD)' });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(targetDate)) {
    return res.status(400).json({ error: 'targetDate debe tener formato YYYY-MM-DD' });
  }
  if (!process.env.LINEAR_API_KEY) {
    return res.status(500).json({ error: 'LINEAR_API_KEY no configurada en el servidor' });
  }

  try {
    const gqlRes = await fetch(LINEAR_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: process.env.LINEAR_API_KEY,
      },
      body: JSON.stringify({
        query: `mutation($id: String!, $input: ProjectUpdateInput!) {
          projectUpdate(id: $id, input: $input) {
            success
            project { id name targetDate }
          }
        }`,
        variables: { id: projectId, input: { targetDate } },
      }),
    });
    const data = await gqlRes.json();
    if (data.errors) {
      return res.status(502).json({ error: data.errors[0].message });
    }
    return res.json(data.data.projectUpdate);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
