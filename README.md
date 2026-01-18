# � Groww-Inspired Stocks & ETFs Platform

A high-performance, resilient, and visually stunning React Native application for stock market exploration and watchlist management. Developed as an advanced solution for the stocks/ETFs broking platform assignment.

---

## 🌟 Overview
This application provides a comprehensive trading-desk experience, allowing users to track market movers, perform technical research, and organize their portfolio through custom watchlists. It is designed with a **"Performance First"** mindset, ensuring a smooth experience even under strict API rate limits.

---

## 🚀 Requirement Compliance Checklist

### ✅ Core Functionality
- **Dual Tab Architecture**: Seamless navigation between **Explore** and **Watchlist** modules.
- **Explore Screen**: Dynamic grid layout showcasing **Top Gainers** and **Top Losers** fetched via Alpha Intelligence API.
- **Product Details Screen**:
  - Detailed company overview (Fundamental Data).
  - High-fidelity **Line Graphs** for price action visualization.
  - Interactive **Watchlist Toggle** (Dynamic star icon states).
- **Advanced Watchlist Management**:
  - Multi-watchlist support (Create new or select existing).
  - Persistence logic for saving and retrieving user-curated lists.
- **View All Screen**: Full-screen list view for gainers/losers with built-in **Navigation Pagination**.

### 🛠️ Technical Excellence
- **Alpha Vantage Integration**: Full implementation of Intelligence, Fundamental, and Core Stocks APIs.
- **State Handling**: Standardized and consistent **Loading**, **Error (with Retry)**, and **Empty states** across all screens.
- **Standard Folder Structure**: Clean, modular, and professional directory organization (Atomic Design inspired).
- **Third-Party Visualization**: Integrated `victory-native` for industry-standard financial charting.
- **Intelligent Caching Engine**:
  - **Expiration Logic**: Configurable TTL (Time-To-Live) for different data types (e.g., 30m for gainers, 24h for overviews).
  - **AsyncStorage Persistence**: Cache survives app restarts to minimize redundant API calls.

---

## 🏆 Brownie Points (Above & Beyond)

### 🎨 Premium UI/UX
- **Groww Aesthetic**: Deep slate and vibrant accent colors (Groww Green/Red).
- **Dynamic Theming**: Full **Light & Dark Mode** support with a global context toggle.
- **Micro-Animations**: Smooth transitions and interaction feedback for a premium feel.

### ⚡ Optimizations
- **Network Efficiency**: Staggered API fetching and request batching.
- **Asset Management**: Optimized SVG icons and lazy-loading for heavy UI components.
- **Environment Security**: Sensitive API keys are managed via **`.env`** integration (using `react-native-dotenv`) to prevent security leaks in public repositories.

### ➕ Extra Functionality
- **Market News Sentiment**: Real-time market-moving stories with sentiment analysis scores.
- **Live Market Status**: Real-time detection of US market hours (Open/Closed status).
- **Technical Indicators**: Toggleable **20-Day Simple Moving Average (SMA)** on price charts.
- **Global Indices**: Quick-look cards for **S&P 500**, **NASDAQ 100**, and **Dow Jones**.

---

## 🏗️ Technical Stack & Architecture

- **Framework**: React Native (TypeScript)
- **Styling**: Vanilla Stylesheet with dynamic theme provider.
- **Navigation**: React Navigation (Native Stack + Bottom Tabs).
- **API Handling**: Axios with custom interceptors for caching.
- **Data Persistence**: React Context API + AsyncStorage.
- **Visuals**: Victory Native (Charts), React Native SVG.

### 📂 Folder Structure
```text
src/
├── components/    # Reusable UI Atoms (StockCards, StateViews, Modals)
├── constants/     # Design Tokens, Theme Definitions, API Configs
├── context/       # State Management (Theme, Watchlist Store)
├── navigation/    # Tab & Stack Navigators
├── screens/       # Full Page Components
├── services/      # API Layer, Cache Logic, Network Helpers
├── types/         # TypeScript Interfaces (Stock, News, Cache)
└── utils/         # Performance Helpers (Formatters, Validators)
```

---

## � Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Environment Setup**:
   - Create a `.env` file in the root directory.
   - Add your key: `ALPHA_VANTAGE_API_KEY=your_key_here`.
3. **Run Application**:
   - Start Metro: `npm start`
   - Run Android: `npm run android`

---

## � Deliverables
- **GitHub Repository**: [View Source Code](https://github.com/pjbeast23/Groww-StockApp-Assignment)
- **Working APK**: [Download from Google Drive](YOUR_DRIVE_LINK_HERE)

---

**Developer**: Paras Jain
**API Provider**: Alpha Vantage
**Focus**: Quality, Performance, & UX
