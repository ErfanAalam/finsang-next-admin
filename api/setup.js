#!/usr/bin/env node

/**
 * FinsangMart Backend API Setup Script
 * This script helps you set up the backend environment
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('🚀 FinsangMart Backend API Setup');
  console.log('=====================================\n');

  try {
    // Get Supabase configuration
    const supabaseUrl = await question('Enter your Supabase URL: ');
    const supabaseAnonKey = await question('Enter your Supabase Anon Key: ');
    
    // Get JWT configuration
    const jwtSecret = await question('Enter a JWT secret (or press Enter for auto-generated): ') || 
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    // Get server configuration
    const port = await question('Enter server port (default: 3001): ') || '3001';
    const nodeEnv = await question('Enter NODE_ENV (default: development): ') || 'development';
    
    // Get CORS configuration
    const allowedOrigins = await question('Enter allowed origins (comma-separated, default: http://localhost:3000,http://localhost:8081): ') || 
      'http://localhost:3000,http://localhost:8081';
    
    // Get file upload configuration
    const maxFileSize = await question('Enter max file size in bytes (default: 5242880): ') || '5242880';
    
    // Get role configuration
    const defaultUserRole = await question('Enter default user role (default: user): ') || 'user';
    const adminRoles = await question('Enter admin roles (comma-separated, default: admin,moderator): ') || 'admin,moderator';

    // Create .env file content
    const envContent = `# Server Configuration
PORT=${port}
NODE_ENV=${nodeEnv}

# Supabase Configuration
SUPABASE_URL=${supabaseUrl}
SUPABASE_ANON_KEY=${supabaseAnonKey}

# JWT Configuration
JWT_SECRET=${jwtSecret}
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS Configuration
ALLOWED_ORIGINS=${allowedOrigins}

# File Upload Configuration
MAX_FILE_SIZE=${maxFileSize}
UPLOAD_PATH=./uploads

# Role Configuration
DEFAULT_USER_ROLE=${defaultUserRole}
ADMIN_ROLES=${adminRoles}
`;

    // Write .env file
    fs.writeFileSync('.env', envContent);
    console.log('\n✅ Environment file created successfully!');

    // Install dependencies
    console.log('\n📦 Installing dependencies...');
    const { execSync } = require('child_process');
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!');

    // Create uploads directory
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Uploads directory created!');
    }

    console.log('\n🎉 Setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start the development server: npm run dev');
    console.log('2. Test the API: curl http://localhost:3001/health');
    console.log('3. Check the API documentation in README.md');
    console.log('\n📝 Important Notes:');
    console.log('- Make sure your Supabase project has the required tables');
    console.log('- Set up Row Level Security (RLS) policies in Supabase');
    console.log('- Configure storage buckets for file uploads');
    console.log('- Users will be assigned the default role on registration');
    console.log('- Admin roles can be assigned via the API or Supabase dashboard');
    console.log('\nHappy coding! 🚀');
    rl.close();
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Handle SIGINT
rl.on('SIGINT', () => {
  console.log('\n\nSetup cancelled by user.');
  rl.close();
  process.exit(0);
});

// Run setup
setup(); 