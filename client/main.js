import user from './public/user.svg';
import bot from './public/bot.svg';

const chatItems = document.getElementById('chat-items');
const submitBtn = document.getElementById('submit');
const textarea = document.querySelector('textarea');
const form = document.querySelector('form');

const lastQuestionContainer = document.getElementById('last-questions-items');
const lastQuestionsItemsClearBtn = document.getElementById('last-questions-items-clear');

const openSidebarBtn = document.getElementById('open');
const closeSidebarBtn = document.getElementById('close');
const sidebar = document.getElementById('sidebar');

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function userMessageRender(value) {
  return `<div class="user-message">
            <img src=${user} alt="user" />
            <pre class="user-question">
              ${value}
            </pre>
          </div>
        `;
}

function botMessageRender(value, uniqueId) {
  return `<div class="bot-message">
            <img src=${bot} alt="bot" />
            <i id="botAnswerCopy" class="fa-solid fa-clipboard"></i>
            <div class="bot-answer" id=${uniqueId}>
              ${value}
            </div>
          </div>
        `;
}

function lasQuestionRender(value) {
  return `<li class="long-text-hidden">
            <i class="fa-regular fa-comment"></i>
            ${value}
            <i id="copyBtn" class="fa-solid fa-clipboard"></i>
          </li>
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

  textarea.style.height = '55px';

  lastQuestionContainer.innerHTML += lasQuestionRender(data.get('prompt'));

  lastQuestionCopy();

  const uniqueId = generateUniqueId();

  chatItems.innerHTML += botMessageRender('', uniqueId);

  chatItems.scrollTop = chatItems.scrollHeight;

  const botMessageContainer = document.getElementById(uniqueId);

  loader(botMessageContainer);

  botAnswerCopy();

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

lastQuestionsItemsClearBtn.addEventListener('click', (e) => {
  e.preventDefault();
  lastQuestionContainer.innerHTML = '';
});

openSidebarBtn.addEventListener('click', (e) => {
  openSidebarBtn.style.display = 'none';
  closeSidebarBtn.style.display = 'inline-block';
  sidebar.style.display = 'flex';
});

closeSidebarBtn.addEventListener('click', (e) => {
  openSidebarBtn.style.display = 'inline-block';
  closeSidebarBtn.style.display = 'none';
  sidebar.style.display = 'none';
});

textarea.addEventListener('input', (e) => {
  textarea.style.height = '55px';
  let scHeight = e.target.scrollHeight;
  textarea.style.height = `${scHeight}px`;
});

function lastQuestionCopy() {
  const copyBtns = document.querySelectorAll('#copyBtn');
  for (const copyBtn of copyBtns) {
    copyBtn.addEventListener('click', (e) => {
      let itemData = copyBtn.parentElement;
      var inp = document.createElement('input');
      inp.value = itemData.innerText;
      document.body.appendChild(inp);
      inp.select();
      if (document.execCommand('copy')) {
        console.log('success');
      } else {
        console.log('error');
      }

      document.body.removeChild(inp);
    });
  }
}

function botAnswerCopy() {
  const botAnswerCopyBtns = document.querySelectorAll('#botAnswerCopy');
  for (const botAnswerCopyBtn of botAnswerCopyBtns) {
    botAnswerCopyBtn.addEventListener('click', (e) => {
      let itemData = botAnswerCopyBtn.parentElement.children[2];
      var inp = document.createElement('input');
      inp.value = itemData.innerText;
      document.body.appendChild(inp);
      inp.select();
      if (document.execCommand('copy')) {
        console.log('success');
      } else {
        console.log('error');
      }

      document.body.removeChild(inp);
    });
  }
}
