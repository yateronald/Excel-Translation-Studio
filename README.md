# Excel Translation Studio 🌐📊

## 🚀 Project Overview

Excel Translation Studio is an advanced, AI-powered web application designed to seamlessly translate Excel files across multiple languages while preserving the original document's formatting and structure. Leveraging cutting-edge language models from various AI providers, this tool offers a robust, user-friendly solution for multilingual document translation.

## ✨ Key Features

### 🤖 Multi-Provider AI Translation

- Supports multiple AI translation providers:
  - OpenAI
  - Anthropic Claude
  - Google AI
  - Groq AI

### 🌍 Comprehensive Language Support

- Translate to 15+ languages, including:
  - Spanish
  - French
  - German
  - Italian
  - Portuguese
  - Chinese
  - Japanese
  - And more!

### 💡 Advanced Translation Capabilities

- Preserves original Excel file formatting
- Maintains cell styles, merges, and structures
- Supports .xlsx and .xls file formats
- Real-time translation progress tracking

## 🛠 Technology Stack

### Frontend

- React
- Tailwind CSS
- Framer Motion
- Axios
- React Hot Toast

### Backend

- Python Flask
- OpenAI API
- Anthropic API
- Groq AI
- LangDetect
- Pandas
- OpenPyXL

## 📦 Installation

### Prerequisites

- Python 3.8+
- Node.js 14+
- npm or yarn

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate # On Windows, use venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env
# Edit .env with your API keys
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

## 🔐 Configuration

### Environment Variables

Create a `.env` file in the backend directory with:

```
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GROQ_API_KEY=your_groq_key
GOOGLE_API_KEY=your_google_key
```

## 🚀 Running the Application

### Development Mode

```bash
# Start backend
cd backend
flask run

# Start frontend (in another terminal)
cd frontend
npm start
```

## 🌟 Usage Guide

1. Select AI Provider
2. Choose Translation Model
3. Select Target Language
4. Upload Excel File
5. Click "Translate"
6. Download Translated File

## 🔍 How It Works

1. File Upload
   - Supports drag-and-drop and file selection
   - Validates Excel file format
2. Translation Process
   - Detects source language
   - Translates cell contents
   - Preserves original formatting
   - Provides real-time progress updates

## 🛡 Error Handling

- Comprehensive error messaging
- Fallback to default translation provider
- Graceful error recovery

## 📊 Supported Translation Providers

| Provider  | Description             | Unique Features                 |
| --------- | ----------------------- | ------------------------------- |
| Groq AI   | High-speed translations | Low-latency models              |
| OpenAI    | Versatile translations  | Advanced language understanding |
| Anthropic | Contextual translations | Nuanced interpretation          |
| Google AI | Multilingual support    | Robust language detection       |

## 🔮 Future Roadmap

- [ ] Add more language support
- [ ] Implement offline translation mode
- [ ] Enhance AI model selection
- [ ] Improve translation accuracy
- [ ] Add batch translation feature

## 💡 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🤝 Support

For support, please open an issue in the GitHub repository or contact the maintainers.

## 👥 Contributors

- [yate Asseke Ronald]

**Made with ❤️ by Yate Asseke**
