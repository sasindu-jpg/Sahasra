# Sahasra Order Manager v1.0

AI-powered batch processor designed to extract order details from WhatsApp/Mobile screenshots and export them directly to Excel.

## 🚀 Key Features

- **AI Extraction:** Uses Google Gemini 1.5 Flash to read handwritten or typed details from images.
- **Sequential ID Engine:** Set a starting order number, and the system auto-increments for every image detected.
- **Privacy First:** Users can input their own Google Gemini API keys in the settings. Keys are stored locally in the browser (localStorage) and never hit a server.
- **Dark Mode UI:** Modern, high-contrast industrial interface.
- **One-Click Export:** Generates clean `.xlsx` files ready for shipping/accounting.
- **PWA Ready:** Can be installed on Windows/Mac/Linux as a standalone desktop application.

## 🛠 Setup for Local Development

1. **Clone the repo:**
   ```bash
   git clone <your-repo-url>
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the app:**
   ```bash
   npm run dev
   ```

## 🔑 How to Get an API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a free API Key.
3. In the Sahasra app, click **"CONFIGURE ENGINE"** and paste your key.

## 📦 Deployment

This app is a static React application. You can host it on:
- **GitHub Pages** (Recommended)
- **Vercel**
- **Netlify**

To build for production:
```bash
npm run build
```

---
*Built with ❤️ for Sahasra Business.*
