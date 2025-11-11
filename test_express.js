const express = require('express');
const app = express();

app.get('/', (req, res) => res.json({ message: 'Express is working!' }));

const listEndpoints = require('express-list-endpoints');

app.listen(5000, () => {
  console.log("🧱 App stack:", app._router?.stack?.map(r => r.name || r.route?.path));
  console.log("📍 Endpoints:", listEndpoints(app));
  console.log("✅ Express test server is running!");
});
