import Conf from 'conf';

const config = new Conf({
  projectName: 'spool',
  schema: {
    accessToken: { type: 'string' },
    userId: { type: 'string' },
    username: { type: 'string' },
    expiresAt: { type: 'number' },
    clientId: { type: 'string' },
    clientSecret: { type: 'string' },
  }
});

export function getToken() {
  return config.get('accessToken');
}

export function setToken(token, expiresIn = null) {
  config.set('accessToken', token);
  if (expiresIn) {
    config.set('expiresAt', Date.now() + expiresIn * 1000);
  }
}

export function getUser() {
  return {
    id: config.get('userId'),
    username: config.get('username'),
  };
}

export function setUser(id, username) {
  config.set('userId', id);
  config.set('username', username);
}

export function getClientCredentials() {
  return {
    clientId: config.get('clientId') || process.env.THREADS_CLIENT_ID,
    clientSecret: config.get('clientSecret') || process.env.THREADS_CLIENT_SECRET,
  };
}

export function setClientCredentials(clientId, clientSecret) {
  config.set('clientId', clientId);
  config.set('clientSecret', clientSecret);
}

export function isAuthenticated() {
  const token = getToken();
  const expiresAt = config.get('expiresAt');
  
  if (!token) return false;
  if (expiresAt && Date.now() > expiresAt) return false;
  
  return true;
}

export function clearAuth() {
  config.delete('accessToken');
  config.delete('userId');
  config.delete('username');
  config.delete('expiresAt');
}

export function getConfigPath() {
  return config.path;
}

export default config;
