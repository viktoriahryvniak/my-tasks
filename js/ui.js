export const predictions = [
  "✨ Сьогодні ти зробила більше, ніж думаєш.",
  "🌸 Попереду на тебе чекає приємна новина.",
  "🚀 Ти рухаєшся у правильному напрямку.",
  "💫 Скоро відкриється нова можливість.",
  "🌷 Твоя наполегливість скоро дасть результат.",
  "☀️ День завершується дуже продуктивно для тебе.",
  "🪄 Сьогоднішні маленькі кроки змінюють майбутнє.",
];

export function updateProgress(
  currentCategory,
  emptyMessage,
  progressTitle,
  progressLine,
  predictionSection,
  predictionCard
) {
  const visibleCheckboxes = document.querySelectorAll(
    `.tasks__item[data-category="${currentCategory}"] .tasks__checkbox`
  );

  const completedCheckboxes = document.querySelectorAll(
    `.tasks__item[data-category="${currentCategory}"] .tasks__checkbox:checked`
  );

  if (visibleCheckboxes.length === 0) {
    emptyMessage.style.display = "flex";
    progressTitle.textContent = "0 / 0 Completed";
    progressLine.style.width = "0%";

    predictionSection.classList.remove("prediction--visible");
    predictionCard.classList.remove("prediction__card--visible");

    return;
  }

  emptyMessage.style.display = "none";

  const progressPercent =
    (completedCheckboxes.length / visibleCheckboxes.length) * 100;

  progressTitle.textContent =
    completedCheckboxes.length + " / " + visibleCheckboxes.length + " Completed";

  progressLine.style.width = progressPercent + "%";

  if (completedCheckboxes.length === visibleCheckboxes.length) {
    predictionSection.classList.add("prediction--visible");
  } else {
    predictionSection.classList.remove("prediction--visible");
    predictionCard.classList.remove("prediction__card--visible");
  }
}

export function updateSidebarCounters(getSidebarLinks) {
  getSidebarLinks().forEach((link) => {
    const category = link.dataset.category;
    const counter = link.querySelector(".sidebar__link-count");

    const tasksInCategory = document.querySelectorAll(
      `.tasks__item[data-category="${category}"]`
    );

    counter.textContent = tasksInCategory.length;
  });
}

export function filterTasks(currentCategory, filterType) {
  const tasks = document.querySelectorAll(
    `.tasks__item[data-category="${currentCategory}"]`
  );

  tasks.forEach((task) => {
    const isCompleted = task.querySelector(".tasks__checkbox").checked;
    const isFavorite = task
      .querySelector(".tasks__favorite")
      .classList.contains("tasks__favorite--active");

    task.style.display = "flex";

    if (filterType === "active" && isCompleted) {
      task.style.display = "none";
    }

    if (filterType === "completed" && !isCompleted) {
      task.style.display = "none";
    }

    if (filterType === "important" && !isFavorite) {
      task.style.display = "none";
    }
  });
}

export function showCurrentCategoryTasks(
  currentCategory,
  emptyMessage,
  progressTitle,
  progressLine,
  predictionSection,
  predictionCard
) {
  const tasks = document.querySelectorAll(".tasks__item");

  tasks.forEach((task) => {
    task.style.display =
      task.dataset.category === currentCategory ? "flex" : "none";
  });

  updateProgress(
    currentCategory,
    emptyMessage,
    progressTitle,
    progressLine,
    predictionSection,
    predictionCard
  );
}