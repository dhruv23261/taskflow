const { Client } = require('pg');

async function createDb() {
  const client = new Client({
    user: 'postgres',
    host: 'localhost',
    password: '123456',
    port: 5432,
    database: 'postgres' // connect to default db first
  });

  try {
    await client.connect();
    await client.query('CREATE DATABASE taskflow_db');
    console.log('Database taskflow_db created successfully');
  } catch (err) {
    if (err.code === '42P04') {
      console.log('Database taskflow_db already exists');
    } else {
      console.error('Error creating database:', err);
    }
  } finally {
    await client.end();
  }
}

createDb();
