const BACKEND_URL =
  process.env.BACKEND_URL || 'http://167.99.47.153:8000';

export default async function handler(req, res) {
  const segments = req.query.path;
  const pathStr = Array.isArray(segments)
    ? segments.join('/')
    : segments || '';
  const queryStart = req.url?.indexOf('?') ?? -1;
  const query = queryStart >= 0 ? req.url.slice(queryStart) : '';
  const target = `${BACKEND_URL}/api/${pathStr}${query}`;

  try {
    const headers = {};
    if (req.headers['content-type']) {
      headers['Content-Type'] = req.headers['content-type'];
    }

    const init = {
      method: req.method,
      headers,
    };

    if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
      init.body =
        typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    }

    const response = await fetch(target, init);
    const body = await response.arrayBuffer();

    res.status(response.status);
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    }
    res.send(Buffer.from(body));
  } catch (error) {
    res.status(502).json({
      error: 'Backend unreachable',
      detail: error.message,
    });
  }
}
