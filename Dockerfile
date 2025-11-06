FROM node:22

# Install necessary dependencies for Chromium
# Uncomment only if not using the webscraping backend

# RUN apt-get update && apt-get install -y \
#   ca-certificates \
#   fonts-liberation \
#   libappindicator3-1 \
#   libasound2 \
#   libatk-bridge2.0-0 \
#   libatk1.0-0 \
#   libcups2 \
#   libdbus-1-3 \
#   libdrm2 \
#   libgbm1 \
#   libnspr4 \
#   libnss3 \
#   libx11-xcb1 \
#   libxcomposite1 \
#   libxdamage1 \
#   libxrandr2 \
#   xdg-utils \
#   wget \
#   --no-install-recommends && \
#   apt-get clean && \
#   rm -rf /var/lib/apt/lists/*

# Install app source
WORKDIR /app
COPY ./api/package*.json ./
RUN npm install 
COPY ./api/. .
EXPOSE 4000

# Run as non-root user
CMD ["npm", "start"]