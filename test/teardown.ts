import { DataSource } from 'typeorm';

module.exports = async () => {
  const testDataSource: DataSource = global.__TEST_DB__;
  if (testDataSource?.isInitialized) {
    await testDataSource.destroy()
      .catch(e => console.error('Teardown error:', e));
  }
  console.log('Test DB connection closed');
};