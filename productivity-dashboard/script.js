// Productivity Dashboard JavaScript
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");
  const filterBtns = document.querySelectorAll(".filter-btn");
  const priorityBtns = document.querySelectorAll(".priority-btn");
  const timeOptions = document.querySelectorAll(".time-option");

  // Stats Elements
  const totalTasksEl = document.getElementById("totalTasks");
  const completedTasksEl = document.getElementById("completedTasks");
  const pendingTasksEl = document.getElementById("pendingTasks");
  const highPriorityEl = document.getElementById("highPriority");
  const progressFill = document.getElementById("progressFill");
  const completionRate = document.getElementById("completionRate");

  // Timer Elements
  const timerDisplay = document.getElementById("timerDisplay");
  const startTimerBtn = document.getElementById("startTimer");
  const pauseTimerBtn = document.getElementById("pauseTimer");
  const resetTimerBtn = document.getElementById("resetTimer");

  // State
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let currentFilter = "all";
  let selectedPriority = "medium";
  let timerInterval = null;
  let timerTime = 25 * 60; // 25 minutes in seconds
  let isTimerRunning = false;
  let currentTime = timerTime;

  // Chart variable - DECLARED HERE
  let priorityChart = null;

  // Initialize
  init();

  // Event Listeners
  addTaskBtn.addEventListener("click", addTask);
  taskInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") addTask();
  });

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      filterBtns.forEach((b) => b.classList.remove("active"));
      this.classList.add("active");
      currentFilter = this.dataset.filter;
      renderTasks();
    });
  });

  priorityBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      priorityBtns.forEach((b) => (b.style.opacity = "1"));
      this.style.opacity = "0.8";
      selectedPriority = this.dataset.priority;
    });
  });

  // Timer Event Listeners
  startTimerBtn.addEventListener("click", startTimer);
  pauseTimerBtn.addEventListener("click", pauseTimer);
  resetTimerBtn.addEventListener("click", resetTimer);

  timeOptions.forEach((option) => {
    option.addEventListener("click", function () {
      timeOptions.forEach((opt) => opt.classList.remove("active"));
      this.classList.add("active");
      const minutes = parseInt(this.dataset.time);
      if (!isTimerRunning) {
        timerTime = minutes * 60;
        currentTime = timerTime;
        updateTimerDisplay();
      }
    });
  });

  // Functions
  function init() {
    renderTasks();
    updateStats();
    initializeChart(); // Now chart is initialized after everything else
  }

  function addTask() {
    const text = taskInput.value.trim();
    if (!text) return;

    const task = {
      id: Date.now(),
      text: text,
      priority: selectedPriority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(task);
    saveTasks();
    renderTasks();
    updateStats();
    updateChart();

    taskInput.value = "";
    taskInput.focus();
  }

  function toggleTask(id) {
    tasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });

    saveTasks();
    renderTasks();
    updateStats();
    updateChart();
  }

  function deleteTask(id) {
    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
    updateChart();
  }

  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }

  function renderTasks() {
    let filteredTasks = tasks;

    // Apply filter
    if (currentFilter === "active") {
      filteredTasks = tasks.filter((task) => !task.completed);
    } else if (currentFilter === "completed") {
      filteredTasks = tasks.filter((task) => task.completed);
    }

    // Reverse to show newest first
    filteredTasks = [...filteredTasks].reverse();

    if (filteredTasks.length === 0) {
      emptyState.style.display = "block";
      taskList.innerHTML = "";
      taskList.appendChild(emptyState);
      return;
    }

    emptyState.style.display = "none";
    taskList.innerHTML = "";

    filteredTasks.forEach((task) => {
      const taskItem = document.createElement("li");
      taskItem.className = `task-item ${task.priority}`;
      taskItem.dataset.id = task.id;

      taskItem.innerHTML = `
                <input type="checkbox" class="task-checkbox" ${
                  task.completed ? "checked" : ""
                }>
                <div class="task-content">
                    <div class="task-title ${
                      task.completed ? "completed" : ""
                    }">${task.text}</div>
                    <div class="task-meta">
                        <span class="task-priority priority-${task.priority}">
                            ${
                              task.priority.charAt(0).toUpperCase() +
                              task.priority.slice(1)
                            } Priority
                        </span>
                        <span><i class="far fa-calendar"></i> ${formatDate(
                          task.createdAt
                        )}</span>
                    </div>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="task-btn delete-btn" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

      // Add event listeners
      const checkbox = taskItem.querySelector(".task-checkbox");
      const deleteBtn = taskItem.querySelector(".delete-btn");
      const editBtn = taskItem.querySelector(".edit-btn");

      checkbox.addEventListener("change", () => toggleTask(task.id));
      deleteBtn.addEventListener("click", () => deleteTask(task.id));
      editBtn.addEventListener("click", () => editTask(task));

      taskList.appendChild(taskItem);
    });
  }

  function editTask(task) {
    const newText = prompt("Edit your task:", task.text);
    if (newText !== null && newText.trim() !== "") {
      tasks = tasks.map((t) => {
        if (t.id === task.id) {
          return { ...t, text: newText.trim() };
        }
        return t;
      });
      saveTasks();
      renderTasks();
      updateStats();
      updateChart();
    }
  }

  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const highPriority = tasks.filter(
      (task) => task.priority === "high"
    ).length;
    const completionRateValue =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    totalTasksEl.textContent = total;
    completedTasksEl.textContent = completed;
    pendingTasksEl.textContent = pending;
    highPriorityEl.textContent = highPriority;
    progressFill.style.width = `${completionRateValue}%`;
    completionRate.textContent = `${completionRateValue}%`;
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Chart.js Integration - FIXED VERSION
  function initializeChart() {
    const ctx = document.getElementById("priorityChart");

    // Check if canvas element exists
    if (!ctx) {
      console.warn("Chart canvas element not found");
      return;
    }

    const priorityData = getPriorityData();

    // Destroy previous chart if it exists
    if (priorityChart) {
      priorityChart.destroy();
    }

    try {
      priorityChart = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: ["Low", "Medium", "High"],
          datasets: [
            {
              data: [priorityData.low, priorityData.medium, priorityData.high],
              backgroundColor: [
                "#10b981", // Green for low
                "#f59e0b", // Yellow for medium
                "#ef4444", // Red for high
              ],
              borderWidth: 2,
              borderColor: "#fff",
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                padding: 20,
                usePointStyle: true,
                font: {
                  family: "'Inter', sans-serif",
                },
              },
            },
          },
          cutout: "70%",
        },
      });
    } catch (error) {
      console.error("Error creating chart:", error);
    }
  }

  function updateChart() {
    // Check if chart exists before updating
    if (!priorityChart) {
      console.warn("Chart not initialized yet");
      return;
    }

    const priorityData = getPriorityData();

    try {
      priorityChart.data.datasets[0].data = [
        priorityData.low,
        priorityData.medium,
        priorityData.high,
      ];
      priorityChart.update();
    } catch (error) {
      console.error("Error updating chart:", error);
      // Try to re-initialize the chart
      initializeChart();
    }
  }

  function getPriorityData() {
    return {
      low: tasks.filter((task) => task.priority === "low").length,
      medium: tasks.filter((task) => task.priority === "medium").length,
      high: tasks.filter((task) => task.priority === "high").length,
    };
  }

  // Timer Functions
  function startTimer() {
    if (isTimerRunning) return;

    isTimerRunning = true;
    startTimerBtn.disabled = true;
    pauseTimerBtn.disabled = false;

    timerInterval = setInterval(() => {
      currentTime--;
      updateTimerDisplay();

      if (currentTime <= 0) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        startTimerBtn.disabled = false;
        pauseTimerBtn.disabled = true;

        // Play notification sound or show alert
        if (Notification.permission === "granted") {
          new Notification("Timer Complete!", {
            body: "Time for a break! 🎉",
            icon: "https://cdn-icons-png.flaticon.com/512/3208/3208720.png",
          });
        }

        // Play sound
        playTimerSound();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isTimerRunning) return;

    clearInterval(timerInterval);
    isTimerRunning = false;
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
  }

  function resetTimer() {
    clearInterval(timerInterval);
    isTimerRunning = false;
    currentTime = timerTime;
    updateTimerDisplay();
    startTimerBtn.disabled = false;
    pauseTimerBtn.disabled = true;
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(currentTime / 60);
    const seconds = currentTime % 60;
    timerDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }

  function playTimerSound() {
    // Create a simple beep sound
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  }

  // Request notification permission
  if ("Notification" in window && Notification.permission === "default") {
    Notification.requestPermission();
  }
});
