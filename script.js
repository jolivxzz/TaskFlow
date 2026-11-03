const STORAGE_KEY = "taskflow-tasks-v1";
const tasks = loadTasks();
let editingId = null;
let toastTimer;

const $ = (selector) => document.querySelector(selector);
const dialog = $("#task-dialog");
const form = $("#task-form");

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Não foi possível carregar as tarefas:", error);
    return [];
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    console.error("Não foi possível salvar as tarefas:", error);
    showToast("Não foi possível salvar os dados neste navegador.");
  }
}

function makeId() {
  return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function formatDate(dateString) {
  if (!dateString) return "Sem prazo";
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" }).format(date).replace(".", "");
}

function isOverdue(task) {
  if (!task.due || task.status === "done") return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${task.due}T00:00:00`) < today;
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function getFilteredTasks() {
  const query = $("#search-input").value.trim().toLocaleLowerCase("pt-BR");
  const priority = $("#priority-filter").value;
  const status = $("#status-filter").value;
  return tasks.filter(task => {
    const matchesTitle = task.title.toLocaleLowerCase("pt-BR").includes(query);
    const matchesPriority = priority === "all" || task.priority === priority;
    const matchesStatus = status === "all" || task.status === status;
    return matchesTitle && matchesPriority && matchesStatus;
  });
}

function taskCard(task) {
  const overdue = isOverdue(task);
  const description = task.description ? `<p>${escapeHTML(task.description)}</p>` : "";
  const priorityLabels = { alta: "Alta", media: "Média", baixa: "Baixa" };
  return `
    <article class="task-card ${overdue ? "overdue" : ""}" data-id="${escapeHTML(task.id)}">
      <div class="task-card-top">
        <span class="priority ${task.priority}">${priorityLabels[task.priority] || "Média"}</span>
        <div class="card-menu">
          <button class="icon-btn edit-task" title="Editar tarefa" aria-label="Editar ${escapeHTML(task.title)}">✎</button>
          <button class="icon-btn delete-task" title="Excluir tarefa" aria-label="Excluir ${escapeHTML(task.title)}">×</button>
        </div>
      </div>
      <h4>${escapeHTML(task.title)}</h4>
      ${description}
      <div class="task-meta">
        <span class="${overdue ? "late" : ""}">${overdue ? "⚠ Atrasada · " : "◷ "}${formatDate(task.due)}</span>
        <select class="status-select change-status" aria-label="Alterar status de ${escapeHTML(task.title)}">
          <option value="todo" ${task.status === "todo" ? "selected" : ""}>A Fazer</option>
          <option value="doing" ${task.status === "doing" ? "selected" : ""}>Em andamento</option>
          <option value="done" ${task.status === "done" ? "selected" : ""}>Concluída</option>
        </select>
      </div>
    </article>`;
}

function render() {
  const filtered = getFilteredTasks();
  const columns = [
    { status: "todo", list: "#todo-list", count: "#todo-column-count" },
    { status: "doing", list: "#doing-list", count: "#doing-column-count" },
    { status: "done", list: "#done-list", count: "#done-column-count" }
  ];

  columns.forEach(column => {
    const columnTasks = filtered.filter(task => task.status === column.status);
    $(column.list).innerHTML = columnTasks.length
      ? columnTasks.map(taskCard).join("")
      : `<div class="empty-state">Nenhuma tarefa por aqui.</div>`;
    $(column.count).textContent = columnTasks.length;
  });

  $("#total-count").textContent = tasks.length;
  $("#todo-count").textContent = tasks.filter(task => task.status === "todo").length;
  $("#doing-count").textContent = tasks.filter(task => task.status === "doing").length;
  $("#done-count").textContent = tasks.filter(task => task.status === "done").length;
}

function openModal(status = "todo", task = null) {
  editingId = task ? task.id : null;
  form.reset();
  $("#modal-title").textContent = task ? "Editar tarefa" : "Criar tarefa";
  $("#task-title").value = task?.title || "";
  $("#task-description").value = task?.description || "";
  $("#task-priority").value = task?.priority || "media";
  $("#task-due").value = task?.due || "";
  $("#task-status").value = task?.status || status;
  dialog.showModal();
  $("#task-title").focus();
}

function closeModal() {
  dialog.close();
  editingId = null;
}

form.addEventListener("submit", event => {
  event.preventDefault();
  const title = $("#task-title").value.trim();
  if (!title) {
    $("#task-title").focus();
    return;
  }

  const data = {
    title,
    description: $("#task-description").value.trim(),
    priority: $("#task-priority").value,
    due: $("#task-due").value,
    status: $("#task-status").value
  };

  if (editingId) {
    const index = tasks.findIndex(task => task.id === editingId);
    if (index !== -1) tasks[index] = { ...tasks[index], ...data };
    showToast("Tarefa atualizada!");
  } else {
    tasks.push({ id: makeId(), ...data, createdAt: new Date().toISOString() });
    showToast("Tarefa criada com sucesso!");
  }

  saveTasks();
  render();
  closeModal();
});

document.addEventListener("click", event => {
  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    openModal(addButton.dataset.add);
    return;
  }

  const card = event.target.closest(".task-card");
  if (!card) return;
  const id = card.dataset.id;
  const task = tasks.find(item => item.id === id);
  if (!task) return;

  if (event.target.closest(".edit-task")) {
    openModal(task.status, task);
  } else if (event.target.closest(".delete-task")) {
    if (confirm(`Excluir a tarefa "${task.title}"?`)) {
      const index = tasks.findIndex(item => item.id === id);
      tasks.splice(index, 1);
      saveTasks();
      render();
      showToast("Tarefa excluída.");
    }
  }
});

document.addEventListener("change", event => {
  if (!event.target.matches(".change-status")) return;
  const card = event.target.closest(".task-card");
  const task = tasks.find(item => item.id === card.dataset.id);
  if (!task) return;
  task.status = event.target.value;
  saveTasks();
  render();
  showToast("Status atualizado!");
});

$("#open-task-modal").addEventListener("click", () => openModal());
$("#close-modal").addEventListener("click", closeModal);
$("#cancel-modal").addEventListener("click", closeModal);
dialog.addEventListener("click", event => {
  if (event.target === dialog) closeModal();
});
$("#search-input").addEventListener("input", render);
$("#priority-filter").addEventListener("change", render);
$("#status-filter").addEventListener("change", render);
$("#clear-filters").addEventListener("click", () => {
  $("#search-input").value = "";
  $("#priority-filter").value = "all";
  $("#status-filter").value = "all";
  render();
  showToast("Filtros limpos.");
});

const today = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
$("#today-label").textContent = today.toLocaleUpperCase("pt-BR");
render();
