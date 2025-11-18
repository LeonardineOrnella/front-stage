// src/lib/integrations.js
import axios from 'axios';

const integrations = axios.create({
  baseURL: process.env.NEXT_PUBLIC_INTEGRATIONS_URL || 'http://localhost:3010/api',
  headers: { 'Content-Type': 'application/json' }
});

export default integrations;


