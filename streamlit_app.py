import streamlit as st
import google.generativeai as genai

# 1. Setup - This part pulls your key safely from Streamlit's hidden vault
api_key = st.secrets["GEMINI_API_KEY"]
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

# 2. UI - Building the look of your app
st.title("🤖 My Gemini AI Application")
user_input = st.text_input("Ask the AI something:", "Hello!")

if st.button("Generate Response"):
    response = model.generate_content(user_input)
    st.write(response.text)
