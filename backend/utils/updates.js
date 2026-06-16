let clients = [];

const registerClient = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Send initial connection confirmation event
  res.write('data: ' + JSON.stringify({ event: 'connected' }) + '\n\n');

  clients.push(res);

  // Keep connection alive with a periodic ping every 30 seconds
  const pingInterval = setInterval(() => {
    res.write('data: ' + JSON.stringify({ event: 'ping' }) + '\n\n');
  }, 30000);

  req.on('close', () => {
    clearInterval(pingInterval);
    clients = clients.filter(c => c !== res);
  });
};

const broadcastUpdate = (event, data) => {
  const payload = JSON.stringify({ event, data });
  clients.forEach(client => {
    client.write(`data: ${payload}\n\n`);
  });
};

module.exports = {
  registerClient,
  broadcastUpdate
};
