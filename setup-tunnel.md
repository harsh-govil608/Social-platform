# Setting up Cloudflare Tunnel for Public Access

## Option 1: Using Cloudflare Tunnel (Recommended - Free)

1. **Install Cloudflare CLI** (if not already installed):
   ```bash
   # Windows (using winget)
   winget install --id Cloudflare.cloudflared
   
   # Or download from: https://github.com/cloudflare/cloudflared/releases
   ```

2. **Login to Cloudflare**:
   ```bash
   cloudflared tunnel login
   ```
   This will open a browser for authentication.

3. **Create a tunnel**:
   ```bash
   cloudflared tunnel create social-platform
   ```
   Save the tunnel ID and credentials file path.

4. **Create config file** `D:\social-platform\cloudflared-config.yml`:
   ```yaml
   tunnel: YOUR_TUNNEL_ID
   credentials-file: C:\Users\YOUR_USER\.cloudflared\YOUR_TUNNEL_ID.json
   
   ingress:
     - hostname: social-platform.YOUR_DOMAIN.com
       service: http://localhost:80
     - service: http_status:404
   ```

5. **Route the tunnel to your domain**:
   ```bash
   cloudflared tunnel route dns social-platform social-platform.YOUR_DOMAIN.com
   ```

6. **Run with Docker Compose**:
   ```bash
   # First, get your tunnel token
   cloudflared tunnel token social-platform
   
   # Set the token as environment variable
   set CLOUDFLARE_TUNNEL_TOKEN=YOUR_TOKEN_HERE
   
   # Run Docker Compose
   docker-compose up --build
   ```

## Option 2: Using ngrok with Docker

1. **Sign up for ngrok** (free account): https://ngrok.com/signup

2. **Update docker-compose.yml** to use ngrok instead:
   ```yaml
   ngrok:
     image: ngrok/ngrok:latest
     container_name: social-ngrok
     command: http frontend:80 --authtoken YOUR_NGROK_TOKEN
     ports:
       - "4040:4040"  # ngrok web interface
     networks:
       - social-network
     depends_on:
       - frontend
   ```

3. **Run Docker Compose**:
   ```bash
   docker-compose up --build
   ```

4. **Get your public URL** from ngrok dashboard at http://localhost:4040

## Option 3: Using Tailscale (Private network sharing)

Perfect for sharing with specific people like your mom:

1. **Install Tailscale**: https://tailscale.com/download

2. **Add Tailscale to docker-compose.yml**:
   ```yaml
   tailscale:
     image: tailscale/tailscale:latest
     container_name: social-tailscale
     environment:
       - TS_AUTHKEY=YOUR_TAILSCALE_KEY
       - TS_SERVE_CONFIG=/config/serve.json
     volumes:
       - ./tailscale:/var/lib/tailscale
       - ./serve.json:/config/serve.json
     networks:
       - social-network
     cap_add:
       - NET_ADMIN
       - SYS_MODULE
   ```

3. **Share the Tailscale network** with your mom's device

## Quick Start (Without Tunnel - Local Testing)

If you just want to test Docker locally first:

```bash
# Stop existing services
taskkill /F /IM node.exe

# Build and run Docker containers
docker-compose up --build

# Access at http://localhost
```

Your app will be available at http://localhost (port 80)