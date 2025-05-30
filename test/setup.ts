import { DataSource } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

module.exports = async () => {
  const testDbConfig: PostgresConnectionOptions = {
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'admin',
    database: process.env.DB_NAME || 'nest_project',
    entities: ['src/**/*.entity.ts'],
    synchronize: true, 
    dropSchema: true,  
  };

  const testDataSource = new DataSource(testDbConfig);
  await testDataSource.initialize();
  global.__TEST_DB__ = testDataSource;

  console.log('Test DB initialized');
};