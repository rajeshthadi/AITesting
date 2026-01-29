document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const chatContainer = document.getElementById('chat-container');

    const API_URL = "http://127.0.0.1:8000/api/generate";

    // Auto-focus input
    input.focus();

    // Event Listeners
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    async function sendMessage() {
        const text = input.value.trim();
        if (!text) return;

        // 1. Add User Message
        addMessage(text, 'user');
        input.value = '';
        input.disabled = true;
        sendBtn.disabled = true;

        // 2. Add Loading Indicator
        const loadingId = addLoading();

        try {
            // 3. Call API
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input_text: text })
            });

            const data = await response.json();

            // Remove loading
            removeMessage(loadingId);

            if (data.status === 'success') {
                // 4. Show AI Response (Simple markdown parsing for code blocks)
                const formattedText = formatResponse(data.data);
                addMessage(formattedText, 'ai', true);
            } else {
                addMessage(`❌ Error: ${data.message || 'Unknown error code'}`, 'ai');
            }

        } catch (error) {
            removeMessage(loadingId);
            addMessage(`❌ Network Error: Is the backend running? (${error.message})`, 'ai');
        } finally {
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }
    }

    function addMessage(text, sender, isHtml = false) {
        const div = document.createElement('div');
        div.className = `message ${sender}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.textContent = sender === 'user' ? '👤' : '🤖';

        const content = document.createElement('div');
        content.className = 'content';
        if (isHtml) {
            content.innerHTML = text;
        } else {
            content.textContent = text;
        }

        if (sender === 'user') {
            div.appendChild(content);
            div.appendChild(avatar);
        } else {
            div.appendChild(avatar);
            div.appendChild(content);
        }

        chatContainer.appendChild(div);
        scrollToBottom();
        return div.id = 'msg-' + Date.now();
    }

    function addLoading() {
        const div = document.createElement('div');
        div.className = 'message ai-message';
        div.id = 'loading-' + Date.now();

        div.innerHTML = `
            <div class="avatar">🤖</div>
            <div class="content">
                <div class="typing-indicator">
                    <div class="dot"></div>
                    <div class="dot"></div>
                    <div class="dot"></div>
                </div>
            </div>
        `;
        chatContainer.appendChild(div);
        scrollToBottom();
        return div.id;
    }

    function removeMessage(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function scrollToBottom() {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }

    // Simple Markdown Formatter for Code Blocks
    function formatResponse(text) {
        // Detect ``` code blocks
        return text.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/\n/g, '<br>');
    }
});
