# 🥑 NutriScan: Your AI-Powered Food Detective

<p align="center">
  <img src="https://raw.githubusercontent.com/rahulsuthar/NutriScan/main/public/favicon.ico" width="100" alt="NutriScan Logo" />
</p>

<p align="center">
  <strong>Scan meals, menus, and packaged foods for instant nutrition snapshots.</strong>
</p>

---

## ✨ Features

-   **📸 AI Food Scanning**: Snap a photo of a meal, menu, snack, or packaged food, and NutriScan will identify the food items.
-   **🥗 Instant Macro Snapshot**: Get average calories, protein, carbs, and fat in the first scan result.
-   **🌿 Vegan & Health Ratings**: Quickly identify vegan-friendly options with a leaf icon and see a health rating (from 1 to 10) for each item.
-   **😂 Fun Loading Experience**: Enjoy a variety of playful and quirky loading messages while the AI analyzes your food.
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

NutriScan uses a lean scan-first AI workflow:

1.  **`scan-menu-for-food-options`**: This flow takes a food image as input and returns detected foods plus average calories, carbs, protein, fat, allergens, and health rating data.

2.  **`generate-nutritional-data`**: This fallback flow can still fill in details if a scanned item is missing macro data.

The prompts for these flows have been carefully refined to be concise and to minimize the chances of inaccurate or "hallucinated" information.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
