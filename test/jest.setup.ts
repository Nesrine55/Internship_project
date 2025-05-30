import 'reflect-metadata';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockImplementation((pass) => Promise.resolve(`hashed_${pass}`)),
  compare: jest.fn().mockImplementation((plain, hashed) => 
    Promise.resolve(`hashed_${plain}` === hashed)
  ),
}));

jest.mock('typeorm', () => ({
  ...jest.requireActual('typeorm'),
  DataSource: jest.fn(() => ({
    initialize: jest.fn().mockResolvedValue(null),
    destroy: jest.fn().mockResolvedValue(null),
  })),
}));