const STORAGE_KEYS = {
  tasks: "lifeDashboardTasks",
  links: "lifeDashboardLinks",
  name: "lifeDashboardName",
  theme: "lifeDashboardTheme"
};

// ---------- Greeting & Clock ----------
const clockElement = document.getElementById("clock");
const dateElement = document.getElementById("date");
const greetingElement = document.getElementById("greeting");
const nameInput = document.getElementById("nameInput");

function updateClock() {
  const now = new Date();
  const hour = now.getHours();

  let greeting = "Good Evening";
  if (hour >= 5 && hour < 12) greeting = "Good Morning";
  else if (hour >= 12 && hour < 18) greeting = "Good Afternoon";

  const savedName = localStorage.getItem(STORAGE_KEYS.name);
  greetingElement.textContent = savedName ? `${greeting}, ${savedName}!` : `${greeting}!`;

  clockElement.textContent = now.toLocaleTimeString();
  dateElement.textContent = now.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });
}

setInterval(updateClock, 1000);
updateClock();

// ---------- Name ----------
const nameForm = document.getElementById("nameForm");

nameForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();

  if (name) {
    localStorage.setItem(STORAGE_KEYS.name, name);
    nameInput.value = "";
    updateClock();
  }
});

// ---------- Theme ----------
const themeToggle = document.getElementById("themeToggle");

function loadTheme() {
  const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeToggle.textContent = "☀️";
  }
}

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  localStorage.setItem(STORAGE_KEYS.theme, isDark ? "dark" : "light");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
});

loadTheme();

// ---------- To-Do List ----------
const taskForm = document.getElementById("taskForm");
const taskInput = document.getElementById("taskInput");
const taskList = document.getElementById("taskList");
const taskCount = document.getElementById("taskCount");

let tasks = JSON.parse(localStorage.getItem(STORAGE_KEYS.tasks)) || [];

function saveTasks() {
  localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
}

function renderTasks() {
  taskList.innerHTML = "";

  if (tasks.length === 0) {
    taskList.innerHTML = '<li class="empty">No tasks yet.</li>';
    taskCount.textContent = "0 tasks";
    return;
  }

  tasks.forEach((task) => {
    const li = document.createElement("li");
    li.className = `task-item ${task.completed ? "completed" : ""}`;

    li.innerHTML = `
      <input type="checkbox" ${task.completed ? "checked" : ""} aria-label="Mark task as done">
      <span class="task-text">${escapeHtml(task.text)}</span>
      <div class="task-actions">
        <button type="button" class="edit">Edit</button>
        <button type="button" class="delete">Delete</button>
      </div>
    `;

    li.querySelector("input").addEventListener("change", () => {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    });

    li.querySelector(".edit").addEventListener("click", () => {
      // Switch to inline edit mode
      const taskTextSpan = li.querySelector(".task-text");
      const actionsDiv = li.querySelector(".task-actions");

      // Build the inline edit input
      const editInput = document.createElement("input");
      editInput.type = "text";
      editInput.value = task.text;
      editInput.maxLength = 100;
      editInput.className = "task-edit-input";
      editInput.setAttribute("aria-label", "Edit task text");

      // Build Save and Cancel buttons
      const saveButton = document.createElement("button");
      saveButton.type = "button";
      saveButton.textContent = "Save";
      saveButton.className = "save";

      const cancelButton = document.createElement("button");
      cancelButton.type = "button";
      cancelButton.textContent = "Cancel";
      cancelButton.className = "cancel secondary";

      // Replace the text span and actions with the edit input + buttons
      taskTextSpan.replaceWith(editInput);
      actionsDiv.innerHTML = "";
      actionsDiv.append(saveButton, cancelButton);

      editInput.focus();
      editInput.select();

      function commitEdit() {
        const newText = editInput.value.trim();
        if (newText) {
          task.text = newText;
          saveTasks();
        }
        renderTasks();
      }

      function cancelEdit() {
        renderTasks();
      }

      saveButton.addEventListener("click", commitEdit);
      cancelButton.addEventListener("click", cancelEdit);

      // Also allow saving by pressing Enter and cancelling by pressing Escape
      editInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          commitEdit();
        } else if (e.key === "Escape") {
          cancelEdit();
        }
      });
    });

    li.querySelector(".delete").addEventListener("click", () => {
      tasks = tasks.filter((item) => item.id !== task.id);
      saveTasks();
      renderTasks();
    });

    taskList.appendChild(li);
  });

  const unfinished = tasks.filter((task) => !task.completed).length;
  taskCount.textContent = `${unfinished} unfinished`;
}

taskForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = taskInput.value.trim();

  if (!text) return;

  tasks.push({
    id: Date.now(),
    text,
    completed: false
  });

  saveTasks();
  renderTasks();
  taskInput.value = "";
  taskInput.focus();
});

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

renderTasks();

// ---------- Focus Timer ----------
const timerDisplay = document.getElementById("timerDisplay");
const timerMinutes = document.getElementById("timerMinutes");
const setTimerButton = document.getElementById("setTimer");
const startTimer = document.getElementById("startTimer");
const stopTimer = document.getElementById("stopTimer");
const resetTimer = document.getElementById("resetTimer");

let timerSeconds = 25 * 60;
let initialTimerSeconds = timerSeconds;
let timerInterval = null;

function updateTimerDisplay() {
  const minutes = Math.floor(timerSeconds / 60);
  const seconds = timerSeconds % 60;

  timerDisplay.textContent =
    `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

startTimer.addEventListener("click", () => {
  if (timerInterval || timerSeconds <= 0) return;

  timerInterval = setInterval(() => {
    if (timerSeconds <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      return;
    }

    timerSeconds--;
    updateTimerDisplay();
  }, 1000);
});

stopTimer.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
});

resetTimer.addEventListener("click", () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerSeconds = initialTimerSeconds;
  updateTimerDisplay();
});

setTimerButton.addEventListener("click", () => {
  const minutes = Number(timerMinutes.value);

  if (minutes < 1 || minutes > 120) {
    alert("Please enter a time between 1 and 120 minutes.");
    return;
  }

  clearInterval(timerInterval);
  timerInterval = null;
  initialTimerSeconds = minutes * 60;
  timerSeconds = initialTimerSeconds;
  updateTimerDisplay();
});

updateTimerDisplay();

// ---------- Quick Links ----------
const linkForm = document.getElementById("linkForm");
const linkName = document.getElementById("linkName");
const linkUrl = document.getElementById("linkUrl");
const quickLinks = document.getElementById("quickLinks");

let links = JSON.parse(localStorage.getItem(STORAGE_KEYS.links)) || [];

function saveLinks() {
  localStorage.setItem(STORAGE_KEYS.links, JSON.stringify(links));
}

function renderLinks() {
  quickLinks.innerHTML = "";

  if (links.length === 0) {
    quickLinks.innerHTML = '<p class="empty">No quick links yet.</p>';
    return;
  }

  links.forEach((link) => {
    const wrapper = document.createElement("div");
    wrapper.className = "quick-link";

    const anchor = document.createElement("a");
    anchor.href = link.url;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.textContent = link.name;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "×";
    deleteButton.setAttribute("aria-label", `Delete ${link.name}`);

    deleteButton.addEventListener("click", () => {
      links = links.filter((item) => item.id !== link.id);
      saveLinks();
      renderLinks();
    });

    wrapper.append(anchor, deleteButton);
    quickLinks.appendChild(wrapper);
  });
}

linkForm.addEventListener("submit", (event) => {
  event.preventDefault();

  let url = linkUrl.value.trim();

  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    url = `https://${url}`;
  }

  links.push({
    id: Date.now(),
    name: linkName.value.trim(),
    url
  });

  saveLinks();
  renderLinks();
  linkForm.reset();
});

renderLinks();
