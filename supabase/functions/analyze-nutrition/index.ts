import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { GoogleGenerativeAI } from 'npm:@google/generative-ai';
const genAI = new GoogleGenerativeAI(Deno.env.get('GEMINI_API_KEY') || '');
serve(async (req)=>{
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  console.log('📩 Incoming request received');
  try {
    const { menuText } = await req.json();
    console.log('📜 Menu Text:', menuText);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash'
    });
    const prompt = `
      Analyze the following menu item and provide nutritional information:
      ${menuText}
      
      Please provide:
      1. Estimated calories
      2. Macronutrients (protein, carbs, fats)
      3. Key ingredients
      4. Any potential allergens
      5. Dietary categories (vegetarian, vegan, gluten-free, etc.)

      do not include any disclaimers or additional information, just the analysis ( display it as x kcal, x g protein, x g carbs, x g fats).
    `;
    console.log('🧠 Sending prompt to Gemini...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('✅ Gemini response received');
    console.log(response);
    console.log('📊 Analysis:', response.text());
    const supabase = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');
    const { error: dbError } = await supabase.from('nutrition_analyses').insert({
      menu_txt: menuText,
      analysis: response.text(),
      created_at: new Date().toISOString()
    });
    if (dbError) {
      console.error('❌ Error inserting into Supabase:', dbError);
      throw new Error('Failed to insert into database');
    }
    console.log('📥 Analysis saved to Supabase');
    return new Response(JSON.stringify({
      analysis: response.text()
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    const message = typeof error === 'object' && error && 'message' in error ? error.message : String(error);
    console.error('🔥 Error occurred:', message);
    return new Response(JSON.stringify({
      error: message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
