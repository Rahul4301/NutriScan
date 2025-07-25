# 🥑 NutriScan: Your AI-Powered Food Detective

<p align="center">
  <img src="https://raw.githubusercontent.com/rahulsuthar/NutriScan/main/public/favicon.ico" width="100" alt="NutriScan Logo" />
</p>

<p align="center">
  <strong>Scan any menu, get instant nutritional insights, and make smarter food choices.</strong>
</p>

---

## ✨ Features

-   **📸 AI Menu Scanning**: Snap a photo of any menu, and NutriScan will instantly identify the food items.
-   **🥗 Instant Nutritional Analysis**: Get detailed nutritional information for each food item, including calories, protein, carbs, and fat.
-   **🌿 Vegan & Health Ratings**: Quickly identify vegan-friendly options with a leaf icon and see a health rating (from 1 to 10) for each item.
-   **😂 Fun Loading Experience**: Enjoy a variety of playful and quirky loading messages while the AI analyzes your menu.
-   **🔐 Secure Authentication**: User accounts are protected with a secure authentication flow powered by Supabase.
-   **📱 Responsive Design**: A beautiful and intuitive UI that works seamlessly on any device, built with Next.js, TypeScript, and Tailwind CSS.

---

## 🛠️ Tech Stack

-   **Framework**: [Next.js](https://nextjs.org/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **AI**: [Google's Genkit](https://github.com/google/genkit)
-   **Backend & Auth**: [Supabase](https://supabase.io/)
-   **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
-   **Runtime for Supabase Functions**: [Deno](https://deno.land/)

---

## 🚀 Getting Started

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v18+ recommended)
-   [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
-   [Docker](https://www.docker.com/get-started) (for running Supabase locally)

### Installation & Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/NutriScan.git
    cd NutriScan
    ```

2.  **Install the dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    -   Start the Supabase local development environment:
        ```bash
        npx supabase start
        ```
    -   The first time you run this, it will download the necessary Docker images.
    -   Once it's running, you'll see your local Supabase credentials in the terminal.

4.  **Run the application:**
    ```bash
    npm run dev
    ```

🎉 Your app should now be running at [http://localhost:9002](http://localhost:9002).

---

## 🗂️ Project Structure

```
/
├── src/
│   ├── ai/
│   │   └── flows/          # Genkit AI flows
│   ├── app/                # Next.js app directory (pages, routes, etc.)
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   └── lib/                # Utility functions and libraries
├── supabase/
│   ├── functions/          # Deno-based edge functions
│   └── migrations/         # Database migrations
└── README.md               # You are here!
```

---

## 🤖 AI Flows

NutriScan uses two primary AI flows, powered by Google's Genkit:

1.  **`scan-menu-for-food-options`**: This flow takes a menu image as input and returns a list of all the food items it can identify.

2.  **`generate-nutritional-data`**: This flow takes a food item's name and returns a detailed nutritional analysis, including a health rating and whether the item is vegan.

The prompts for these flows have been carefully refined to be concise and to minimize the chances of inaccurate or "hallucinated" information.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.