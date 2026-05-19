document.body.addEventListener("htmx:afterSwap", () => {
  lucide.createIcons();

  const taskForm = document.querySelector(".task-input__form");
  const taskInput = document.querySelector(".task-input__field");
  const tasksList = document.querySelector(".tasks__list");

  const mainTitle = document.querySelector(".main__title");
  const progressTitle = document.querySelector(".progress__title");
  const progressLine = document.querySelector(".progress__line");

  const filterButtons = document.querySelectorAll(".filters__button");
  const filterToggleButton = document.querySelector(".main__filter-button");
  const filters = document.querySelector(".filters");

  const emptyMessage = document.querySelector(".tasks__empty");

  const addListButton = document.querySelector(".sidebar__add-button");
  const sidebarList = document.querySelector(".sidebar__list");

  const listModal = document.querySelector("#listModal");
  const listNameInput = document.querySelector("#listNameInput");
  const closeListModal = document.querySelector("#closeListModal");
  const createListButton = document.querySelector("#createListButton");

  const predictionSection = document.querySelector(".prediction");
  const predictionButton = document.querySelector(".prediction__button");
  const predictionCard = document.querySelector(".prediction__card");
  const predictionText = document.querySelector(".prediction__text");

  const defaultCategories = ["today", "study", "work", "personal", "shopping"];

  let currentCategory = "today";

  const predictions = [
    "✨ Сьогодні ти зробила більше, ніж думаєш.",
    "🌸 Попереду на тебе чекає приємна новина.",
    "🚀 Ти рухаєшся у правильному напрямку.",
    "💫 Скоро відкриється нова можливість.",
    "🌷 Твоя наполегливість скоро дасть результат.",
    "☀️ День завершується дуже продуктивно для тебе.",
    "🪄 Сьогоднішні маленькі кроки змінюють майбутнє.",
  ];

  function getSidebarLinks() {
    return document.querySelectorAll(".sidebar__link");
  }

  function createTaskElement(
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

  function createSidebarListElement(categoryName, categoryId) {
    const listItem = document.createElement("li");

    listItem.classList.add("sidebar__item");

    listItem.innerHTML = `
      <a href="#" class="sidebar__link" data-category="${categoryId}">
        <span class="sidebar__link-icon">📌</span>
        <span class="sidebar__link-text">${categoryName}</span>
        <span class="sidebar__link-count">0</span>

        <button class="sidebar__delete-list" type="button">×</button>
      </a>
    `;

    return listItem;
  }

  function updateProgress() {
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

  function showCurrentCategoryTasks() {
    const tasks = document.querySelectorAll(".tasks__item");

    tasks.forEach((task) => {
      task.style.display =
        task.dataset.category === currentCategory ? "flex" : "none";
    });

    updateProgress();
  }

  function updateSidebarCounters() {
    getSidebarLinks().forEach((link) => {
      const category = link.dataset.category;
      const counter = link.querySelector(".sidebar__link-count");

      const tasksInCategory = document.querySelectorAll(
        `.tasks__item[data-category="${category}"]`
      );

      counter.textContent = tasksInCategory.length;
    });
  }

  function saveTasks() {
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

    localStorage.setItem("tasks", JSON.stringify(tasksArray));
  }

  function saveLists() {
    const listsArray = [];

    getSidebarLinks().forEach((link) => {
      const category = link.dataset.category;

      if (defaultCategories.includes(category)) {
        return;
      }

      listsArray.push({
        category,
        text: link.querySelector(".sidebar__link-text").textContent,
      });
    });

    localStorage.setItem("lists", JSON.stringify(listsArray));
  }

  function loadTasks() {
    const savedTasks = JSON.parse(localStorage.getItem("tasks"));

    if (!savedTasks) {
      return;
    }

    tasksList.innerHTML = "";

    savedTasks.forEach((task) => {
      const taskItem = createTaskElement(
        task.text,
        task.completed,
        task.favorite,
        task.category
      );

      tasksList.append(taskItem);
    });
  }

  function loadLists() {
    const savedLists = JSON.parse(localStorage.getItem("lists"));

    if (!savedLists) {
      return;
    }

    savedLists.forEach((list) => {
      const listItem = createSidebarListElement(list.text, list.category);

      sidebarList.append(listItem);
    });
  }

  function filterTasks(filterType) {
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

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const taskText = taskInput.value.trim();

    if (taskText === "") {
      return;
    }

    const taskItem = createTaskElement(taskText, false, false, currentCategory);

    tasksList.append(taskItem);

    taskInput.value = "";

    showCurrentCategoryTasks();
    updateSidebarCounters();
    saveTasks();
  });

  tasksList.addEventListener("change", (event) => {
    if (event.target.classList.contains("tasks__checkbox")) {
      updateProgress();
      saveTasks();
    }
  });

  tasksList.addEventListener("click", (event) => {
    if (event.target.classList.contains("tasks__delete")) {
      const taskItem = event.target.closest(".tasks__item");

      taskItem.remove();

      updateProgress();
      updateSidebarCounters();
      saveTasks();
    }

    if (event.target.classList.contains("tasks__favorite")) {
      event.target.classList.toggle("tasks__favorite--active");

      event.target.textContent = event.target.classList.contains(
        "tasks__favorite--active"
      )
        ? "★"
        : "☆";

      saveTasks();
    }
  });

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filterType = button.dataset.filter;

      filterButtons.forEach((btn) => {
        btn.classList.remove("filters__button--active");
      });

      button.classList.add("filters__button--active");

      filterTasks(filterType);
    });
  });

  filterToggleButton.addEventListener("click", () => {
    filters.classList.toggle("filters--open");
  });

  sidebarList.addEventListener("click", (event) => {
    const deleteButton = event.target.closest(".sidebar__delete-list");

    if (deleteButton) {
      event.preventDefault();

      const link = deleteButton.closest(".sidebar__link");
      const category = link.dataset.category;

      const tasksInCategory = document.querySelectorAll(
        `.tasks__item[data-category="${category}"]`
      );

      tasksInCategory.forEach((task) => {
        task.remove();
      });

      link.closest(".sidebar__item").remove();

      if (currentCategory === category) {
        currentCategory = "today";

        const todayLink = document.querySelector(
          '.sidebar__link[data-category="today"]'
        );

        getSidebarLinks().forEach((sidebarLink) => {
          sidebarLink.classList.remove("sidebar__link--active");
        });

        todayLink.classList.add("sidebar__link--active");
        mainTitle.textContent =
          todayLink.querySelector(".sidebar__link-text").textContent;
      }

      showCurrentCategoryTasks();
      updateSidebarCounters();
      saveTasks();
      saveLists();

      return;
    }

    const link = event.target.closest(".sidebar__link");

    if (!link) {
      return;
    }

    event.preventDefault();

    getSidebarLinks().forEach((sidebarLink) => {
      sidebarLink.classList.remove("sidebar__link--active");
    });

    link.classList.add("sidebar__link--active");

    currentCategory = link.dataset.category;
    mainTitle.textContent = link.querySelector(".sidebar__link-text").textContent;

    showCurrentCategoryTasks();
  });

  addListButton.addEventListener("click", () => {
    listModal.classList.add("modal--open");
    listNameInput.focus();
  });

  closeListModal.addEventListener("click", () => {
    listModal.classList.remove("modal--open");
    listNameInput.value = "";
  });

  createListButton.addEventListener("click", () => {
    const listName = listNameInput.value.trim();

    if (!listName) {
      return;
    }

    const categoryId = listName.toLowerCase().replaceAll(" ", "-");

    const listItem = createSidebarListElement(listName, categoryId);

    sidebarList.append(listItem);

    saveLists();
    updateSidebarCounters();

    listModal.classList.remove("modal--open");
    listNameInput.value = "";
  });

  predictionButton.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * predictions.length);

    predictionText.textContent = predictions[randomIndex];

    predictionCard.classList.add("prediction__card--visible");
  });

  loadLists();
  loadTasks();

  showCurrentCategoryTasks();
  updateSidebarCounters();
});