import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
export let errorRate = new Rate('errors');

// Test configuration
export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 200 }, // Ramp up to 200 users
    { duration: '5m', target: 200 }, // Stay at 200 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<300'], // 95% of requests under 300ms
    http_req_failed: ['rate<0.1'],    // Error rate under 10%
    errors: ['rate<0.1'],
  },
};

const BASE_URL = 'http://localhost:3001';

// Test data
const testEntities = [
  { type: 'phone', entity: '+91-9876543210' },
  { type: 'url', entity: 'http://fake-bank.com' },
  { type: 'email', entity: 'scam@fake.com' },
  { type: 'upi', entity: 'fake@paytm' },
  { type: 'social', entity: 'fake-facebook' }
];

export function setup() {
  // Setup code - create test data if needed
  console.log('Starting DHIP Load Test');
}

export default function () {
  // Test health endpoint
  let healthResponse = http.get(`${BASE_URL}/api/health`);
  check(healthResponse, {
    'health status is 200': (r) => r.status === 200,
    'health response time < 100ms': (r) => r.timings.duration < 100,
  }) || errorRate.add(1);

  // Test analysis endpoint
  let randomEntity = testEntities[Math.floor(Math.random() * testEntities.length)];
  let analysisResponse = http.post(
    `${BASE_URL}/api/analyze`,
    JSON.stringify(randomEntity),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  check(analysisResponse, {
    'analysis status is 200': (r) => r.status === 200,
    'analysis response time < 500ms': (r) => r.timings.duration < 500,
    'analysis has risk score': (r) => JSON.parse(r.body).riskScore !== undefined,
  }) || errorRate.add(1);

  // Test SMS endpoint (mock)
  let smsResponse = http.post(
    `${BASE_URL}/api/sms/send`,
    JSON.stringify({
      to: '+919876543210',
      message: 'Test alert: Suspicious activity detected',
      language: 'en'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
  
  check(smsResponse, {
    'sms status is 200 or 400': (r) => r.status === 200 || r.status === 400, // 400 if Twilio not configured
    'sms response time < 1000ms': (r) => r.timings.duration < 1000,
  }) || errorRate.add(1);

  sleep(1);
}

export function teardown() {
  // Cleanup code
  console.log('Load test completed');
}
