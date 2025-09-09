# Port Check

A cross-platform CLI tool to check which process is running on a specific port. Works on macOS, Windows, and Linux.

## Features

- ✅ **Cross-platform support**: macOS, Windows, Linux
- ✅ **Simple CLI interface**: Just provide a port number
- ✅ **Formatted output**: Clean, readable results with emojis
- ✅ **Error handling**: Helpful error messages and troubleshooting tips
- ✅ **No dependencies**: Uses built-in Node.js modules only

## Installation

### Using npx (Recommended)

```bash
npx port-inspect <port>
```

Alternatively:

```bash
npx @mikr13/port-check <port>
```

### Global Installation

```bash
npm install -g @mikr13/port-check
port-check <port>
```

### Using Bun

```bash
bunx @mikr13/port-check <port>
```

## Usage

```bash
# Check what's running on port 3000
npx @mikr13/port-check 3000
// or
npx port-inspect 80

# Check what's running on port 8080
npx @mikr13/port-check 8080
// or
npx port-inspect 80

# Check what's running on port 80 (requires admin privileges)
npx @mikr13/port-check 80
// or
npx port-inspect 80
```

## Examples

### macOS/Linux Output

```
🔍 Checking port 3000 on darwin...

🔍 Process(es) using port 3000:
📡 node (PID: 12345) - mihirpandey (3 connections)
```

### Windows Output

```
🔍 Checking port 3000 on win32...

🔍 Process(es) using port 3000:
📡 TCP 0.0.0.0:3000 -> 0.0.0.0:0 (LISTENING) PID: 12345 (2 connections)
```

### No Process Found

```
🔍 Checking port 9999 on darwin...

🔍 No process found using port 9999
```

## Understanding Port Usage

### Why Multiple Processes on the Same Port?

You might see multiple processes using the same port, which can be confusing. Here's why this happens:

1. **Multiple Connections**: A single process can have multiple network connections (sockets) on the same port
   - Example: A web server handling multiple client connections
   - Each connection shows up as a separate line in `lsof` output

2. **Different Socket States**: The same process might have sockets in different states
   - `LISTENING`: Waiting for incoming connections
   - `ESTABLISHED`: Active connections
   - `TIME_WAIT`: Recently closed connections

3. **Process Forking**: Child processes inherit the same port from parent processes
   - Common in web servers that fork worker processes

4. **Load Balancers/Proxies**: Multiple processes working together
   - Main process listening on port
   - Worker processes handling requests

### Connection Count

The tool now shows connection counts to help you understand:

- `(1 connection)`: Single socket/connection
- `(5 connections)`: Multiple sockets/connections for the same process

This gives you a clearer picture of what's actually happening on each port.

## Platform Requirements

### macOS

- `lsof` command (usually pre-installed)
- If not available: `brew install lsof`

### Linux

- `lsof` command
- Install with: `sudo apt-get install lsof` (Ubuntu/Debian) or `sudo yum install lsof` (CentOS/RHEL)

### Windows

- `netstat` command (built into Windows)
- No additional installation required

## Troubleshooting

### Permission Issues

Some ports (especially system ports < 1024) may require administrator privileges:

**macOS/Linux:**

```bash
sudo npx @mikr13/port-check 80
// or
npx port-inspect 80
```

**Windows:**
Run Command Prompt as Administrator, then:

```bash
npx @mikr13/port-check 80
// or
npx port-inspect 80
```

### Command Not Found Errors

**macOS:**

```bash
# Install lsof if not available
brew install lsof
```

**Linux:**

```bash
# Ubuntu/Debian
sudo apt-get install lsof

# CentOS/RHEL
sudo yum install lsof
```

**Windows:**
`netstat` should be available by default. If not, check your PATH environment variable.

## How It Works

The tool uses platform-specific commands to check port usage:

- **macOS/Linux**: `lsof -i tcp:<port>` - Lists open files and processes using the specified TCP port
- **Windows**: `netstat -ano | findstr :<port>` - Shows network connections and associated process IDs

## Development

### Prerequisites

- [Bun](https://bun.sh/) for package management
- Node.js 14+ for runtime

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd port-check

# Install dependencies (none required, but you can use bun for development)
bun install
```

### Testing

```bash
# Test with a common port
bun run index.js 3000

# Test with a port that's likely not in use
bun run index.js 9999
```

### Publishing

```bash
# Publish to npm
bun publish
```

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on multiple platforms
5. Submit a pull request

## Changelog

### v1.0.0

- Initial release
- Cross-platform support (macOS, Windows, Linux)
- Basic port checking functionality
- Formatted output with emojis
- Error handling and validation

### v1.0.1

- Added `alias-port-check`
