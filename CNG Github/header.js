// header.js - Dynamic Header, Navigation, Dark Mode, and Chatbot Injector
(function () {
  document.addEventListener("DOMContentLoaded", () => {
    // 1. Injects DB script fallback just in case
    if (!window.CNG_DB) {
      console.warn("db.js not loaded. Make sure it is imported before header.js");
    }

    // 2. Setup theme toggle state on body
    const currentTheme = localStorage.getItem("cng_theme") || "light";
    document.body.setAttribute("data-theme", currentTheme);

    // 3. Render Header
    renderHeader();

    // 4. Inject Chatbot Widget
    injectChatbot();

    // 5. Inject CSS alerts (Standard modal overlay helper if not present)
    injectModalHTML();
  });

  function renderHeader() {
    const headerEl = document.querySelector("header");
    if (!headerEl) return;

    const loggedInUser = window.CNG_DB ? window.CNG_DB.getLoggedInUser() : null;
    const currentPath = window.location.pathname.split("/").pop() || "index.html";

    // Build nav HTML dynamically
    let navHTML = `<a href="index.html" class="${currentPath === 'index.html' ? 'active' : ''}">Home</a>`;

    if (!loggedInUser) {
      navHTML += `<a href="login_register.html" class="${currentPath === 'login_register.html' ? 'active' : ''}">Login/Register</a>`;
    }

    navHTML += `<a href="pumps.html" class="${currentPath === 'pumps.html' ? 'active' : ''}">Pump Locator</a>`;
    navHTML += `<a href="booking.html" class="${currentPath === 'booking.html' ? 'active' : ''}">Book Slot</a>`;

    if (loggedInUser) {
      navHTML += `<a href="details.html" class="${currentPath === 'details.html' ? 'active' : ''}">Dashboard / History</a>`;
    }

    navHTML += `<a href="support.html" class="${currentPath === 'support.html' ? 'active' : ''}">Support</a>`;
    navHTML += `<a href="contact.html" class="${currentPath === 'contact.html' ? 'active' : ''}">Contact</a>`;
    navHTML += `<a href="about.html" class="${currentPath === 'about.html' ? 'active' : ''}">About</a>`;

    if (loggedInUser) {
      navHTML += `<a href="#" id="logoutBtn" style="color: #ff9999;">Logout (${loggedInUser.username})</a>`;
    }

    // Theme Switch Icon
    const themeIcon = document.body.getAttribute("data-theme") === "dark" ? "☀️" : "🌙";

    headerEl.innerHTML = `
      <h1>CNG Booking System</h1>
      <nav>${navHTML}</nav>
      <button class="theme-switch" id="themeToggleBtn" title="Toggle Dark/Light Mode">${themeIcon}</button>
    `;

    // Logout Action
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.CNG_DB) {
          window.CNG_DB.logout();
          showNotification("Success", "Logged out successfully!", () => {
            window.location.href = "index.html";
          });
        }
      });
    }

    // Theme Switch Action
    const themeToggleBtn = document.getElementById("themeToggleBtn");
    if (themeToggleBtn) {
      themeToggleBtn.addEventListener("click", () => {
        const activeTheme = document.body.getAttribute("data-theme");
        const nextTheme = activeTheme === "dark" ? "light" : "dark";
        document.body.setAttribute("data-theme", nextTheme);
        localStorage.setItem("cng_theme", nextTheme);
        themeToggleBtn.textContent = nextTheme === "dark" ? "☀️" : "🌙";
      });
    }
  }

  // Common notification helper modal
  function injectModalHTML() {
    if (document.getElementById("notificationModal")) return;
    const modal = document.createElement("div");
    modal.className = "modal-overlay";
    modal.id = "notificationModal";
    modal.innerHTML = `
      <div class="modal-content">
        <h3 id="notificationTitle">Alert</h3>
        <p id="notificationMsg">Message details here.</p>
        <button class="btn" id="notificationCloseBtn">OK</button>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById("notificationCloseBtn").addEventListener("click", () => {
      modal.style.display = "none";
      if (window.modalCallback) {
        window.modalCallback();
        window.modalCallback = null;
      }
    });
  }

  // Globally accessible notification popup
  window.showNotification = function (title, message, callback) {
    const modal = document.getElementById("notificationModal");
    if (!modal) {
      alert(message);
      if (callback) callback();
      return;
    }
    document.getElementById("notificationTitle").textContent = title;
    document.getElementById("notificationMsg").textContent = message;
    window.modalCallback = callback;
    modal.style.display = "flex";
  };

  // Inject AI Chatbot
  function injectChatbot() {
    if (document.getElementById("cngChatbot")) return;

    const botContainer = document.createElement("div");
    botContainer.className = "chatbot-widget";
    botContainer.id = "cngChatbot";

    botContainer.innerHTML = `
      <div class="chatbot-window" id="chatWindow">
        <div class="chatbot-header">
          <span>💬 CNG Assistant</span>
          <button class="close-chat" id="closeChatBtn">&times;</button>
        </div>
        <div class="chatbot-messages" id="chatMessages">
          <div class="chat-bubble bot">Hello! I'm your CNG Assistant. How can I help you today?</div>
          <div class="chat-bubble bot" style="font-size: 0.8rem; background: transparent; padding: 0; color: #777;">
            Try asking: "pumps", "how to book", "prices", or "my status".
          </div>
        </div>
        <div class="chatbot-input-container">
          <input type="text" id="chatInput" placeholder="Type a message..." autocomplete="off">
          <button id="sendChatBtn">Send</button>
        </div>
      </div>
      <button class="chatbot-btn" id="toggleChatBtn" title="Need help? Talk to us!">💬</button>
    `;

    document.body.appendChild(botContainer);

    const toggleChatBtn = document.getElementById("toggleChatBtn");
    const closeChatBtn = document.getElementById("closeChatBtn");
    const chatWindow = document.getElementById("chatWindow");
    const chatInput = document.getElementById("chatInput");
    const sendChatBtn = document.getElementById("sendChatBtn");
    const chatMessages = document.getElementById("chatMessages");

    toggleChatBtn.addEventListener("click", () => {
      chatWindow.style.display = chatWindow.style.display === "flex" ? "none" : "flex";
      if (chatWindow.style.display === "flex") {
        chatInput.focus();
      }
    });

    closeChatBtn.addEventListener("click", () => {
      chatWindow.style.display = "none";
    });

    sendChatBtn.addEventListener("click", handleUserMessage);
    chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleUserMessage();
    });

    function addMessage(text, sender) {
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${sender}`;
      bubble.textContent = text;
      chatMessages.appendChild(bubble);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function handleUserMessage() {
      const query = chatInput.value.trim();
      if (!query) return;

      addMessage(query, "user");
      chatInput.value = "";

      // Bot thinking delay
      setTimeout(() => {
        const response = getBotResponse(query.toLowerCase());
        addMessage(response, "bot");
      }, 500);
    }

    function getBotResponse(query) {
      if (query.includes("how") && query.includes("book")) {
        return "To book a slot: 1. Login/Register. 2. Choose a pump on the Locator page. 3. Go to Book Slot page, pick a date & 15-min interval, complete the mock checkout, and view your confirmation QR code!";
      }
      if (query.includes("pump") || query.includes("station") || query.includes("locator")) {
        if (window.CNG_DB) {
          const pumps = window.CNG_DB.getPumps();
          const availPumps = pumps.filter(p => p.available);
          return `We track ${pumps.length} stations. Currently, ${availPumps.length} are available. Head to the 'Pump Locator' page to see them on the map and check current queues!`;
        }
        return "You can find nearby CNG stations and check their live queues on our Pump Locator page.";
      }
      if (query.includes("price") || query.includes("cost") || query.includes("rate")) {
        return "CNG prices are stable around ₹89.20 to ₹89.50 per kg at public stations, and ₹92.00 per kg at premium stations like Shell in Hyderabad.";
      }
      if (query.includes("status") || query.includes("my booking") || query.includes("countdown")) {
        const user = window.CNG_DB ? window.CNG_DB.getLoggedInUser() : null;
        if (!user) {
          return "Please Login or Register first to see your active bookings.";
        }
        const bookings = window.CNG_DB.getBookings(user.username);
        const active = bookings.filter(b => b.status === "Confirmed");
        if (active.length === 0) {
          return `Hi ${user.fullname}, you have no active CNG bookings. Go to 'Book Slot' to schedule one!`;
        }
        const next = active[active.length - 1];
        return `Hi ${user.fullname}, your latest active booking is at ${next.pump} scheduled for ${next.date} at ${next.time}. You can view the confirmation receipt details on your Dashboard.`;
      }
      if (query.includes("cancel") || query.includes("reschedule")) {
        return "You can cancel any active bookings directly from your Dashboard page. Just click the Cancel button next to your slot entry.";
      }
      if (query.includes("contact") || query.includes("phone") || query.includes("email")) {
        return "You can reach customer support at support@cngbookingsystem.com or call +91-6301069563.";
      }
      return "I'm here to help with your CNG Bookings! Feel free to ask about nearby 'pumps', 'how to book', CNG 'prices', or check your booking 'status'.";
    }
  }

})();
