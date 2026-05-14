const DEFAULT_CATEGORIES = [
  { name: '업무', is_default: true },
  { name: '개인', is_default: true },
  { name: '기타', is_default: true },
];

async function seedDefaultCategories(pool) {
  for (const category of DEFAULT_CATEGORIES) {
    await pool.query(
      `INSERT INTO categories (name, is_default)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [category.name, category.is_default],
    );
  }
  console.log('[seed] 기본 카테고리 시드 완료');
}

module.exports = { seedDefaultCategories };
