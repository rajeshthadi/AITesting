
import streamlit as st
import sys
import os
import json

# Add current directory to path so we can import tools
sys.path.append(os.getcwd())
from tools.generate_logic import generate_test_case

# Page Config
st.set_page_config(
    page_title="Ollama Test Generator",
    page_icon="🧪",
    layout="centered"
)

# Custom CSS for "Premium" feel
st.markdown("""
<style>
    .stChatInputContainer {
        padding-bottom: 20px;
    }
    .stChatMessage {
        background-color: #f0f2f6;
        border-radius: 10px;
        padding: 10px;
        margin-bottom: 10px;
    }
    .stChatMessage.user {
        background-color: #e8f0fe;
    }
    .stMarkdown code {
        background-color: #e9ecef !important;
        color: #d63384 !important;
    }
</style>
""", unsafe_allow_html=True)

# Title
st.title("🧪 Local LLM Test Case Generator")
st.markdown("Generate Python `unittest` or `pytest` suites instantly using **Ollama (Llama 3.2)**.")

# Initialize Chat History
if "messages" not in st.session_state:
    st.session_state.messages = []

# Display Chat History
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# User Input
if prompt := st.chat_input("Describe the function you need to test..."):
    # 1. Display User Message
    with st.chat_message("user"):
        st.markdown(prompt)
    st.session_state.messages.append({"role": "user", "content": prompt})

    # 2. Generate Response
    with st.chat_message("assistant"):
        with st.spinner("Generating test cases with Llama 3.2..."):
            result = generate_test_case(prompt)
            
            if result["status"] == "success":
                response_text = result["data"]
                # 3. Stream/Display Output
                st.markdown(response_text)
                st.session_state.messages.append({"role": "assistant", "content": response_text})
                
                # Show Metadata
                meta = result.get("metadata", {})
                duration = meta.get("duration", 0) / 1e9  # Convert nanoseconds to seconds
                st.caption(f"Generated in {duration:.2f}s using {meta.get('model')}")
            else:
                error_msg = f"❌ Error: {result.get('message')}"
                st.error(error_msg)
                st.session_state.messages.append({"role": "assistant", "content": error_msg})
