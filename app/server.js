const express = require('express');
const mysql = require('mysql2/promise');
const client = require('prom-client');

const app = express();
app.use(express.json());

const pool = mysql.createPool({
  host: process.env.DB_HOST, user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, database: process.env.DB_NAME,
  connectionLimit: 10
});

client.collectDefaultMetrics();
const httpDuration = new client.Histogram({
  name: 'http_request_duration_seconds', help: 'HTTP request duration',
  labelNames: ['method', 'route', 'status']
});
app.use((req, res, next) => {
  const end = httpDuration.startTimer();
  res.on('finish', () => end({
    method: req.method, route: req.route ? req.route.path : 'other', status: res.statusCode
  }));
  next();
});
app.get('/metrics', async (_, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});
app.get('/health', (_, res) => res.send('ok'));

const wrap = fn => (req, res) => fn(req, res).catch(e => {
  console.error('error:', e.message);
  res.status(500).json({ error: e.message });
});

function crud(name, table, fields, listSql) {
  const base = `/api/${name}`;
  app.get(base, wrap(async (_, res) => { const [rows] = await pool.query(listSql); res.json(rows); }));
  app.post(base, wrap(async (req, res) => {
    const vals = fields.map(f => req.body[f] ?? null);
    const [r] = await pool.query(
      `INSERT INTO ${table} (${fields.join(',')}) VALUES (${fields.map(() => '?').join(',')})`, vals);
    res.status(201).json({ id: r.insertId });
  }));
  app.put(`${base}/:id`, wrap(async (req, res) => {
    const vals = fields.map(f => req.body[f] ?? null);
    await pool.query(`UPDATE ${table} SET ${fields.map(f => f + '=?').join(',')} WHERE id=?`,
      [...vals, req.params.id]);
    res.sendStatus(204);
  }));
  app.delete(`${base}/:id`, wrap(async (req, res) => {
    await pool.query(`DELETE FROM ${table} WHERE id=?`, [req.params.id]);
    res.sendStatus(204);
  }));
}

crud('classes', 'classes', ['name', 'teacher'], 'SELECT * FROM classes');
crud('students', 'students', ['student_code', 'full_name', 'email', 'class_id'],
  'SELECT s.*, c.name AS class_name FROM students s LEFT JOIN classes c ON s.class_id=c.id');
crud('grades', 'grades', ['student_id', 'subject', 'score'],
  'SELECT g.id, g.student_id, s.student_code, s.full_name, g.subject, g.score FROM grades g JOIN students s ON s.id=g.student_id');

app.use(express.static('public'));
app.listen(3000, () => console.log('App listening on 3000'));

