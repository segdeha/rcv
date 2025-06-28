class DragAndDrop {
  constructor(list1Id, list2Id) {
    this.list1 = document.getElementById(list1Id);
    this.list2 = document.getElementById(list2Id);
    this.draggedItem = null; // Stores the currently dragged list item

    this.init(); // Initialize event listeners
  }

  init() {
    // Attach dragstart and dragend listeners to all existing list items
    document.querySelectorAll('.list-item').forEach(item => {
      this.addDragEventListeners(item);
    });

    // Attach dragover, dragleave, and drop listeners to both list containers
    this.list1.addEventListener('dragover', this.handleDragOver.bind(this));
    this.list1.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.list1.addEventListener('drop', this.handleDrop.bind(this));

    this.list2.addEventListener('dragover', this.handleDragOver.bind(this));
    this.list2.addEventListener('dragleave', this.handleDragLeave.bind(this));
    this.list2.addEventListener('drop', this.handleDrop.bind(this));

    // Initial update of positions when the page loads
    document.addEventListener('DOMContentLoaded', this.updatePositions.bind(this));
  }

  /**
   * Adds dragstart and dragend event listeners to a given list item.
   * @param {HTMLElement} item - The list item to attach listeners to.
   */
  addDragEventListeners(item) {
    item.addEventListener('dragstart', this.handleDragStart.bind(this));
    item.addEventListener('dragend', this.handleDragEnd.bind(this));
  }

  /**
   * Event handler for dragstart on a list item.
   * @param {DragEvent} e
   */
  handleDragStart(e) {
    this.draggedItem = e.target;
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      this.draggedItem.classList.add('dragging');
    }, 0);
  }

  /**
   * Event handler for dragend on a list item (cleanup).
   */
  handleDragEnd() {
    if (this.draggedItem) {
      this.draggedItem.classList.remove('dragging');
      this.draggedItem = null;
    }
  }

  /**
   * Finds the element in a container that the dragged item should be placed before.
   * This creates the reordering effect within a list.
   * @param {HTMLElement} container - The list (ul) being dragged over.
   * @param {number} y - The clientY (vertical position) of the drag event.
   * @returns {HTMLElement | null} The element to insert before, or null if appending to end.
   */
  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.list-item:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2; // Offset from center of child
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: -Infinity }).element;
  }

  /**
   * Event handler for dragover on a list container.
   * @param {DragEvent} e
   */
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const list = e.currentTarget; // The list (ul) element being dragged over
    const afterElement = this.getDragAfterElement(list, e.clientY);

    // Remove any existing placeholder in this list
    const currentPlaceholder = list.querySelector('.drag-placeholder');
    if (currentPlaceholder) {
      currentPlaceholder.remove();
    }

    // Add a new placeholder
    if (afterElement) {
      const placeholder = document.createElement('div');
      placeholder.classList.add('drag-placeholder');
      list.insertBefore(placeholder, afterElement);
    } else if (list.children.length === 0 || (list.children.length === 1 && list.querySelector('.dragging'))) {
      // Special case for dropping into an empty list or if the only child is the dragged one
      const placeholder = document.createElement('div');
      placeholder.classList.add('drag-placeholder');
      list.appendChild(placeholder);
    }
  }

  /**
   * Event handler for dragleave on a list container.
   * @param {DragEvent} e
   */
  handleDragLeave(e) {
    // Ensure the dragleave is from the list itself, not just leaving a child *within* the list
    // Check if relatedTarget is outside the current list
    if (!e.currentTarget.contains(e.relatedTarget)) {
      const currentPlaceholder = e.currentTarget.querySelector('.drag-placeholder');
      if (currentPlaceholder) {
        currentPlaceholder.remove();
      }
    }
  }

  /**
   * Event handler for drop on a list container.
   * @param {DragEvent} e
   */
  handleDrop(e) {
    e.preventDefault();

    // Clean up placeholder immediately on drop
    const currentPlaceholder = e.currentTarget.querySelector('.drag-placeholder');
    if (currentPlaceholder) {
      currentPlaceholder.remove();
    }

    if (this.draggedItem) {
      const list = e.currentTarget; // The list (ul) element where item was dropped
      const afterElement = this.getDragAfterElement(list, e.clientY);

      if (afterElement == null) {
        list.appendChild(this.draggedItem);
      } else {
        list.insertBefore(this.draggedItem, afterElement);
      }
      this.updatePositions(); // Update all positions after successful drop
    }
  }

  /**
   * Updates the hidden input 'position' value for all items in list1 and list2.
   * List 1 items get their 1-based index. List 2 items get 0.
   */
  updatePositions() {
    // Update List 1 positions
    const list1Items = this.list1.querySelectorAll('.list-item');
    list1Items.forEach((item, index) => {
      const hiddenInput = item.querySelector('.item-position');
      const positionSpan = item.querySelector('span'); // For display purposes
      hiddenInput.value = index + 1; // 1-based position
      positionSpan.textContent = `Pos: ${hiddenInput.value}`;
    });

    // Update List 2 positions
    const list2Items = this.list2.querySelectorAll('.list-item');
    list2Items.forEach(item => {
      const hiddenInput = item.querySelector('.item-position');
      const positionSpan = item.querySelector('span'); // For display purposes
      hiddenInput.value = 0; // Set to 0 if in List 2
      positionSpan.textContent = `Pos: ${hiddenInput.value}`;
    });

    // console.log('Positions updated.');
    // You can add logic here to emit events or send data to Retool
    // For example, if you wanted to send the current state to Retool:
    /*
    const list1State = Array.from(list1Items).map(item => ({
      id: item.dataset.itemId,
      pos: item.querySelector('.item-position').value
    }));
    const list2State = Array.from(list2Items).map(item => ({
      id: item.dataset.itemId,
      pos: item.querySelector('.item-position').value
    }));
    // In a Retool app, you'd trigger a JS query like:
    // Retool.triggerQuery('updateBackendData', { list1: list1State, list2: list2State });
    */
  }
}

// Initialize the DragDropListManager when the DOM is fully loaded
// document.addEventListener('DOMContentLoaded', () => {
//   new DragDropListManager('list1', 'list2');
// });

export { DragAndDrop };
