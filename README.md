# Prerequisites

## Install dependencies

- Ensure that git and node/npm are installed and available in PATH

## Clone the repository

```powershell
git clone "https://github.com/ejd6617/Skybound"
```

# Running Skybound (using our public server)

## 1. Start the app

```powershell
cd .\Skybound\
npm install
npm start
```

## 2. View the app on your mobile device

There will be a QR code output to the terminal by the running expo app. Scan it to connect to the tunnel.

# Running Skybound (using a local container for our backend)

## 1. Start the API Backend

### 1.1. Docker Desktop

- Ensure docker desktop is installed and running (should be preinstalled in VMs)

### 1.2. Credentials

- Obtain the following files from us and drop them in the root of the project (.\Skybound\)

```
Skybound
├── .env
├── .env.amadeus.local
├── .env.firebase-backend.local
├── .env.ngrok.local
└── .env.test.local
```

### 1.3. Ensure that the container is configured to forward connections with ngrok

Uncomment `- USE_NGROK=true` in docker-compose.yml

### 1.4. Start the backend's docker container

```powershell
cd .\Skybound\
docker compose up --build
```

## 2. Start the app (using ngrok)

```powershell
cd .\Skybound\ # (If not already in this directory)
npm install
USE_NGROK=true npm start # IMPORTANT: Notice we're passing an environment variable
```

## 3. View the app on your mobile device

There will be a QR code output to the terminal by the running expo app. Scan it to connect to the tunnel.
