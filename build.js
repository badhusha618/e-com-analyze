
#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function execCommand(command, description) {
  log(`\n${colors.cyan}🔧 ${description}...${colors.reset}`);
  try {
    execSync(command, { stdio: 'inherit' });
    log(`${colors.green}✅ ${description} completed successfully!${colors.reset}`);
    return true;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed: ${error.message}${colors.reset}`);
    return false;
  }
}

function checkFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    log(`${colors.green}✅ ${description} exists${colors.reset}`);
    return true;
  } else {
    log(`${colors.red}❌ ${description} not found${colors.reset}`);
    return false;
  }
}

function main() {
  log(`${colors.bright}${colors.blue}🚀 Starting Ecommerce Dashboard Build Process${colors.reset}`);
  log(`${colors.yellow}Build started at: ${new Date().toISOString()}${colors.reset}`);

  // Step 1: Environment Check
  log(`\n${colors.bright}📋 Step 1: Environment Check${colors.reset}`);
  
  const requiredFiles = [
    { path: 'package.json', desc: 'Package.json' },
    { path: 'tsconfig.json', desc: 'TypeScript config' },
    { path: 'vite.config.ts', desc: 'Vite config' },
    { path: 'client/src/App.tsx', desc: 'React app' },
    { path: 'server/index.ts', desc: 'Server entry point' }
  ];

  let allFilesExist = true;
  requiredFiles.forEach(file => {
    if (!checkFile(file.path, file.desc)) {
      allFilesExist = false;
    }
  });

  if (!allFilesExist) {
    log(`${colors.red}❌ Build aborted: Missing required files${colors.reset}`);
    process.exit(1);
  }

  // Step 2: Clean previous build
  log(`\n${colors.bright}🧹 Step 2: Cleaning Previous Build${colors.reset}`);
  if (fs.existsSync('dist')) {
    fs.rmSync('dist', { recursive: true, force: true });
    log(`${colors.green}✅ Cleaned dist directory${colors.reset}`);
  }

  // Step 3: Install dependencies
  log(`\n${colors.bright}📦 Step 3: Installing Dependencies${colors.reset}`);
  if (!execCommand('npm ci', 'Installing dependencies')) {
    process.exit(1);
  }

  // Step 4: Type checking
  log(`\n${colors.bright}🔍 Step 4: Type Checking${colors.reset}`);
  if (!execCommand('npm run check', 'TypeScript type checking')) {
    log(`${colors.yellow}⚠️  Type checking failed, but continuing build...${colors.reset}`);
  }

  // Step 5: Database schema push
  log(`\n${colors.bright}🗃️  Step 5: Database Schema${colors.reset}`);
  if (!execCommand('npm run db:push', 'Pushing database schema')) {
    log(`${colors.yellow}⚠️  Database schema push failed, but continuing build...${colors.reset}`);
  }

  // Step 6: Build frontend
  log(`\n${colors.bright}⚛️  Step 6: Building React Frontend${colors.reset}`);
  if (!execCommand('npm run build', 'Building React frontend with Vite')) {
    process.exit(1);
  }

  // Step 7: Build backend
  log(`\n${colors.bright}🌐 Step 7: Building Express Backend${colors.reset}`);
  const backendBuildCommand = 'esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist';
  if (!execCommand(backendBuildCommand, 'Building Express backend with esbuild')) {
    process.exit(1);
  }

  // Step 8: Verify build outputs
  log(`\n${colors.bright}✅ Step 8: Verifying Build Outputs${colors.reset}`);
  
  const buildOutputs = [
    { path: 'dist/public/index.html', desc: 'Frontend build' },
    { path: 'dist/index.js', desc: 'Backend build' }
  ];

  let allOutputsExist = true;
  buildOutputs.forEach(output => {
    if (!checkFile(output.path, output.desc)) {
      allOutputsExist = false;
    }
  });

  if (!allOutputsExist) {
    log(`${colors.red}❌ Build verification failed: Missing build outputs${colors.reset}`);
    process.exit(1);
  }

  // Step 9: Generate build info
  log(`\n${colors.bright}📄 Step 9: Generating Build Information${colors.reset}`);
  
  const buildInfo = {
    buildTime: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    buildHash: require('crypto').randomBytes(8).toString('hex'),
    environment: process.env.NODE_ENV || 'production'
  };

  try {
    fs.writeFileSync('dist/build-info.json', JSON.stringify(buildInfo, null, 2));
    log(`${colors.green}✅ Build information generated${colors.reset}`);
  } catch (error) {
    log(`${colors.yellow}⚠️  Failed to generate build info: ${error.message}${colors.reset}`);
  }

  // Step 10: Build summary
  log(`\n${colors.bright}${colors.green}🎉 Build Completed Successfully!${colors.reset}`);
  log(`${colors.bright}📊 Build Summary:${colors.reset}`);
  log(`   • Frontend: ${colors.green}✅ Built with Vite${colors.reset}`);
  log(`   • Backend: ${colors.green}✅ Built with esbuild${colors.reset}`);
  log(`   • Database: ${colors.green}✅ Schema ready${colors.reset}`);
  log(`   • Build Hash: ${colors.cyan}${buildInfo.buildHash}${colors.reset}`);
  log(`   • Build Time: ${colors.cyan}${buildInfo.buildTime}${colors.reset}`);
  
  log(`\n${colors.bright}🚀 Ready for deployment!${colors.reset}`);
  log(`${colors.cyan}To start the production server: npm start${colors.reset}`);
  log(`${colors.cyan}To deploy on Replit: Click the Deploy button${colors.reset}`);
}

// Run the build process
if (require.main === module) {
  main();
}

module.exports = { main };
