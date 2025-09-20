from flask import Flask, render_template, request, jsonify
import requests
import hashlib
import secrets
import string
import re
import os
from openai import OpenAI
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Initialize OpenAI client
openai_client = None
openai_api_key = os.getenv('OPENAI_API_KEY')
if openai_api_key and openai_api_key != 'your_openai_api_key_here':
    try:
        openai_client = OpenAI(api_key=openai_api_key)
        print("✅ OpenAI client initialized successfully")
    except Exception as e:
        print(f"❌ Failed to initialize OpenAI client: {e}")
        openai_client = None
else:
    print("⚠️ OpenAI API key not configured. AI features will be disabled.")
    print("   To enable AI features, set OPENAI_API_KEY environment variable")
    print("   Get your free API key from: https://platform.openai.com/api-keys")

def check_password_strength(password):
    """Check password strength based on various criteria"""
    score = 0
    feedback = []
    
    # Length check
    if len(password) >= 8:
        score += 1
    else:
        feedback.append("Password should be at least 8 characters long")
    
    # Uppercase check
    if re.search(r'[A-Z]', password):
        score += 1
    else:
        feedback.append("Password should contain uppercase letters")
    
    # Lowercase check
    if re.search(r'[a-z]', password):
        score += 1
    else:
        feedback.append("Password should contain lowercase letters")
    
    # Digit check
    if re.search(r'\d', password):
        score += 1
    else:
        feedback.append("Password should contain numbers")
    
    # Special character check
    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
    else:
        feedback.append("Password should contain special characters")
    
    # Determine strength level
    if score <= 2:
        strength = "Weak"
    elif score <= 4:
        strength = "Medium"
    else:
        strength = "Strong"
    
    return {
        "strength": strength,
        "score": score,
        "max_score": 5,
        "feedback": feedback
    }

def check_password_breach(password):
    """Check if password has been breached using Have I Been Pwned API"""
    try:
        # Hash the password with SHA-1
        sha1_hash = hashlib.sha1(password.encode('utf-8')).hexdigest().upper()
        
        # Send first 5 characters to HIBP API
        prefix = sha1_hash[:5]
        suffix = sha1_hash[5:]
        
        url = f"https://api.pwnedpasswords.com/range/{prefix}"
        response = requests.get(url, timeout=5)
        
        if response.status_code == 200:
            # Check if our hash suffix is in the response
            for line in response.text.splitlines():
                if line.startswith(suffix):
                    count = int(line.split(':')[1])
                    return {
                        "breached": True,
                        "count": count
                    }
            return {"breached": False, "count": 0}
        else:
            return {"breached": False, "count": 0, "error": "API unavailable"}
    
    except Exception as e:
        return {"breached": False, "count": 0, "error": str(e)}

def generate_strong_password(length=16, include_symbols=True, include_numbers=True):
    """Generate a strong random password"""
    characters = string.ascii_letters
    
    if include_numbers:
        characters += string.digits
    
    if include_symbols:
        characters += "!@#$%^&*()_+-=[]{}|;:,.<>?"
    
    password = ''.join(secrets.choice(characters) for _ in range(length))
    
    # Ensure the password meets strength requirements
    while True:
        strength = check_password_strength(password)
        if strength["strength"] == "Strong":
            break
        password = ''.join(secrets.choice(characters) for _ in range(length))
    
    return password

def get_ai_password_suggestions(password, strength_data, breach_data):
    """Get AI-powered password security suggestions"""
    if not openai_client:
        return []
    
    try:
        # Create a prompt for AI suggestions
        prompt = f"""
        Analyze this password security situation and provide 3-5 concise, actionable security tips:
        
        Password: "{password[:10]}..." (length: {len(password)})
        Strength: {strength_data['strength']} (Score: {strength_data['score']}/5)
        Breach Status: {'Breached' if breach_data.get('breached') else 'Safe'}
        Issues: {', '.join(strength_data['feedback']) if strength_data['feedback'] else 'None'}
        
        Provide practical, specific advice for improving password security. Keep each tip under 50 words.
        Focus on actionable steps the user can take immediately.
        """
        
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a cybersecurity expert providing concise, actionable password security advice."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        # Parse the response into individual suggestions
        suggestions_text = response.choices[0].message.content.strip()
        suggestions = [s.strip() for s in suggestions_text.split('\n') if s.strip()]
        
        # Clean up the suggestions (remove numbering, bullets, etc.)
        cleaned_suggestions = []
        for suggestion in suggestions:
            # Remove common prefixes
            suggestion = re.sub(r'^[\d\.\-\*\•]\s*', '', suggestion)
            suggestion = re.sub(r'^[A-Za-z]+:\s*', '', suggestion)
            if suggestion and len(suggestion) > 10:  # Filter out very short suggestions
                cleaned_suggestions.append(suggestion)
        
        return cleaned_suggestions[:5]  # Return max 5 suggestions
        
    except Exception as e:
        print(f"OpenAI API error: {e}")
        return []

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/check_password', methods=['POST'])
def check_password():
    data = request.get_json()
    password = data.get('password', '')
    
    if not password:
        return jsonify({"error": "Password is required"}), 400
    
    # Check password strength
    strength_result = check_password_strength(password)
    
    # Check for breaches
    breach_result = check_password_breach(password)
    
    # Get AI suggestions
    ai_suggestions = get_ai_password_suggestions(password, strength_result, breach_result)
    
    return jsonify({
        "strength": strength_result,
        "breach": breach_result,
        "ai_suggestions": ai_suggestions
    })

@app.route('/generate_password', methods=['POST'])
def generate_password():
    data = request.get_json()
    length = data.get('length', 16)
    include_symbols = data.get('include_symbols', True)
    include_numbers = data.get('include_numbers', True)
    
    # Validate length
    if length < 8 or length > 128:
        return jsonify({"error": "Password length must be between 8 and 128 characters"}), 400
    
    password = generate_strong_password(length, include_symbols, include_numbers)
    
    return jsonify({
        "password": password,
        "length": len(password)
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)
