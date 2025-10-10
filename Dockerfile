FROM node:22
RUN npm install -g expo-cli
WORKDIR /app
COPY package.json ./
COPY package-lock.json ./
RUN npm install
COPY . .
# Expose Metro bundler + web + devtools
EXPOSE 19000 19001 19002
CMD ["npm", "start"]