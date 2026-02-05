const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL 연결 풀 생성
// 개별 환경 변수를 우선 사용하고, 없으면 DATABASE_URL을 사용
const pool = new Pool(
  process.env.DB_USER || process.env.PGUSER
    ? {
        user: process.env.DB_USER || process.env.PGUSER,
        host: process.env.DB_HOST || process.env.PGHOST || 'localhost',
        database: process.env.DB_NAME || process.env.PGDATABASE || 'webportfolio',
        password: process.env.DB_PASSWORD || process.env.PGPASSWORD || '',
        port: parseInt(process.env.DB_PORT || process.env.PGPORT || '5432'),
        ssl: process.env.DB_HOST?.includes('railway') || process.env.DB_HOST?.includes('rlwy.net') 
          ? { rejectUnauthorized: false } 
          : false,
      }
    : process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_PUBLIC_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
      }
    : {
        user: 'postgres',
        host: 'localhost',
        database: 'webportfolio',
        password: '',
        port: 5432,
        ssl: false,
      }
);

// 연결 테스트
pool.on('connect', () => {
  console.log('📊 PostgreSQL 데이터베이스에 연결되었습니다.');
});

pool.on('error', (err) => {
  console.error('❌ 예상치 못한 데이터베이스 오류:', err);
  process.exit(-1);
});

// 연결 함수
const connect = async () => {
  try {
    const client = await pool.connect();
    console.log('✅ 데이터베이스 클라이언트 연결 성공');
    client.release();
    return pool;
  } catch (err) {
    console.error('❌ 데이터베이스 연결 오류:', err.message);
    throw err;
  }
};

// 쿼리 실행 헬퍼 함수
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📝 실행된 쿼리:', { text, duration, rows: res.rowCount });
    return res;
  } catch (err) {
    console.error('❌ 쿼리 실행 오류:', err);
    throw err;
  }
};

// 트랜잭션 헬퍼 함수
const getClient = async () => {
  const client = await pool.connect();
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // 타임아웃 설정 (5초)
  const timeout = setTimeout(() => {
    console.error('⚠️ 클라이언트가 5초 이상 유지되었습니다.');
  }, 5000);
  
  client.release = () => {
    clearTimeout(timeout);
    return release();
  };
  
  return client;
};

module.exports = {
  pool,
  connect,
  query,
  getClient,
};
