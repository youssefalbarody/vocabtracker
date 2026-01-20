const ModalManager = {
  activeModal: null,
  previousFocus: null,
  open(modalElement, overlayElement, contentElement) {
    this.activeModal = modalElement;
    this.previousFocus = document.activeElement;
    overlayElement.classList.remove("overlay-exit", "overlay-exit-active", "overlay-enter-active");
    overlayElement.classList.add("overlay-enter");
    contentElement.classList.remove("modal-exit", "modal-exit-active", "modal-enter-active");
    contentElement.classList.add("modal-enter");
    modalElement.classList.remove("hidden");
    modalElement.classList.add("flex");
    document.body.style.overflow = "hidden";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        overlayElement.classList.remove("overlay-enter");
        overlayElement.classList.add("overlay-enter-active");
        contentElement.classList.remove("modal-enter");
        contentElement.classList.add("modal-enter-active");
      });
    });
    const firstFocusable = contentElement.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    if (firstFocusable) firstFocusable.focus();
  },
  close(modalElement, overlayElement, contentElement) {
    overlayElement.classList.remove("overlay-enter-active");
    overlayElement.classList.add("overlay-exit-active");
    contentElement.classList.remove("modal-enter-active");
    contentElement.classList.add("modal-exit-active");
    setTimeout(() => {
      modalElement.classList.add("hidden");
      modalElement.classList.remove("flex");
      document.body.style.overflow = "";
      overlayElement.classList.remove("overlay-exit-active", "overlay-enter-active", "overlay-exit");
      overlayElement.classList.add("overlay-enter");
      contentElement.classList.remove("modal-exit-active", "modal-enter-active", "modal-exit");
      contentElement.classList.add("modal-enter");
      if (this.previousFocus) this.previousFocus.focus();
      this.activeModal = null;
      this.previousFocus = null;
    }, 200);
  },
  setupFocusTrap(contentElement) {
    const focusableElements = contentElement.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    contentElement.addEventListener("keydown", function (e) {
      if (e.key !== "Tab") return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    });
  }
};

