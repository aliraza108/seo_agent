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

    async function getBotResponse(userMessage) {
        showTypingIndicator();
        const apiUrl = 'http://localhost:8000/api/chat'; 

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: userMessage }),
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const data = await response.json();
            const botReply = data.reply;

            hideTypingIndicator();
            addBotMessage(botReply.replace(/\n/g, '<br>'));

        } catch (error) {
            console.error('Error fetching bot response:', error);
            hideTypingIndicator();
            addBotMessage("Sorry, I'm having trouble connecting to my brain right now. Please check the server console and try again.");
        }
    }
});