#!/usr/bin/env node

import { execSync } from 'child_process';
import { platform } from 'os';

const port = process.argv[2];

if (!port) {
  console.error('❌ Error: Please provide a port number.');
  console.log('\nUsage: npx @mikr13/port-check <port>');
  console.log('Example: npx @mikr13/port-check 3000');
  process.exit(1);
}

const portNum = parseInt(port, 10);

if (isNaN(portNum) || portNum < 1 || portNum > 65535) {
  console.error('❌ Error: Port must be a number between 1 and 65535.');
  process.exit(1);
}

function getCommand(platform, port) {
  switch (platform) {
    case 'darwin': // macOS
    case 'linux':
      return `lsof -i tcp:${port}`;
    case 'win32': // Windows
      return `netstat -ano | findstr :${port}`;
    default:
      throw new Error(`Unsupported platform: ${platform}`);
  }
}

function formatOutput(output, platform) {
  if (!output.trim()) {
    return `🔍 No process found using port ${port}`;
  }

  if (platform === 'win32') {
    const lines = output.trim().split('\n');
    const processMap = new Map();

    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const [protocol, localAddress, foreignAddress, state, pid] = parts;
        const key = `${pid}`;

        if (processMap.has(key)) {
          processMap.get(key).connections++;
        } else {
          processMap.set(key, {
            protocol,
            localAddress,
            foreignAddress,
            state,
            pid,
            connections: 1
          });
        }
      }
    });

    if (processMap.size === 0) {
      return `🔍 No process found using port ${port}`;
    }

    const formattedLines = Array.from(processMap.values()).map(proc => {
      const connText = proc.connections > 1 ? ` (${proc.connections} connections)` : '';
      return `📡 ${proc.protocol} ${proc.localAddress} -> ${proc.foreignAddress} (${proc.state}) PID: ${proc.pid}${connText}`;
    });

    return `🔍 Process(es) using port ${port}:\n${formattedLines.join('\n')}`;
  } else {
    const lines = output.trim().split('\n');
    if (lines.length === 1) {
      return `🔍 No process found using port ${port}`;
    }

    const processMap = new Map();

    lines.slice(1).forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 9) {
        const [command, pid, user, fd, type, device, size, node, name] = parts;
        const key = `${pid}`;

        if (processMap.has(key)) {
          processMap.get(key).connections++;
        } else {
          processMap.set(key, {
            command,
            pid,
            user,
            connections: 1
          });
        }
      }
    });

    if (processMap.size === 0) {
      return `🔍 No process found using port ${port}`;
    }

    const processes = Array.from(processMap.values()).map(proc => {
      const connText = proc.connections > 1 ? ` (${proc.connections} connections)` : '';
      return `📡 ${proc.command} (PID: ${proc.pid}) - ${proc.user}${connText}`;
    });

    return `🔍 Process(es) using port ${port}:\n${processes.join('\n')}`;
  }
}

async function checkPort() {
  const currentPlatform = platform();

  try {
    console.log(`🔍 Checking port ${port} on ${currentPlatform}...\n`);

    const command = getCommand(currentPlatform, port);
    const output = execSync(command, {
      encoding: 'utf-8',
      stdio: 'pipe'
    });

    console.log(formatOutput(output, currentPlatform));

  } catch (error) {
    if (error.status === 1 && error.stdout === '') {
      // Command executed but no results found
      console.log(`🔍 No process found using port ${port}`);
    } else if (error.message.includes('Unsupported platform')) {
      console.error(`❌ Error: ${error.message}`);
      console.log('Supported platforms: macOS (darwin), Linux, Windows (win32)');
      process.exit(1);
    } else {
      console.error(`❌ Error executing command: ${error.message}`);
      console.log('\nTroubleshooting:');
      console.log('- Make sure you have the required tools installed:');
      if (currentPlatform === 'win32') {
        console.log('  - netstat (built into Windows)');
      } else {
        console.log('  - lsof (install with: brew install lsof on macOS, apt-get install lsof on Linux)');
      }
      console.log('- Try running with administrator/sudo privileges if needed');
      process.exit(1);
    }
  }
}

checkPort();
