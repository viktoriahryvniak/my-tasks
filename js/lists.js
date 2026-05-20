export const defaultCategories = [
  "today",
  "study",
  "work",
  "personal",
  "shopping",
];

export function getSidebarLinks() {
  return document.querySelectorAll(".sidebar__link");
}

export function createSidebarListElement(categoryName, categoryId) {
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

export function getListsData() {
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

  return listsArray;
}