import Database from '@tauri-apps/plugin-sql';

export interface DbConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

interface CountResult {
  count: number;
}

interface TestResult {
  query: string;
  name: string;
  count: number;
}

export const defaultConfig: DbConfig = {
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '',
  database: 'zoo_db'
};

export async function testDatabaseConnection(db: Database) {
  const tests = [
    { query: 'SELECT COUNT(*) as count FROM zvirata', name: 'Zvířata' },
    { query: 'SELECT COUNT(*) as count FROM druhy', name: 'Druhy' }    
  ];

  const results: TestResult[] = [];
  for (const test of tests) {
    const [result] = await db.select<CountResult[]>(test.query);
    if (result) {
      results.push({
        ...test,
        count: result.count
      });
    }
  }
  
  return results;
}

export async function initDb(config: DbConfig = defaultConfig) {
  try {
    const connectionString = `mysql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;
    const db = await Database.load(connectionString);
    await testDatabaseConnection(db);
    return db;
  } catch (err) {
    console.error('Database connection error:', err);
    throw err;
  }
}