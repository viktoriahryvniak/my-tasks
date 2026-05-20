import { getFromStorage, saveToStorage } from "./storage.js";
import { createTaskElement, getTasksData } from "./tasks.js";
import {
  createSidebarListElement,
  defaultCategories,
  getListsData,
  getSidebarLinks,
} from "./lists.js";
import {
  filterTasks,
  predictions,
  showCurrentCategoryTasks,
  updateSidebarCounters,
} from "./ui.js";

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

  const themeToggle = document.querySelector(".theme-toggle");

  const predictionSection = document.querySelector(".prediction");
  const predictionButton = document.querySelector(".prediction__button");
  const predictionCard = document.querySelector(".prediction__card");
  const predictionText = document.querySelector(".prediction__text");

  if (
    !taskForm ||
    !taskInput ||
    !tasksList ||
    !mainTitle ||
    !progressTitle ||
    !progressLine ||
    !filterToggleButton ||
    !filters ||
    !emptyMessage ||
    !addListButton ||
    !sidebarList ||
    !listModal ||
    !listNameInput ||
    !closeListModal ||
    !createListButton ||
    !themeToggle ||
    !predictionSection ||
    !predictionButton ||
    !predictionCard ||
    !predictionText
  ) {
    return;
  }

  let currentCategory = "today";

  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark-theme");
    themeToggle.textContent = "☀️";
  }

  function saveTasks() {
    saveToStorage("tasks", getTasksData());
  }

  function saveLists() {
    saveToStorage("lists", getListsData());
  }

  function renderCurrentCategory() {
    showCurrentCategoryTasks(
      currentCategory,
      emptyMessage,
      progressTitle,
      progressLine,
      predictionSection,
      predictionCard
    );
  }

  function refreshCounters() {
    updateSidebarCounters(getSidebarLinks);
  }

  function loadTasks() {
    const savedTasks = getFromStorage("tasks");

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
    const savedLists = getFromStorage("lists");

    if (!savedLists) {
      return;
    }

    savedLists.forEach((list) => {
      const listItem = createSidebarListElement(list.text, list.category);

      sidebarList.append(listItem);
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

    renderCurrentCategory();
    refreshCounters();
    saveTasks();
  });

  tasksList.addEventListener("change", (event) => {
    if (event.target.classList.contains("tasks__checkbox")) {
      renderCurrentCategory();
      saveTasks();
    }
  });

  tasksList.addEventListener("click", (event) => {
    if (event.target.classList.contains("tasks__delete")) {
      const taskItem = event.target.closest(".tasks__item");

      taskItem.remove();

      renderCurrentCategory();
      refreshCounters();
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

      filterTasks(currentCategory, filterType);
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

      renderCurrentCategory();
      refreshCounters();
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

    renderCurrentCategory();
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

    if (defaultCategories.includes(categoryId)) {
      return;
    }

    const listItem = createSidebarListElement(listName, categoryId);

    sidebarList.append(listItem);

    saveLists();
    refreshCounters();

    listModal.classList.remove("modal--open");
    listNameInput.value = "";
  });

  predictionButton.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * predictions.length);

    predictionText.textContent = predictions[randomIndex];

    predictionCard.classList.add("prediction__card--visible");
  });

  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    const isDark = document.body.classList.contains("dark-theme");

    if (isDark) {
      localStorage.setItem("theme", "dark");
      themeToggle.textContent = "☀️";
    } else {
      localStorage.setItem("theme", "light");
      themeToggle.textContent = "🌙";
    }
  });

  loadLists();
  loadTasks();

  renderCurrentCategory();
  refreshCounters();
});