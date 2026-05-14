require('dotenv').config();
const app = require('./app');
const { connectDB, pool } = require('./db/pool');
const { seedDefaultCategories } = require('./db/seeds/defaultCategories');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  await seedDefaultCategories(pool);
  app.listen(PORT, () => {
    console.log(`[server] http://localhost:${PORT} 에서 실행 중`);
  });
}

start();
