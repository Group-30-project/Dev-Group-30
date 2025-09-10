  const chatForm = document.getElementById('chatForm');
  const chatMessages = document.getElementById('chatMessages');
  const userInput = document.getElementById('userInput');
  const clearChatBtn = document.getElementById('clearChatBtn');
  const hamburgerBtn = document.getElementById('hamburgerBtn');
  const sidebar = document.getElementById('sidebar');
  const mainContent = document.getElementById('mainContent');
  const aiChat = document.getElementById('aiChat');
  const contentDiv = document.getElementById('content');
  const workNewsBtn = document.getElementById('workNewsBtn');
  const OPENAI_API_KEY = ' process.env.OPENAI_KEY';
  hamburgerBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    mainContent.classList.toggle('shifted');
    aiChat.classList.toggle('shifted');
    document.body.classList.toggle('sidebar-open');
  });
  document.body.addEventListener('click', (e) => {
    if (
      sidebar.classList.contains('open') &&
      !sidebar.contains(e.target) &&
      e.target !== hamburgerBtn &&
      !hamburgerBtn.contains(e.target)
    ) {
      sidebar.classList.remove('open');
      mainContent.classList.remove('shifted');
      aiChat.classList.remove('shifted');
      document.body.classList.remove('sidebar-open');
    }
  });
  hamburgerBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      hamburgerBtn.click();
    }
  });
  function addMessage(text, sender) {
    const msgDiv = document.createElement('div');
    msgDiv.classList.add('message', sender);
    msgDiv.textContent = text;
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  clearChatBtn.addEventListener('click', () => {
    chatMessages.innerHTML = '';
    userInput.focus();
  });

  async function fetchRandomJobInfo() {
    const query = "jobs";
    const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(query)}&num=10`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.items && data.items.length > 0) {
        let items = data.items;
        let selected = [];

        while (selected.length < 3 && items.length > 0) {
          const randIndex = Math.floor(Math.random() * items.length);
          selected.push(items[randIndex]);
          items.splice(randIndex, 1);
        }

        let html = '<h3>Random Job Information</h3><ul>';
        selected.forEach(item => {
          html += `
            <li>
              <a href="${item.link}" target="_blank" rel="noopener">${item.title}</a>
              <p>${item.snippet}</p>
            </li>
          `;
        });
        html += '</ul>';

        contentDiv.innerHTML = html;
      } else {
        contentDiv.innerHTML = '<p>No job information available at the moment.</p>';
      }
    } catch (err) {
      console.error("Error fetching job info:", err);
      contentDiv.innerHTML = '<p>Error loading job information.</p>';
    }
  }

  
  async function sendMessageToOpenAI(message) {
    addMessage("...", "ai");
    const msgEls = chatMessages.querySelectorAll(".message.ai");
    msgEls[msgEls.length-1].textContent = "...";

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{role: "user", content: message}],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });
      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || "Sorry, I couldn't process that.";
      msgEls[msgEls.length-1].textContent = aiMessage;
    } catch (err) {
      msgEls[msgEls.length-1].textContent = "Error contacting Google news.";
      console.error(err);
    }
  }
  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';
    userInput.focus();

    if (message.toLowerCase().includes("job")) {
      const url = `https://www.googleapis.com/customsearch/v1?key=${GOOGLE_API_KEY}&cx=${GOOGLE_CSE_ID}&q=${encodeURIComponent(message)}&num=5`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.items && data.items.length > 0) {
          let html = `<h3>Job Advertisement Dashboard</h3><ul>`;
          data.items.forEach(r => {
            html += `
              <li style="margin-bottom: 15px;">
                <a href="${r.link}" target="_blank" style="font-weight:600; color:#3498db; text-decoration:none;">${r.title}</a>
                <p style="margin: 5px 0; color:#555;">${r.snippet}</p>
              </li>
            `;
          });
          html += '</ul>';
          contentDiv.innerHTML = html;
          addMessage("I've updated the job dashboard with the latest job info from Google.", 'ai');
        } else {
          contentDiv.innerHTML = `
            <h3>Job Advertisement Dashboard</h3>
            <p>No job info found for your query.</p>
          `;
          addMessage("I couldn't find any job info for that.", );
        }
      } catch (err) {
        contentDiv.innerHTML = '<p>Error loading job information.</p>';
        addMessage("Error fetching job info from Google.", );
        console.error(err);
      }
    } else {
      await sendMessageToOpenAI(message);
    }
  });
  workNewsBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    contentDiv.innerHTML = `<p>search....about job from news......</p>`;
    try {
      const prompt = "your name is can you tell about the job from CNN or BCC and don say sure or hi just whitou any greeting just send today job is like like that make it like a not don;t say 1 ieuwb 2d tis make like not oj send a 1000000 news about it ok";
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
          max_tokens: 300,
        }),
      });
      const data = await response.json();
      const aiMessage = data.choices?.[0]?.message?.content || "Sorry, no news available.";
      contentDiv.innerHTML = `
        <h3>Work News Around the World</h3>
        <p>${aiMessage.replace(/\n/g, "<br>")}</p>
      `;
    } catch (error) {
      console.error("Error fetching work news:", error);
      contentDiv.innerHTML = `<p>Error loading news. Try again later.</p>`;
    }
  });
 
  window.addEventListener('DOMContentLoaded', fetchRandomJobInfo);