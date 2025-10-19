# Running Skybound

## 1. Clone the git repo

```powershell
git clone "https://github.com/ejd6617/Skybound"
```

## 2. Start the API Backend

### 2.1. Docker Desktop

- Ensure docker desktop is installed and running (should be preinstalled in VMs)

### 2.2. ngrok (for connection tunneling)

- Create an ngrok account [here](https://dashboard.ngrok.com/signup). I just used my GitHub account to sign up.

- Find your authtoken [here](https://dashboard.ngrok.com/get-started/your-authtoken)

- Create file `.env.ngrok.local` in the project root (Skybound/.env.ngrok.local) with the following contents:

```ini
NGROK_AUTHTOKEN="yourTokenHere"
```

### 2.3. Amadeus API

- Create file `.env.amadeus.local` in the project root (Skybound/.env.amadeus.local) with the following contents:

```ini
AMADEUS_KEY="yourKeyHere"
AMADEUS_SECRET="yourSecretHere"
```

> [!NOTE]
> I don't think we all need a separate account for this one, so you can use the credentials I emailed you. If it starts to hit you with weird rate limits etc, you can try making your own developer account with Amadeus.

### 2.4. Start the docker container

```powershell
cd .\Skybound\
docker compose up --build
```

## 3. Start the app

```powershell
cd .\Skybound\mobile\expo
npm install
npm start
```

## 4. View the app on your mobile device

There will be a QR code output to the terminal by the running expo app. Scan it to connect to the tunnel.

<br>

---

# Default Expo README (for reference)

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
