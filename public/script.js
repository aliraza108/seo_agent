// document.addEventListener('DOMContentLoaded', () => {
//     const chatForm = document.getElementById('chat-form');
//     const userInput = document.getElementById('user-input');
//     const chatBox = document.getElementById('chat-box');
//     const suggestionChips = document.querySelectorAll('.chip');

//     const suggestionChipsContainer = document.querySelector('.suggestion-chips');
//     const featuresSection = document.querySelector('.features-section');
//     const footer = document.querySelector('footer');
//     const highlightHeading = document.querySelector('.highlight-heading');
    
//     let analysisCount = 201023;
//     let isFirstMessageSent = false;
    
//     function hideInitialElements() {
//         if (suggestionChipsContainer) {
//             suggestionChipsContainer.style.display = 'none';
//         }
//         if (featuresSection) {
//             featuresSection.style.display = 'none';
//         }
//         if (footer) {
//             footer.style.display = 'none';
//         }
//         if (highlightHeading) {
//             highlightHeading.style.display = 'none';
//         }
//     }


//     chatForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const userMessage = userInput.value.trim();
//         if (!userMessage) return;

//         if (!isFirstMessageSent) {
//             hideInitialElements();
//             chatForm.style.marginBottom = '20px';
//             isFirstMessageSent = true;
//         }

//         addUserMessage(userMessage);
//         userInput.value = '';
        
//         await getBotResponse(userMessage);
//     });

//     suggestionChips.forEach(chip => {
//         chip.addEventListener('click', () => {
//             const suggestion = chip.dataset.suggestion;
//             userInput.value = suggestion;
//             chatForm.dispatchEvent(new Event('submit'));
//         });
//     });

//     function addUserMessage(message) {
//         const messageElement = document.createElement('div');
//         messageElement.classList.add('user-message');
//         messageElement.innerHTML = `<p>${message}</p>`;
//         chatBox.appendChild(messageElement);
//         scrollToBottom();
//     }

//     function addBotMessage(message) {
//         const messageElement = document.createElement('div');
//         messageElement.classList.add('bot-message');
//         messageElement.innerHTML = `<p>${message}</p>`;
//         chatBox.appendChild(messageElement);
//         scrollToBottom();
//     }
    
//     function showTypingIndicator() {
//         const typingElement = document.createElement('div');
//         typingElement.classList.add('bot-message', 'typing-indicator');
//         typingElement.innerHTML = `<p><i>Analyzing...</i></p>`;
//         chatBox.appendChild(typingElement);
//         scrollToBottom();
//     }

//     function hideTypingIndicator() {
//         const typingIndicator = chatBox.querySelector('.typing-indicator');
//         if (typingIndicator) {
//             typingIndicator.remove();
//         }
//     }

//     function scrollToBottom() {
//         chatBox.scrollTop = chatBox.scrollHeight;
//     }

//     async function getBotResponse(userMessage) {
//         showTypingIndicator();
//         const apiUrl = 'https://seo-agent-fastapi.vercel.app/chat';


//         try {
//             const response = await fetch(apiUrl, {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ message: userMessage }),
//             });

//             if (!response.ok) {
//                 throw new Error(`Network response was not ok: ${response.statusText}`);
//             }

//             const data = await response.json();
//             const botReply = data.reply;

//             hideTypingIndicator();
//             addBotMessage(botReply.replace(/\n/g, '<br>'));

//         } catch (error) {
//             console.error('Error fetching bot response:', error);
//             hideTypingIndicator();
//             addBotMessage(error);
//         }
//     }
// });


document.addEventListener('DOMContentLoaded', () => {
    const chatForm = document.getElementById('chat-form');
    const userInput = document.getElementById('user-input');
    const chatBox = document.getElementById('chat-box');
    const clearChatBtn = document.getElementById('clear-chat-btn');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');
    const initialBotMessage = chatBox.innerHTML;

    // ✅ Added references for hiding suggestions and expanding container
    const quickActions = document.querySelector('.quick-actions');
    const chatContainer = document.querySelector('.chat-container');
    let firstMessageSent = false;

    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const userMessage = userInput.value.trim();
        if (!userMessage) return;

        addUserMessage(userMessage);
        userInput.value = '';

        // ✅ Hide quick actions after first message
        if (!firstMessageSent) {
            if (quickActions) {
                quickActions.style.display = 'none';
            }
            chatContainer.classList.add('expanded');
            firstMessageSent = true;
        }

        await getBotResponse(userMessage);
    });

    clearChatBtn.addEventListener('click', () => {
        chatBox.innerHTML = initialBotMessage;
        firstMessageSent = false;

        // ✅ Restore quick actions when chat is cleared
        if (quickActions) {
            quickActions.style.display = 'flex';
        }
        chatContainer.classList.remove('expanded');
    });

    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const suggestion = btn.textContent.trim();
            userInput.value = suggestion;
            chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
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
        messageElement.innerHTML = `<i class="fa-solid fa-robot"></i><p>${message}</p>`;
        chatBox.appendChild(messageElement);
        scrollToBottom();
    }
    
    function showTypingIndicator() {
        const typingElement = document.createElement('div');
        typingElement.classList.add('bot-message', 'typing-indicator');
        typingElement.innerHTML = `<i class="fa-solid fa-robot"></i><p><i>Analyzing...</i></p>`;
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
        chatBox.parentElement.scrollTop = chatBox.parentElement.scrollHeight;
    }

    async function getBotResponse(userMessage) {
        showTypingIndicator();
        const apiUrl = 'https://seo-agent-fastapi.vercel.app/chat';

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
            addBotMessage(`Sorry, I encountered an error. Please try again. Details: ${error.message}`);
        }
    }
});
