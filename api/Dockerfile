FROM node:22

# Install necessary dependencies for Chromium
RUN apt-get update && apt-get install -y \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libdrm2 \
  libgbm1 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  wget \
  --no-install-recommends && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

# Install app source
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install -g "ngrok"
RUN npm install 
COPY . .
EXPOSE 4000

# Run as non-root user
CMD ["npm", "start"]