async function main() {
  process.env.USE_MOCK_AI = 'true';
  const { startServer } = require('../server/index');

  const server = startServer(0);
  const port = await new Promise((resolve) => {
    server.on('listening', () => resolve(server.address().port));
  });

  const healthResponse = await fetch(`http://127.0.0.1:${port}/health`);
  const health = await healthResponse.json();

  const generateResponse = await fetch(`http://127.0.0.1:${port}/api/study/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notes: 'Photosynthesis happens in chloroplasts and uses sunlight, water, and carbon dioxide.'
    })
  });

  const generated = await generateResponse.json();

  server.close();

  console.log(
    JSON.stringify(
      {
        health,
        hasSummary: Boolean(generated?.payload?.summary)
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
