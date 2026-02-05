const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DB 연결
const db = require('./config/database');

// DB 연결 테스트
db.connect()
  .then(() => {
    console.log('✅ 데이터베이스 연결 성공');
    
    // 기본 라우트
    app.get('/', (req, res) => {
      res.json({ message: 'Express 서버가 실행 중입니다.' });
    });

    // 서버 시작
    app.listen(port, () => {
      console.log(`🚀 서버가 http://localhost:${port} 에서 실행 중입니다.`);
    });
  })
  .catch((err) => {
    console.error('❌ 데이터베이스 연결 실패:', err);
    process.exit(1);
  });

// 에러 핸들러
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: '서버 오류가 발생했습니다.' });
});

module.exports = app;
