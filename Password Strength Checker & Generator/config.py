import os

# OpenAI API Configuration
# To use AI features, set your OpenAI API key as an environment variable:
# export OPENAI_API_KEY="your_api_key_here"
# 
# Or create a .env file with:
# OPENAI_API_KEY=your_api_key_here

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# You can get a free OpenAI API key from: https://platform.openai.com/api-keys
# The free tier provides $5 in credits which is plenty for testing
