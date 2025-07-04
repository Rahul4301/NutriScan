import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'
import { GoogleGenerativeAI } from 'npm:@google/generative-ai'

// Official Deno-compatible Supabase client import URL:

const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '')


serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } })
  }

  try {
    const { menuText } = await req.json()
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

    const prompt = `
      Analyze the following menu item and provide nutritional information:
      ${menuText}
      
      Please provide:
      1. Estimated calories
      2. Macronutrients (protein, carbs, fats)
      3. Key ingredients
      4. Any potential allergens
      5. Dietary categories (vegetarian, vegan, gluten-free, etc.)
    `

    const result = await model.generateContent(prompt)
    const response = await result.response

    // Store the result in Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    )

    await supabase.from('nutrition_analyses').insert({
      menu_text: menuText,
      analysis: response.text(),
      created_at: new Date().toISOString()
    })

    return new Response(
      JSON.stringify({ analysis: response.text() }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  } catch (error) {
    const message = typeof error === 'object' && error && 'message' in error
      ? (error as any).message
      : String(error)
    return new Response(
      JSON.stringify({ error: message }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      },
    )
  }
})
