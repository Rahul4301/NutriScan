import subprocess
from google import genai

import os
os.environ["GOOGLE_API_KEY"] = "AIzaSyAPUX75_J0wmJN_lbqBOGjqETglNIDrGGY"

# Initialize Gemini client
client = genai.Client()

# Welcome message
print("🔮 AI Terminal (powered by Gemini)")
print("Type a natural language command (e.g., 'install python')")
print("Type 'exit' to quit.\n")

while True:
    # Get user input
    user_input = input("AI-Terminal > ")

    if user_input.lower() in ["exit", "quit"]:
        print("Goodbye!")
        break

    # Generate shell command from natural language
    try:
        prompt = f"""Translate the following natural language command into a safe MacOS shell command. 
Only return the command, nothing else. for installing python files, do pip install <package_name>. if command doesnt work, try using pip 3 or python3 install <package_name>. Do NOT explain.
User input: {user_input}
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        shell_command = response.text.strip()

        # Confirm with user before executing
        print(f"🧠 Gemini suggests: `{shell_command}`")
        confirm = input("Do you want to run this command? (y/n): ").strip().lower()

        if confirm == "y":
            subprocess.run(shell_command, shell=True)
        else:
            print("Command cancelled.\n")

    except Exception as e:
        print(f"⚠️ Error: {e}")
