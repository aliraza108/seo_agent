document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const suggestionChips = document.querySelectorAll('.chip');

    // Elements to hide
    const suggestionChipsContainer = document.querySelector('.suggestion-chips');
    const featuresSection = document.querySelector('.features-section');
    const footer = document.querySelector('footer');
    const highlightHeading = document.querySelector('.highlight-heading');
    
    let analysisCount = 201023;
    let isFirstMessageSent = false;
    
    function hideInitialElements() {
        if (suggestionChipsContainer) {
            suggestionChipsContainer.style.display = 'none';
        }
        if (featuresSection) {
            featuresSection.style.display = 'none';
        }
        if (footer) {
            footer.style.display = 'none';
        }
        if (highlightHeading) {
            highlightHeading.style.display = 'none';
        }
    }


    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        if (!isFirstMessageSent) {
            hideInitialElements();
            chatForm.style.marginBottom = '20px'; /* Adjust for final position */
            isFirstMessageSent = true;
        }

        addUserMessage(userMessage);
        userInput.value = '';
        
        await getBotResponse(userMessage);
    });

    suggestionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const suggestion = chip.dataset.suggestion;
            userInput.value = suggestion;
            chatForm.dispatchEvent(new Event('submit'));
        });
    });

    function addUserMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('user-message');
        messageElement.innerHTML = `<p>${message}</p>`;
        chatBox.appendChild(messageElement);
        scrollToBottom();
    }

    function addBotMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('bot-message');
        messageElement.innerHTML = `<p>${message}</p>`;
        chatBox.appendChild(messageElement);
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('bot-message', 'typing-indicator');
        typingElement.innerHTML = `<p><i>Analyzing...</i></p>`;
        chatBox.appendChild(typingElement);
        scrollToBottom();
    }

    function hideTypingIndicator() {
        const typingIndicator = chatBox.querySelector('.typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    function scrollToBottom() {
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    // public/script.js (only the relevant part shown)
    async function getBotResponse(userMessage) {
    showTypingIndicator();
    const apiUrl = '/api/chat';

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: userMessage }),
        });

        const text = await response.text();
        const contentType = response.headers.get('content-type') || '';

        if (!response.ok) {
            hideTypingIndicator();
            console.error('Server error', response.status, response.statusText, text);
            addBotMessage(`Server error ${response.status}: ${response.statusText}\n\n${text}`);
            return;
        }

        if (contentType.includes('application/json')) {
            const data = JSON.parse(text);
            addBotMessage((data.reply || JSON.stringify(data)).replace(/\n/g, '<br>'));
        } else {
            // If HTML comes back, show it so you see Vercel auth or other platform pages
            addBotMessage(`Unexpected response (not JSON):\n\n${text}`);
        }
    } catch (err) {
        console.error('Fetch failed', err);
        addBotMessage(String(err));
    } finally {
        hideTypingIndicator();
    }
}





});