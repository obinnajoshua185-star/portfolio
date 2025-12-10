// Mobile menu toggle
const menuToggle = document.getElementById("menu-toggle");
const navbar = document.getElementById("navbar");

menuToggle.addEventListener("click", () => {
  navbar.classList.toggle("active");
});

// Close mobile menu when clicking a link
const navLinks = document.querySelectorAll("nav a");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    navbar.classList.remove("active");
  });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();

    const targetId = this.getAttribute("href");
    if (targetId === "#") return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      window.scrollTo({
        top: targetElement.offsetTop - 80,
        behavior: "smooth",
      });
    }
  });
});

// ============================================
// DUAL-OPTION CONTACT FORM WITH FORMSPREE & WHATSAPP
// ============================================

document.addEventListener("DOMContentLoaded", function () {
  // Initialize form elements
  const contactForm = document.getElementById("contactForm");
  const formStatus = document.getElementById("form-status");
  const sendEmailBtn = document.getElementById("sendEmailBtn");
  const sendWhatsAppBtn = document.getElementById("sendWhatsAppBtn");

  // Get your Formspree ID (REPLACE THIS!)
  const FORMSPREE_ENDPOINT = "https://formspree.io/f/xanrpyag";
  // Replace 'YOUR_FORMSPREE_ID_HERE' with your actual Formspree ID

  // WhatsApp number
  const WHATSAPP_NUMBER = "2348167561963"; // Your WhatsApp number without +

  // ========== HELPER FUNCTIONS ==========

  // Show toast notification
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="fas fa-${
        type === "success"
          ? "check-circle"
          : type === "error"
          ? "exclamation-circle"
          : "info-circle"
      }"></i>
      <span>${message}</span>
    `;

    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add("show"), 10);

    // Remove after 4 seconds
    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }

  // Copy email to clipboard
  window.copyEmail = function () {
    const email = "obinnajoshua185@gmail.com";
    navigator.clipboard
      .writeText(email)
      .then(() => {
        showToast("Email copied to clipboard!", "success");
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        showToast("Failed to copy email", "error");
      });
  };

  // Compose email
  window.composeEmail = function () {
    const subject = encodeURIComponent("Portfolio Inquiry");
    const body = encodeURIComponent(
      "Hello Joshua,\n\nI saw your portfolio and would like to connect.\n\nBest regards,"
    );
    window.location.href = `mailto:obinnajoshua185@gmail.com?subject=${subject}&body=${body}`;
  };

  // Open WhatsApp directly
  window.openWhatsApp = function () {
    const message = encodeURIComponent(
      "Hello Joshua! I saw your portfolio and would like to connect."
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  // Show form status
  function showFormStatus(message, type = "info") {
    formStatus.innerHTML = `
      <i class="fas fa-${
        type === "success"
          ? "check-circle"
          : type === "error"
          ? "exclamation-circle"
          : "info-circle"
      }"></i>
      ${message}
    `;
    formStatus.className = `form-status ${type}`;
    formStatus.style.display = "block";

    // Scroll to status
    formStatus.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  // Hide form status
  function hideFormStatus() {
    formStatus.style.display = "none";
  }

  // Show loading state on button
  function showLoading(button) {
    const originalHTML = button.innerHTML;
    button.setAttribute("data-original-html", originalHTML);
    button.innerHTML = '<span class="loading-spinner"></span> Processing...';
    button.disabled = true;
  }

  // Hide loading state on button
  function hideLoading(button) {
    const originalHTML = button.getAttribute("data-original-html");
    if (originalHTML) {
      button.innerHTML = originalHTML;
    }
    button.disabled = false;
  }

  // Validate form
  function validateForm() {
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const subject = document.getElementById("subject").value.trim();
    const message = document.getElementById("message").value.trim();

    // Reset previous errors
    hideFormStatus();

    if (!name || name.length < 2) {
      showFormStatus("Please enter your name (minimum 2 characters)", "error");
      return false;
    }

    if (!email) {
      showFormStatus("Please enter your email address", "error");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showFormStatus("Please enter a valid email address", "error");
      return false;
    }

    if (!subject || subject.length < 5) {
      showFormStatus("Please enter a subject (minimum 5 characters)", "error");
      return false;
    }

    if (!message || message.length < 20) {
      showFormStatus(
        "Please write a more detailed message (minimum 20 characters)",
        "error"
      );
      return false;
    }

    return true;
  }

  // Get form data as object
  function getFormData() {
    return {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      phone: document.getElementById("phone").value.trim() || "Not provided",
      subject: document.getElementById("subject").value.trim(),
      message: document.getElementById("message").value.trim(),
      timestamp: new Date().toISOString(),
      source: "Portfolio Website",
    };
  }

  // ========== EMAIL (FORMSPREE) FUNCTIONALITY ==========

  sendEmailBtn.addEventListener("click", async function () {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    const formData = getFormData();

    // Show loading
    showLoading(sendEmailBtn);
    showFormStatus("Sending your message via email...", "info");

    try {
      // Prepare data for Formspree
      const formDataObj = new FormData();
      formDataObj.append("name", formData.name);
      formDataObj.append("email", formData.email);
      formDataObj.append("phone", formData.phone);
      formDataObj.append("subject", formData.subject);
      formDataObj.append("message", formData.message);
      formDataObj.append("_subject", `Portfolio Message: ${formData.subject}`);
      formDataObj.append("_replyto", formData.email);
      formDataObj.append("_format", "plain");

      // Send to Formspree
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        body: formDataObj,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        // Success
        showFormStatus(
          "✅ Message sent successfully! I'll reply to your email soon.",
          "success"
        );
        showToast("Message sent via email!", "success");

        // Clear form (optional)
        // contactForm.reset();

        // Log success
        console.log("Email sent via Formspree:", formData);
      } else {
        // Formspree error
        const error = await response.json();
        showFormStatus(
          `Failed to send email: ${error.error || "Please try again"}`,
          "error"
        );
        showToast("Failed to send email", "error");
      }
    } catch (error) {
      // Network error
      console.error("Email submission error:", error);
      showFormStatus("Network error. Please check your connection.", "error");
      showToast("Network error. Please try again.", "error");
    } finally {
      // Hide loading
      hideLoading(sendEmailBtn);
    }
  });

  // ========== WHATSAPP FUNCTIONALITY ==========

  sendWhatsAppBtn.addEventListener("click", function () {
    // Validate form first
    if (!validateForm()) {
      return;
    }

    const formData = getFormData();

    // Show loading
    showLoading(sendWhatsAppBtn);
    showFormStatus("Preparing WhatsApp message...", "info");

    // Format WhatsApp message
    let whatsappMessage = `*New Portfolio Inquiry*\n\n`;
    whatsappMessage += `👤 *Name:* ${formData.name}\n`;
    whatsappMessage += `📧 *Email:* ${formData.email}\n`;
    if (formData.phone !== "Not provided") {
      whatsappMessage += `📱 *Phone:* ${formData.phone}\n`;
    }
    whatsappMessage += `📋 *Subject:* ${formData.subject}\n\n`;
    whatsappMessage += `💬 *Message:*\n${formData.message}\n\n`;
    whatsappMessage += `---\n`;
    whatsappMessage += `Sent from portfolio website at ${new Date().toLocaleString()}`;

    // Encode for WhatsApp URL
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappURL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    // Show success message
    setTimeout(() => {
      showFormStatus(
        "✅ Opening WhatsApp... Send the pre-filled message.",
        "success"
      );
      showToast("Opening WhatsApp with your message", "success");

      // Open WhatsApp in new tab
      window.open(whatsappURL, "_blank");

      // Hide loading
      hideLoading(sendWhatsAppBtn);

      // Clear form status after delay
      setTimeout(() => {
        hideFormStatus();
      }, 5000);
    }, 1000);
  });

  // ========== FORM UTILITIES ==========

  // Real-time validation
  const formInputs = contactForm.querySelectorAll(".form-control");
  formInputs.forEach((input) => {
    input.addEventListener("input", function () {
      if (this.value.trim()) {
        this.classList.add("touched");
      }

      // Hide errors when user starts typing
      if (formStatus.classList.contains("error") && this.value.trim()) {
        hideFormStatus();
      }
    });
  });

  // Auto-save form data
  const FORM_STORAGE_KEY = "portfolio_form_draft";

  function saveFormDraft() {
    const draft = {};
    formInputs.forEach((input) => {
      draft[input.id] = input.value;
    });
    localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(draft));
  }

  function loadFormDraft() {
    const draft = localStorage.getItem(FORM_STORAGE_KEY);
    if (draft) {
      const data = JSON.parse(draft);
      formInputs.forEach((input) => {
        if (data[input.id]) {
          input.value = data[input.id];
          if (data[input.id].trim()) {
            input.classList.add("touched");
          }
        }
      });

      // Show restore notification
      showToast("Previous form data restored", "info");
    }
  }

  function clearFormDraft() {
    localStorage.removeItem(FORM_STORAGE_KEY);
  }

  // Auto-save every 3 seconds
  let saveTimer;
  contactForm.addEventListener("input", function () {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveFormDraft, 3000);
  });

  // Load draft on page load
  loadFormDraft();

  // Clear draft on successful submission
  [sendEmailBtn, sendWhatsAppBtn].forEach((btn) => {
    btn.addEventListener("click", function () {
      setTimeout(clearFormDraft, 1000);
    });
  });

  // Clear form button (optional)
  const clearBtn = document.createElement("button");
  clearBtn.type = "button";
  clearBtn.className = "btn btn-outline";
  clearBtn.innerHTML = '<i class="fas fa-eraser"></i> Clear Form';
  clearBtn.style.marginTop = "1rem";
  clearBtn.style.width = "100%";

  clearBtn.addEventListener("click", function () {
    if (confirm("Clear all form fields?")) {
      contactForm.reset();
      clearFormDraft();
      hideFormStatus();
      formInputs.forEach((input) => input.classList.remove("touched"));
      showToast("Form cleared", "info");
    }
  });

  // Uncomment to add clear button:
  // contactForm.appendChild(clearBtn);

  console.log("Dual-option contact form initialized");
  console.log("Email: Formspree | WhatsApp: Direct link");
});
// ============================================
// END OF SCRIPT
// ============================================
