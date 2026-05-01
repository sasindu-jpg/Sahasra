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

## 📦 Deployment & Desktop App (.exe)

This app can be compiled into a standalone Windows software (.exe).

### How to generate the Windows Software:
1. **Download/Export** this project as a ZIP or clone it from GitHub.
2. Open your terminal in the project folder.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Build the Windows installer:
   ```bash
   npm run build:win
   ```
5. Your software will be ready in the `release/` folder.

### PWA (Web Installation):
If you don't want to build an `.exe`, you can simply open the URL in Chrome and click the **Install icon** in the address bar to add it to your desktop.

---
*Built with ❤️ for Sahasra Business.*
