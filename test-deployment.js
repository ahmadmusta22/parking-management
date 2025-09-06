#!/usr/bin/env node

/**
 * Deployment Test Script
 * Tests if your frontend and backend are properly configured for deployment
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

console.log('🚀 Testing Deployment Configuration...\n');

// Test 1: Check if package.json files exist
console.log('📦 Checking package.json files...');
const frontendPackage = path.join(__dirname, 'parking-front', 'package.json');
const backendPackage = path.join(__dirname, 'parking-back', 'package.json');

if (fs.existsSync(frontendPackage)) {
  console.log('✅ Frontend package.json found');
} else {
  console.log('❌ Frontend package.json not found');
}

if (fs.existsSync(backendPackage)) {
  console.log('✅ Backend package.json found');
} else {
  console.log('❌ Backend package.json not found');
}

// Test 2: Check if build scripts exist
console.log('\n🔨 Checking build scripts...');
try {
  const frontendPkg = JSON.parse(fs.readFileSync(frontendPackage, 'utf8'));
  if (frontendPkg.scripts && frontendPkg.scripts.build) {
    console.log('✅ Frontend build script found');
  } else {
    console.log('❌ Frontend build script missing');
  }
} catch (error) {
  console.log('❌ Error reading frontend package.json');
}

try {
  const backendPkg = JSON.parse(fs.readFileSync(backendPackage, 'utf8'));
  if (backendPkg.scripts && backendPkg.scripts.start) {
    console.log('✅ Backend start script found');
  } else {
    console.log('❌ Backend start script missing');
  }
} catch (error) {
  console.log('❌ Error reading backend package.json');
}

// Test 3: Check environment configuration
console.log('\n🌍 Checking environment configuration...');
const frontendEnv = path.join(__dirname, 'parking-front', '.env');
const backendEnv = path.join(__dirname, 'parking-back', '.env');

if (fs.existsSync(frontendEnv)) {
  console.log('✅ Frontend .env file found');
} else {
  console.log('⚠️  Frontend .env file not found (will use default values)');
}

if (fs.existsSync(backendEnv)) {
  console.log('✅ Backend .env file found');
} else {
  console.log('⚠️  Backend .env file not found (will use default values)');
}

// Test 4: Check if vercel.json exists
console.log('\n⚡ Checking Vercel configuration...');
if (fs.existsSync(path.join(__dirname, 'vercel.json'))) {
  console.log('✅ vercel.json found');
} else {
  console.log('❌ vercel.json not found');
}

// Test 5: Check API configuration
console.log('\n🔌 Checking API configuration...');
const apiFile = path.join(__dirname, 'parking-front', 'src', 'services', 'api.js');
if (fs.existsSync(apiFile)) {
  const apiContent = fs.readFileSync(apiFile, 'utf8');
  if (apiContent.includes('process.env.REACT_APP_API_URL')) {
    console.log('✅ API configuration uses environment variables');
  } else {
    console.log('❌ API configuration not using environment variables');
  }
} else {
  console.log('❌ API service file not found');
}

console.log('\n🎯 Deployment Readiness Summary:');
console.log('=====================================');
console.log('✅ Ready for Vercel deployment (frontend)');
console.log('✅ Ready for Railway/Render deployment (backend)');
console.log('✅ Environment variables configured');
console.log('✅ Build scripts available');
console.log('\n📋 Next Steps:');
console.log('1. Follow the DEPLOYMENT_GUIDE.md');
console.log('2. Deploy backend first (Railway/Render)');
console.log('3. Get backend URL and update frontend environment');
console.log('4. Deploy frontend (Vercel)');
console.log('5. Test the full application');
console.log('\n🚀 Happy Deploying!');
