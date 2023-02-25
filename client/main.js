import bot from './public/bot.svg';
import user from './public/user.svg';

const chatItems = document.getElementById('chat-items');
const submitBtn = document.getElementById('submit');
const textarea = document.querySelector('textarea');
const form = document.querySelector('form');

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function userMessageRender(value) {
  return `<div class="user-message">
            <img src="${user}" alt="user" />
            <div class="user-question">
              ${value}
            </div>
          </div>
        `;
}

function botMessageRender(value, uniqueId) {
  return `<div class="bot-message">
            <img src="${bot}" alt="bot" />
            <div class="bot-answer" id=${uniqueId}>
              ${value}
            </div>
          </div>
        `;
}

let loadInterval;

function loader(element) {
  element.textContent = '';

  loadInterval = setInterval(() => {
    // Update the text content of the loading indicator
    element.textContent += '.';

    // If the loading indicator has reached three dots, reset it
    if (element.textContent === '....') {
      element.textContent = '';
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

submitBtn.addEventListener('click', async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  chatItems.innerHTML += userMessageRender(data.get('prompt'));

  form.reset();

  const uniqueId = generateUniqueId();

  chatItems.innerHTML += botMessageRender('', uniqueId);

  chatItems.scrollTop = chatItems.scrollHeight;

  const botMessageContainer = document.getElementById(uniqueId);

  loader(botMessageContainer);

  const response = await fetch('https://chat-gpt-8pmm.onrender.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: data.get('prompt'),
    }),
  });

  clearInterval(loadInterval);

  botMessageContainer.innerHTML = '';

  if (response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();

    typeText(botMessageContainer, parsedData);
  } else {
    const err = await response.text();
    botMessageContainer.innerHTML = 'Что то пошло не так';

    alert(err);
  }
});

form.addEventListener('keypress', function enterKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    submit.click();
  }
});
