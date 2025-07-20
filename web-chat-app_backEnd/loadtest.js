import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 20 }, // Ramp up to 20 users
    { duration: '1m', target: 50 },  // Maintain 50 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down
  ],
};

// List of API endpoints
const endpoints = ['/api/v1/auth/reset-password', '/api/v1/forgot-password', '/api/v1/auth/login'];

// Utility function to get a random item from an array
function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export default function () {
  const endpoint = getRandomItem(endpoints);

  const payload = JSON.stringify({
    email: `user${Math.floor(Math.random() * 100)}@example.com`,
    password: 'Test@1234',
  });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: 'Bearer fake-token',
  };

  const res = http.post(`http://localhost:5000${endpoint}`, payload, { headers });

  check(res, {
    'Status is 200': (r) => r.status === 200,
    'Response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(Math.random() * 2);
}
