import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-blue-100 p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4 text-green-700">Welcome to NutriScan</h1>
        <p className="text-lg mb-6 text-gray-700">
          NutriScan helps you analyze menu items for nutritional information using AI. Instantly get:
        </p>
        <ul className="text-left mb-6 text-gray-800 list-disc list-inside">
          <li>Estimated calories</li>
          <li>Macronutrients (protein, carbs, fats)</li>
          <li>Key ingredients</li>
          <li>Potential allergens</li>
          <li>Dietary categories (vegetarian, vegan, gluten-free, etc.)</li>
        </ul>
        <div className="flex flex-col gap-4">
          <Link href="/signup" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold">
            Sign Up
          </Link>
          <Link href="/login" className="w-full bg-white border border-blue-600 text-blue-600 py-2 rounded hover:bg-blue-50 transition font-semibold">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
