export function createTaskElement(
  taskText,
  taskCompleted = false,
  taskFavorite = false,
  taskCategory = "today"
) {
  const taskItem = document.createElement("li");

  taskItem.classList.add("tasks__item");
  taskItem.dataset.category = taskCategory;

  taskItem.innerHTML = `
    <label class="tasks__label">
      <input type="checkbox" class="tasks__checkbox" ${
        taskCompleted ? "checked" : ""
      } />

      <span class="tasks__text">${taskText}</span>
    </label>

    <div class="tasks__actions">
      <button
        class="tasks__favorite ${taskFavorite ? "tasks__favorite--active" : ""}"
        type="button"
      >
        ${taskFavorite ? "★" : "☆"}
      </button>

      <button class="tasks__delete" type="button">×</button>
    </div>
  `;

  return taskItem;
}

export function getTasksData() {
  const tasks = document.querySelectorAll(".tasks__item");
  const tasksArray = [];

  tasks.forEach((task) => {
    tasksArray.push({
      text: task.querySelector(".tasks__text").textContent,
      completed: task.querySelector(".tasks__checkbox").checked,
      favorite: task
        .querySelector(".tasks__favorite")
        .classList.contains("tasks__favorite--active"),
      category: task.dataset.category,
    });
  });

  return tasksArray;
}