# 🌍 AI Travel Planner - Your Personalized Adventure Architect

Welcome to the **AI Travel Planner**, a cutting-edge, full-stack application designed to revolutionize the way you plan your journeys. By leveraging the power of **Google Gemini AI**, this platform transforms simple travel ideas into meticulously crafted, day-by-day itineraries tailored to your unique personality, budget, and interests.

---

## ✨ Core Features

### 🤖 Intelligent Itinerary Generation
Harness the power of **Gemini 2.0 Flash** to generate deeply personalized travel plans. Whether you're a solo backpacker on a shoestring budget or a luxury-seeking couple, the AI understands your "Travel Persona" and curates activities accordingly.

### 🗺️ Visual Route Mapping
Experience your trip before you even leave. Integrated with **Mapbox** and **Leaflet**, the platform visualizes your start and end points, as well as every daily activity, ensuring you have a clear spatial understanding of your adventure.

### 🌦️ Real-time Weather Insights
Never be caught off-guard. The system fetches live and forecasted weather data via **OpenWeatherMap**, embedding daily forecasts directly into your itinerary so you can plan your activities around the elements.

### 💰 Smart Budget Orchestration
Define your financial comfort zone and let the AI do the math. The application provides detailed budget breakdowns, including estimated costs for food, activities, and accommodation, ensuring your dream trip remains financially viable.

### 📄 Professional PDF Exports
Take your plans offline. Generate sleek, professional-looking PDF itineraries that include every detail of your trip—from weather forecasts to daily schedules—perfect for sharing with travel companions or keeping as a digital backup.

---

## 🛠️ Technology Stack

### Frontend (The User Experience)
- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router Architecture)
- **Logic**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- **UI Components**: [Ant Design (Antd)](https://ant.design/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Geospatial**: [Leaflet](https://leafletjs.com/) & [Mapbox GL JS](https://www.mapbox.com/mapbox-gljs)

### Backend (The Engine)
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) (via [Mongoose](https://mongoosejs.com/))
- **Caching**: [Redis](https://redis.io/) (for high-performance data retrieval)
- **Documentation**: [Swagger / OpenAPI](https://swagger.io/)

### AI & Services
- **Generative AI**: [Google Gemini AI SDK](https://ai.google.dev/)
- **Maps API**: [Google Maps Platform](https://developers.google.com/maps) & [Mapbox Search](https://www.mapbox.com/search-service)
- **Weather API**: [OpenWeatherMap](https://openweathermap.org/api)
- **PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) & [pdfkit](https://pdfkit.org/)

---

## 📂 Project Architecture

The project is organized as a high-performance monorepo, separating concerns while maintaining a unified workflow:

- **`/frontend`**: A highly interactive Next.js application that handles user input, interactive maps, and real-time data visualization.
- **`/backend`**: A robust Express API that manages authentication, interacts with the AI services, and orchestrates data from various external APIs.
- **`/ai-service`**: Dedicated workspace for AI-specific logic and integrations.

---

## 🚀 Vision and Design Philosophy

The AI Travel Planner is built with a focus on **Visual Excellence** and **User Empowerment**. Every interaction is designed to feel fluid, premium, and alive, moving away from static lists to a dynamic, interactive experience. By automating the research-heavy aspects of travel planning, we empower you to focus on what truly matters: **The Adventure.**

---
*Created with passion for explorers everywhere.*
