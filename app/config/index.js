import development from './development.js';
import production from './production.js';
import test from './test.js';

const env = process.env.NODE_ENV || 'development';

const configs = {
  development,
  production,
  test
};

export default configs[env];
