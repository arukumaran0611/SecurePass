# SecurePass - Password Strength Checker & Generator

A clean, minimal web application for checking password strength and generating secure passwords. Built with Flask and featuring a black and white design using Apple's system font.

## Features

- **Password Strength Analysis**: Checks length, character variety, and complexity
- **Visual Strength Cards**: Interactive cards showing Weak, Medium, and Strong password levels
- **Strength Percentage**: Shows exact strength percentage (0-100%)
- **Breach Detection**: Uses Have I Been Pwned API to check if passwords have been compromised
- **Password Generation**: Creates strong, random passwords with customizable options
- **Password History**: Tracks recently checked passwords (stored locally)
- **Dark Mode**: Toggle between light and dark themes
- **AI-Powered Suggestions**: OpenAI integration for personalized security advice (optional)
- **Password Tips**: Educational cards with security best practices
- **Enhanced Mobile Experience**: Fully responsive design with touch-friendly interactions
- **Password Visibility Toggle**: Eye button to show/hide password while typing
- **Real-time Feedback**: Instant password strength checking as you type

## Project Structure

```
securepass/
│
├─ app.py               # Main Flask backend
├─ requirements.txt     # Python dependencies
├─ templates/
│   └─ index.html       # Frontend HTML
└─ static/
    ├─ style.css        # CSS styling
    └─ script.js        # JS for frontend interactivity
```

## Installation & Setup

1. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

2. **Run the Application**:
   ```bash
   python app.py
   ```

3. **Configure OpenAI (Optional)**:
   To enable AI-powered password suggestions, set your OpenAI API key:
   ```bash
   export OPENAI_API_KEY="your_api_key_here"
   ```
   Get your free API key from: https://platform.openai.com/api-keys

4. **Access the Application**:
   Open your browser and navigate to `http://localhost:5001`

## API Endpoints

### Check Password Strength
- **POST** `/check_password`
- **Body**: `{"password": "your_password"}`
- **Response**: Password strength analysis and breach status

### Generate Password
- **POST** `/generate_password`
- **Body**: `{"length": 16, "include_symbols": true, "include_numbers": true}`
- **Response**: Generated secure password

## Security Features

- Passwords are never stored or logged
- Uses secure random generation for password creation
- Integrates with Have I Been Pwned API for breach checking
- Client-side password handling with secure transmission

## Technologies Used

- **Backend**: Flask (Python)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **APIs**: Have I Been Pwned API
- **Fonts**: Apple System Fonts (-apple-system, SF Pro Display)

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source and available under the MIT License.
