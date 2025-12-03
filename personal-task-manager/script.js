// Personal Task Manager Application
document.addEventListener("DOMContentLoaded", function () {
  // DOM Elements
  const elements = {
    // Input & Buttons
    taskInput: document.getElementById("taskInput"),
    addTaskBtn: document.getElementById("addTaskBtn"),
    categorySelect: document.getElementById("categorySelect"),
    sortSelect: document.getElementById("sortSelect"),

    // Priority Buttons
    priorityBtns: document.querySelectorAll(".priority-btn"),

    // Filter Tabs
    filterTabs: document.querySelectorAll(".filter-tab"),

    // Task List
    taskList: document.getElementById("taskList"),
    emptyState: document.getElementById("emptyState"),

    // Statistics
    totalTasks: document.getElementById("totalTasks"),
    completedTasks: document.getElementById("completedTasks"),
    pendingTasks: document.getElementById("pendingTasks"),
    highPriorityTasks: document.getElementById("highPriorityTasks"),
    completionRate: document.getElementById("completionRate"),
    progressFill: document.getElementById("progressFill"),
    visibleTasks: document.getElementById("visibleTasks"),

    // Bulk Actions
    bulkActions: document.getElementById("bulkActions"),
    deleteCompletedBtn: document.getElementById("deleteCompletedBtn"),
    markAllCompleteBtn: document.getElementById("markAllCompleteBtn"),

    // Footer Buttons
    exportBtn: document.getElementById("exportBtn"),
    importBtn: document.getElementById("importBtn"),
    clearAllBtn: document.getElementById("clearAllBtn"),

    // Date Display
    currentDate: document.getElementById("currentDate"),

    // Modals
    editModal: document.getElementById("editModal"),
    confirmModal: document.getElementById("confirmModal"),

    // Edit Modal Elements
    editTaskInput: document.getElementById("editTaskInput"),
    editPriorityBtns: document.querySelectorAll(
      '.priority-btn[class*="edit-"]'
    ),
    editCategorySelect: document.getElementById("editCategorySelect"),
    cancelEditBtn: document.getElementById("cancelEditBtn"),
    saveEditBtn: document.getElementById("saveEditBtn"),
    closeModalBtns: document.querySelectorAll(".close-modal"),

    // Confirm Modal Elements
    confirmMessage: document.getElementById("confirmMessage"),
    cancelConfirmBtn: document.getElementById("cancelConfirmBtn"),
    confirmActionBtn: document.getElementById("confirmActionBtn"),
  };

  // Application State
  let state = {
    tasks: JSON.parse(localStorage.getItem("tasks")) || [],
    currentFilter: "all",
    currentSort: "date",
    selectedPriority: "medium",
    editingTaskId: null,
    pendingAction: null,
    pendingActionData: null,
  };

  // Initialize the application
  function init() {
    updateDateDisplay();
    loadTasks();
    setupEventListeners();
    updateStatistics();
    renderTaskList();

    // Show bulk actions if there are tasks
    updateBulkActions();
  }

  // Update current date display
  function updateDateDisplay() {
    const now = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    elements.currentDate.textContent = now.toLocaleDateString("en-US", options);
  }

  // Load tasks from localStorage
  function loadTasks() {
    const savedTasks = localStorage.getItem("tasks");
    if (savedTasks) {
      try {
        state.tasks = JSON.parse(savedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
        state.tasks = [];
      }
    }
  }

  // Save tasks to localStorage
  function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(state.tasks));
  }

  // Setup event listeners
  function setupEventListeners() {
    // Add task
    elements.addTaskBtn.addEventListener("click", addTask);
    elements.taskInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") addTask();
    });

    // Priority selection
    elements.priorityBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        elements.priorityBtns.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        state.selectedPriority = this.dataset.priority;
      });
    });

    // Filter tabs
    elements.filterTabs.forEach((tab) => {
      tab.addEventListener("click", function () {
        elements.filterTabs.forEach((t) => t.classList.remove("active"));
        this.classList.add("active");
        state.currentFilter = this.dataset.filter;
        renderTaskList();
      });
    });

    // Sort selection
    elements.sortSelect.addEventListener("change", function () {
      state.currentSort = this.value;
      renderTaskList();
    });

    // Bulk actions
    elements.deleteCompletedBtn.addEventListener("click", () => {
      showConfirmModal("Delete all completed tasks?", "deleteCompleted");
    });

    elements.markAllCompleteBtn.addEventListener("click", () => {
      showConfirmModal("Mark all tasks as complete?", "markAllComplete");
    });

    // Footer buttons
    elements.exportBtn.addEventListener("click", exportTasks);
    elements.importBtn.addEventListener("click", () => {
      elements.importBtn.innerHTML =
        '<i class="fas fa-file-import"></i> Choose File';
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.accept = ".json";
      fileInput.onchange = importTasks;
      fileInput.click();
    });

    elements.clearAllBtn.addEventListener("click", () => {
      showConfirmModal("Clear all tasks? This cannot be undone.", "clearAll");
    });

    // Modal events
    elements.cancelEditBtn.addEventListener("click", closeEditModal);
    elements.saveEditBtn.addEventListener("click", saveEditedTask);
    elements.closeModalBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        elements.editModal.classList.remove("active");
        elements.confirmModal.classList.remove("active");
      });
    });

    elements.cancelConfirmBtn.addEventListener("click", () => {
      elements.confirmModal.classList.remove("active");
    });

    elements.confirmActionBtn.addEventListener("click", executePendingAction);

    // Close modals when clicking outside
    window.addEventListener("click", function (e) {
      if (e.target === elements.editModal) {
        elements.editModal.classList.remove("active");
      }
      if (e.target === elements.confirmModal) {
        elements.confirmModal.classList.remove("active");
      }
    });
  }

  // Add a new task
  function addTask() {
    const taskText = elements.taskInput.value.trim();

    if (!taskText) {
      showAlert("Please enter a task description", "warning");
      return;
    }

    const newTask = {
      id: Date.now(),
      text: taskText,
      priority: state.selectedPriority,
      category: elements.categorySelect.value,
      completed: false,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    state.tasks.unshift(newTask);
    saveTasks();
    renderTaskList();
    updateStatistics();

    elements.taskInput.value = "";
    elements.taskInput.focus();

    showAlert("Task added successfully!", "success");
  }

  // Toggle task completion
  function toggleTaskCompletion(taskId) {
    state.tasks = state.tasks.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          completed: !task.completed,
          completedAt: task.completed ? null : new Date().toISOString(),
        };
      }
      return task;
    });

    saveTasks();
    renderTaskList();
    updateStatistics();
  }

  // Edit a task
  function editTask(taskId) {
    const task = state.tasks.find((t) => t.id === taskId);
    if (!task) return;

    state.editingTaskId = taskId;
    elements.editTaskInput.value = task.text;
    elements.editCategorySelect.value = task.category;

    // Set priority buttons
    elements.editPriorityBtns.forEach((btn) => {
      btn.classList.remove("active");
      if (btn.dataset.priority === task.priority) {
        btn.classList.add("active");
      }
    });

    elements.editModal.classList.add("active");
  }

  // Save edited task
  function saveEditedTask() {
    if (!state.editingTaskId) return;

    const updatedText = elements.editTaskInput.value.trim();
    if (!updatedText) {
      showAlert("Task description cannot be empty", "warning");
      return;
    }

    const selectedPriority =
      document.querySelector(
        ".priority-btn.edit-low.active, .priority-btn.edit-medium.active, .priority-btn.edit-high.active"
      )?.dataset.priority || "medium";

    state.tasks = state.tasks.map((task) => {
      if (task.id === state.editingTaskId) {
        return {
          ...task,
          text: updatedText,
          priority: selectedPriority,
          category: elements.editCategorySelect.value,
        };
      }
      return task;
    });

    saveTasks();
    renderTaskList();
    updateStatistics();
    closeEditModal();

    showAlert("Task updated successfully!", "success");
  }

  // Close edit modal
  function closeEditModal() {
    elements.editModal.classList.remove("active");
    state.editingTaskId = null;
    elements.editTaskInput.value = "";
  }

  // Delete a task
  function deleteTask(taskId) {
    state.tasks = state.tasks.filter((task) => task.id !== taskId);
    saveTasks();
    renderTaskList();
    updateStatistics();
    showAlert("Task deleted successfully", "info");
  }

  // Filter tasks based on current filter
  function filterTasks(tasks) {
    switch (state.currentFilter) {
      case "active":
        return tasks.filter((task) => !task.completed);
      case "completed":
        return tasks.filter((task) => task.completed);
      case "high":
        return tasks.filter((task) => task.priority === "high");
      default:
        return tasks;
    }
  }

  // Sort tasks based on current sort option
  function sortTasks(tasks) {
    const sorted = [...tasks];

    switch (state.currentSort) {
      case "date":
        return sorted.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
      case "date-oldest":
        return sorted.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
      case "priority":
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return sorted.sort((a, b) => {
          if (priorityOrder[b.priority] !== priorityOrder[a.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      case "name":
        return sorted.sort((a, b) => a.text.localeCompare(b.text));
      default:
        return sorted;
    }
  }

  // Render the task list
  function renderTaskList() {
    let filteredTasks = filterTasks(state.tasks);
    filteredTasks = sortTasks(filteredTasks);

    elements.visibleTasks.textContent = filteredTasks.length;

    if (filteredTasks.length === 0) {
      elements.emptyState.style.display = "block";
      elements.taskList.innerHTML = "";
      elements.taskList.appendChild(elements.emptyState);
      return;
    }

    elements.emptyState.style.display = "none";
    elements.taskList.innerHTML = "";

    filteredTasks.forEach((task) => {
      const taskItem = createTaskElement(task);
      elements.taskList.appendChild(taskItem);
    });

    updateBulkActions();
  }

  // Create a task element
  function createTaskElement(task) {
    const taskItem = document.createElement("div");
    taskItem.className = `task-item ${task.priority}-priority`;
    taskItem.dataset.id = task.id;

    const priorityClass = `priority-${task.priority}`;
    const categoryIcon = getCategoryIcon(task.category);

    taskItem.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${
              task.completed ? "checked" : ""
            }>
            <div class="task-content">
                <div class="task-title ${task.completed ? "completed" : ""}">${
      task.text
    }</div>
                <div class="task-meta">
                    <span class="task-priority-badge ${priorityClass}">
                        <i class="fas fa-${
                          task.priority === "high"
                            ? "arrow-up"
                            : task.priority === "medium"
                            ? "equals"
                            : "arrow-down"
                        }"></i>
                        ${
                          task.priority.charAt(0).toUpperCase() +
                          task.priority.slice(1)
                        }
                    </span>
                    <span class="task-category">
                        <i class="fas fa-${categoryIcon}"></i>
                        ${
                          task.category.charAt(0).toUpperCase() +
                          task.category.slice(1)
                        }
                    </span>
                    <span class="task-date">
                        <i class="far fa-calendar"></i>
                        ${formatDate(task.createdAt)}
                    </span>
                </div>
            </div>
            <div class="task-actions">
                <button class="task-action-btn edit-btn" title="Edit Task">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="task-action-btn delete-btn" title="Delete Task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

    // Add event listeners
    const checkbox = taskItem.querySelector(".task-checkbox");
    const editBtn = taskItem.querySelector(".edit-btn");
    const deleteBtn = taskItem.querySelector(".delete-btn");

    checkbox.addEventListener("change", () => toggleTaskCompletion(task.id));
    editBtn.addEventListener("click", () => editTask(task.id));
    deleteBtn.addEventListener("click", () => {
      showConfirmModal("Delete this task?", "deleteTask", task.id);
    });

    return taskItem;
  }

  // Get icon for category
  function getCategoryIcon(category) {
    const icons = {
      work: "briefcase",
      personal: "user",
      shopping: "shopping-cart",
      health: "heartbeat",
      learning: "graduation-cap",
      general: "folder",
    };
    return icons[category] || "folder";
  }

  // Format date for display
  function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "Today";
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }

  // Update statistics
  function updateStatistics() {
    const total = state.tasks.length;
    const completed = state.tasks.filter((task) => task.completed).length;
    const pending = total - completed;
    const highPriority = state.tasks.filter(
      (task) => task.priority === "high"
    ).length;
    const completionPercentage =
      total > 0 ? Math.round((completed / total) * 100) : 0;

    elements.totalTasks.textContent = total;
    elements.completedTasks.textContent = completed;
    elements.pendingTasks.textContent = pending;
    elements.highPriorityTasks.textContent = highPriority;
    elements.completionRate.textContent = `${completionPercentage}%`;
    elements.progressFill.style.width = `${completionPercentage}%`;
  }

  // Update bulk actions visibility
  function updateBulkActions() {
    const hasCompletedTasks = state.tasks.some((task) => task.completed);
    const hasIncompleteTasks = state.tasks.some((task) => !task.completed);

    if (state.tasks.length > 0 && (hasCompletedTasks || hasIncompleteTasks)) {
      elements.bulkActions.style.display = "flex";
    } else {
      elements.bulkActions.style.display = "none";
    }
  }

  // Show confirmation modal
  function showConfirmModal(message, action, data = null) {
    state.pendingAction = action;
    state.pendingActionData = data;
    elements.confirmMessage.textContent = message;
    elements.confirmModal.classList.add("active");
  }

  // Execute pending action from confirmation modal
  function executePendingAction() {
    switch (state.pendingAction) {
      case "deleteTask":
        deleteTask(state.pendingActionData);
        break;
      case "deleteCompleted":
        deleteCompletedTasks();
        break;
      case "markAllComplete":
        markAllTasksComplete();
        break;
      case "clearAll":
        clearAllTasks();
        break;
    }

    elements.confirmModal.classList.remove("active");
    state.pendingAction = null;
    state.pendingActionData = null;
  }

  // Delete all completed tasks
  function deleteCompletedTasks() {
    const initialLength = state.tasks.length;
    state.tasks = state.tasks.filter((task) => !task.completed);

    if (state.tasks.length < initialLength) {
      saveTasks();
      renderTaskList();
      updateStatistics();
      showAlert("Completed tasks deleted successfully", "info");
    }
  }

  // Mark all tasks as complete
  function markAllTasksComplete() {
    state.tasks = state.tasks.map((task) => ({
      ...task,
      completed: true,
      completedAt: task.completed ? task.completedAt : new Date().toISOString(),
    }));

    saveTasks();
    renderTaskList();
    updateStatistics();
    showAlert("All tasks marked as complete", "success");
  }

  // Clear all tasks
  function clearAllTasks() {
    state.tasks = [];
    saveTasks();
    renderTaskList();
    updateStatistics();
    showAlert("All tasks cleared", "info");
  }

  // Export tasks to JSON file
  function exportTasks() {
    const dataStr = JSON.stringify(state.tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `tasks-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showAlert("Tasks exported successfully", "success");
  }

  // Import tasks from JSON file
  function importTasks(event) {
    const file = event.target.files[0];
    if (!file) {
      elements.importBtn.innerHTML =
        '<i class="fas fa-upload"></i> Import Tasks';
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const importedTasks = JSON.parse(e.target.result);

        if (!Array.isArray(importedTasks)) {
          throw new Error("Invalid file format");
        }

        // Validate each task
        const validTasks = importedTasks.filter(
          (task) => task.id && task.text && task.priority && task.category
        );

        if (validTasks.length === 0) {
          throw new Error("No valid tasks found in file");
        }

        // Merge with existing tasks (avoid duplicates by ID)
        const existingIds = new Set(state.tasks.map((task) => task.id));
        const newTasks = validTasks.filter((task) => !existingIds.has(task.id));

        state.tasks = [...state.tasks, ...newTasks];
        saveTasks();
        renderTaskList();
        updateStatistics();

        showAlert(`${newTasks.length} tasks imported successfully`, "success");
      } catch (error) {
        showAlert("Error importing tasks: " + error.message, "danger");
      }

      elements.importBtn.innerHTML =
        '<i class="fas fa-upload"></i> Import Tasks';
    };

    reader.readAsText(file);
  }

  // Show alert message
  function showAlert(message, type = "info") {
    // Remove existing alerts
    const existingAlert = document.querySelector(".alert");
    if (existingAlert) existingAlert.remove();

    // Create alert element
    const alert = document.createElement("div");
    alert.className = `alert alert-${type}`;
    alert.innerHTML = `
            <span>${message}</span>
            <button class="alert-close">&times;</button>
        `;

    // Add alert styles
    const style = document.createElement("style");
    style.textContent = `
            .alert {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 300px;
                max-width: 400px;
                z-index: 10000;
                animation: slideIn 0.3s ease;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .alert-info { background: var(--primary-color); }
            .alert-success { background: var(--success-color); }
            .alert-warning { background: var(--warning-color); }
            .alert-danger { background: var(--danger-color); }
            .alert-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                margin-left: 15px;
                padding: 0 5px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
    document.head.appendChild(style);

    // Add close button functionality
    alert.querySelector(".alert-close").addEventListener("click", () => {
      alert.remove();
    });

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (alert.parentNode) {
        alert.remove();
      }
    }, 5000);

    document.body.appendChild(alert);
  }

  // Initialize the application
  init();
});
