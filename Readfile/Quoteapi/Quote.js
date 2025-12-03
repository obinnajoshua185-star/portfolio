// API Configuration
const API_BASE = "http://localhost:3001";

// DOM Elements
const loadQuotesBtn = document.getElementById("loadQuotes");
const refreshQuotesBtn = document.getElementById("refreshQuotes");
const clearQuotesBtn = document.getElementById("clearQuotes");
const searchInput = document.getElementById("searchInput");
const quotesContainer = document.getElementById("quotesContainer");
const messageDiv = document.getElementById("message");
const loadingMessageDiv = document.getElementById("loadingMessage");

// State Management
let allQuotes = [];
let filteredQuotes = [];

// Event Listeners
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

function initializeApp() {
  // Add event listeners to buttons
  loadQuotesBtn.addEventListener("click", loadAllQuotes);
  refreshQuotesBtn.addEventListener("click", refreshQuotes);
  clearQuotesBtn.addEventListener("click", clearQuotes);
  searchInput.addEventListener("input", handleSearch);

  // Show welcome message
  showWelcomeMessage();
}

// Main Functions
async function loadAllQuotes() {
  showLoading("Loading inspirational quotes...");

  try {
    const response = await fetch(`${API_BASE}/quotes`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    allQuotes = await response.json();
    filteredQuotes = [...allQuotes];

    displayQuotes(allQuotes);
    showMessage(`Successfully loaded ${allQuotes.length} quotes`, "success");
  } catch (error) {
    console.error("Error loading quotes:", error);
    showMessage(
      "Failed to load quotes. Please make sure the server is running on port 3000.",
      "error"
    );
    displayErrorState();
  } finally {
    hideLoading();
  }
}

async function refreshQuotes() {
  if (allQuotes.length === 0) {
    showMessage("No quotes to refresh. Please load quotes first.", "warning");
    return;
  }

  showLoading("Refreshing quotes...");

  try {
    // For demonstration, we'll shuffle the existing quotes
    // In a real app, you might fetch new data from the server
    const shuffledQuotes = [...allQuotes].sort(() => Math.random() - 0.5);
    displayQuotes(shuffledQuotes);
    showMessage("Quotes refreshed successfully!", "success");
  } catch (error) {
    console.error("Error refreshing quotes:", error);
    showMessage("Error refreshing quotes", "error");
  } finally {
    hideLoading();
  }
}

function clearQuotes() {
  allQuotes = [];
  filteredQuotes = [];
  searchInput.value = "";
  showWelcomeMessage();
  showMessage("All quotes cleared", "info");
}

function handleSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (searchTerm === "") {
    filteredQuotes = [...allQuotes];
  } else {
    filteredQuotes = allQuotes.filter(
      (quote) =>
        quote.quote.toLowerCase().includes(searchTerm) ||
        quote.author.toLowerCase().includes(searchTerm)
    );
  }

  if (filteredQuotes.length === 0 && allQuotes.length > 0) {
    displayNoResults();
  } else {
    displayQuotes(filteredQuotes);
  }
}

// Display Functions
function displayQuotes(quotes) {
  if (!quotes || quotes.length === 0) {
    displayNoResults();
    return;
  }

  const quotesHTML = quotes
    .map(
      (quote) => `
        <div class="quote-card" data-id="${quote.id}">
            <div class="quote-text">${escapeHtml(quote.quote)}</div>
            <div class="quote-author">${escapeHtml(quote.author)}</div>
        </div>
    `
    )
    .join("");

  quotesContainer.innerHTML = quotesHTML;
}

function displayNoResults() {
  quotesContainer.innerHTML = `
        <div class="no-results">
            <i class="fas fa-search"></i>
            <h3>No quotes found</h3>
            <p>Try adjusting your search terms or load quotes first</p>
        </div>
    `;
}

function displayErrorState() {
  quotesContainer.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Unable to load quotes</h3>
            <p>Please check if the server is running on port 3000</p>
            <button onclick="loadAllQuotes()" class="btn btn-primary">
                <i class="fas fa-redo"></i>
                Try Again
            </button>
        </div>
    `;
}

function showWelcomeMessage() {
  quotesContainer.innerHTML = `
        <div class="welcome-state">
            <i class="fas fa-lightbulb welcome-icon"></i>
            <h3>Welcome to Quote Explorer</h3>
            <p>Click "Load Quotes" to discover inspirational wisdom</p>
        </div>
    `;
}

// Utility Functions
function showMessage(text, type = "info") {
  // Remove any existing message classes
  messageDiv.className = "message";

  // Add appropriate class based on type
  messageDiv.classList.add(`message-${type}`);

  // Set message text
  messageDiv.innerHTML = `
        <i class="fas fa-${getIconForMessageType(type)}"></i>
        ${text}
    `;

  // Show the message
  messageDiv.style.display = "block";

  // Auto-hide success messages after 3 seconds
  if (type === "success") {
    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 3000);
  }
}

function getIconForMessageType(type) {
  const icons = {
    success: "check-circle",
    error: "exclamation-circle",
    warning: "exclamation-triangle",
    info: "info-circle",
  };
  return icons[type] || "info-circle";
}

function showLoading(text) {
  loadingMessageDiv.innerHTML = `
        <div class="loading-state">
            <i class="fas fa-spinner fa-spin"></i>
            ${text}
        </div>
    `;
  loadingMessageDiv.style.display = "block";
}

function hideLoading() {
  loadingMessageDiv.style.display = "none";
}

function escapeHtml(unsafe) {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Add these styles to your CSS for the new states
const additionalStyles = `
    .message {
        display: none;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        font-weight: 500;
        text-align: center;
        margin-bottom: 1rem;
        animation: slideIn 0.3s ease;
    }
    
    .message-success {
        background: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .message-error {
        background: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .message-warning {
        background: #fff3cd;
        color: #856404;
        border: 1px solid #ffeaa7;
    }
    
    .message-info {
        background: #d1ecf1;
        color: #0c5460;
        border: 1px solid #bee5eb;
    }
    
    .loading-state {
        text-align: center;
        color: white;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
    }
    
    .no-results, .error-state {
        grid-column: 1 / -1;
        text-align: center;
        padding: 3rem 2rem;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border-radius: 20px;
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .no-results i, .error-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        color: var(--success-color);
    }
    
    .error-state i {
        color: var(--warning-color);
    }
    
    .fa-spin {
        animation: fa-spin 1s infinite linear;
    }
    
    @keyframes fa-spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
`;

// Inject additional styles
const styleSheet = document.createElement("style");
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
