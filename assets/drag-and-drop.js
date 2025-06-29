class DragAndDrop {
  static DRAG_THRESHOLD_PX = 2;

  constructor(list1Id, list2Id) {
    this.list1 = document.getElementById(list1Id);
    this.list2 = document.getElementById(list2Id);
    this.draggedItem = null;
    this.lastProcessedDragY = null;
    this.observer = new MutationObserver(this.handleMutation);
    this.init();
  }

  init() {
    const { list1, list2 } = this;

    list1.addEventListener('dragover', this.handleDragOver);
    list1.addEventListener('dragleave', this.handleDragLeave);
    list1.addEventListener('drop', this.handleDrop);

    list2.addEventListener('dragover', this.handleDragOver);
    list2.addEventListener('dragleave', this.handleDragLeave);
    list2.addEventListener('drop', this.handleDrop);

    const observerConfig = { childList: true };
    this.observer.observe(this.list1, observerConfig);
    this.observer.observe(this.list2, observerConfig);
  }

  handleMutation = mutations => {
    for (let i = 0; i < mutations.length; i += 1) {
      const mu = mutations[i];
      if (mu.type === 'childList' && mu.addedNodes.length > 0) {
        for (let j = 0; j < mu.addedNodes.length; j += 1) {
          const node = mu.addedNodes[j];
          if (
            node.nodeType === Node.ELEMENT_NODE &&
            node.classList.contains('list-item') &&
            !node.classList.contains('drag-placeholder')
          ) {
            this.addItemEventListeners();
            break;
          }
        }
      }
    }
  }

  addItemEventListeners = () => {
    const lis = document.querySelectorAll('.list-item');

    if (lis.length === this.lastNumberOfItems) {
      return;
    }

    this.lastNumberOfItems = lis.length;

    lis.forEach(li => {
      // Remove existing listeners first to prevent duplicates if called multiple times
      // This is important to avoid memory leaks and multiple event firings.
      li.removeEventListener('dragstart', this.handleDragStart);
      li.removeEventListener('dragend', this.handleDragEnd);

      // Now, add the listeners
      li.addEventListener('dragstart', this.handleDragStart);
      li.addEventListener('dragend', this.handleDragEnd);
    });

    // Update positions after refreshing listeners
    // (important for initial load and after dynamic adds)
    this.updatePositions();
  }

  /**
   * Event handler for dragstart on a list item.
   * @param {DragEvent} e
   */
  handleDragStart = e => {
    this.draggedItem = e.target.closest('.list-item');
    e.dataTransfer.effectAllowed = 'move';
    window.requestAnimationFrame(() => {
        this.draggedItem.classList.add('dragging');
    });
  }

  /**
   * Event handler for dragend on a list item (cleanup).
   */
  handleDragEnd = e => {
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

    for (const child of draggableElements) {
      const box = child.getBoundingClientRect();
      // If the mouse Y position is above the midpoint of the current child element,
      // then the dragged item should be inserted before this child.
      // This creates a larger "insert before" zone, making drops more forgiving.
      if (y < box.top + box.height / 2) {
        return child;
      }
    }

    // If the mouse is below all draggable elements, return null to append to the end.
    return null;
  }

  /**
   * Event handler for dragover on a list container.
   * @param {DragEvent} e
   */
  handleDragOver = e => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    // --- Filtering logic based on movement threshold ---
    // Only process if the mouse has moved significantly since the last update
    if (Math.abs(e.clientY - this.lastProcessedDragY) < DragAndDrop.DRAG_THRESHOLD_PX) {
      return; // Cursor has not moved enough, skip this event
    }
    this.lastProcessedDragY = e.clientY; // Update last processed Y position

    const list = e.currentTarget;
    const afterElement = this.getDragAfterElement(list, e.clientY);

    let currentPlaceholder = list.querySelector('.drag-placeholder');

    // Determine the desired position (target parent and target sibling)
    const targetParent = list;
    const targetNextSibling = afterElement; // If afterElement is null, it means append to end

    // Case 1: Placeholder exists
    if (currentPlaceholder) {
      // Check if placeholder is ALREADY in the desired position
      if (currentPlaceholder.parentNode === targetParent && currentPlaceholder.nextElementSibling === targetNextSibling) {
        return; // Already in the right spot, do nothing
      } else {
        // Placeholder exists but is in the wrong place, move it
        // console.log("Moving existing placeholder");
        if (targetNextSibling) {
          targetParent.insertBefore(currentPlaceholder, targetNextSibling);
        } else {
          targetParent.appendChild(currentPlaceholder);
        }
      }
    }
    // Case 2: Placeholder does NOT exist, and we need one
    else {
      // console.log("Creating new placeholder");
      const newPlaceholder = document.createElement('div');
      newPlaceholder.classList.add('drag-placeholder');
      if (targetNextSibling) {
        targetParent.insertBefore(newPlaceholder, targetNextSibling);
      } else {
        targetParent.appendChild(newPlaceholder);
      }
    }
    // console.log('handleDragOver fired on:', list.id); // Log for debugging
  }

  /**
   * Event handler for dragleave on a list container.
   * @param {DragEvent} e
   */
  handleDragLeave = e => {
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
  handleDrop = e => {
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
    list1Items.forEach((item, idx) => {
      const hiddenInput = item.querySelector('input[type="hidden"]');
      hiddenInput.value = idx + 1; // 1-based position
    });

    // Update List 2 positions
    const list2Items = this.list2.querySelectorAll('.list-item');
    list2Items.forEach(item => {
      const hiddenInput = item.querySelector('input[type="hidden"]');
      hiddenInput.value = 0; // Set to 0 if in List 2
    });
  }
}

export { DragAndDrop };
