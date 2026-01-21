document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginPasswordToggle = document.getElementById('loginPasswordToggle');
  const loginSubmitButton = document.getElementById('loginSubmitButton');
  const loginGlobalError = document.getElementById('login-global-error');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');
  const forgotPasswordModal = document.getElementById('forgotPasswordModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalContent = document.getElementById('modalContent');
  const closeModalX = document.getElementById('closeModalX');
  const gotItButton = document.getElementById('gotItButton');
  const guestButton = document.getElementById('guestButton');
  const guestModal = document.getElementById('guestModal');
  const guestModalOverlay = document.getElementById('guestModalOverlay');
  const guestModalContent = document.getElementById('guestModalContent');
  const closeGuestModalX = document.getElementById('closeGuestModalX');
  const guestForm = document.getElementById('guestForm');
  const guestFirstNameInput = document.getElementById('guestFirstName');
  const guestLastNameInput = document.getElementById('guestLastName');
  const guestSubmitButton = document.getElementById('guestSubmitButton');
  const loginGoogleButton = document.getElementById('loginGoogleButton');
  const serviceUnavailableModal = document.getElementById('serviceUnavailableModal');
  const serviceModalOverlay = document.getElementById('serviceModalOverlay');
  const serviceModalContent = document.getElementById('serviceModalContent');
  const closeServiceModalX = document.getElementById('closeServiceModalX');
  const serviceGotItButton = document.getElementById('serviceGotItButton');
  const rememberMeCheckbox = document.getElementById('rememberMe');

  const LoadingState = {
    setLoading(button, isLoading) {
      const buttonText = button.querySelector('#loginButtonText, span:not(.material-symbols-outlined)');
      const spinner = button.querySelector('#loginSpinner, .material-symbols-outlined#loginSpinner');
      const arrow = button.querySelector('#loginArrow, .material-symbols-outlined:not(#loginSpinner)');
      if (isLoading) {
        button.disabled = true;
        if (spinner) spinner.classList.remove('hidden');
        if (arrow) arrow.classList.add('hidden');
        if (buttonText) buttonText.textContent = 'Logging in...';
      } else {
        button.disabled = false;
        if (spinner) spinner.classList.add('hidden');
        if (arrow) arrow.classList.remove('hidden');
        if (buttonText) buttonText.textContent = 'Login';
      }
    }
  };

  const InputFilters = {
    sanitizeName(value) {
      return value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ' -]/g, '');
    },
    sanitizeEmail(value) {
      return value.replace(/[^a-zA-Z0-9@._+-]/g, '');
    }
  };

  const showLoginGlobalError = (message) => {
    if (!loginGlobalError) return;
    loginGlobalError.textContent = message;
    loginGlobalError.classList.remove('hidden');
  };

  const hideLoginGlobalError = () => {
    if (!loginGlobalError) return;
    loginGlobalError.classList.add('hidden');
  };

  const REMEMBER_KEYS = { flag: 'rememberMe', creds: 'rememberCredentials' };
  const applyRememberedCredentials = () => {
    try {
      const flag = localStorage.getItem(REMEMBER_KEYS.flag);
      if (rememberMeCheckbox) rememberMeCheckbox.checked = flag === 'true';
      const storage = flag === 'true' ? localStorage : sessionStorage;
      const raw = storage.getItem(REMEMBER_KEYS.creds);
      if (!raw) return;
      const creds = JSON.parse(raw);
      if (creds && typeof creds === 'object') {
        if (loginEmail && typeof creds.email === 'string') loginEmail.value = creds.email;
        if (loginPassword && typeof creds.password === 'string') loginPassword.value = creds.password;
      }
    } catch {}
  };
  applyRememberedCredentials();

  if (loginPasswordToggle && loginPassword) {
    loginPasswordToggle.addEventListener('click', (e) => {
      e.preventDefault();
      const icon = loginPasswordToggle.querySelector('span');
      if (loginPassword.type === 'password') {
        loginPassword.type = 'text';
        icon.textContent = 'visibility_off';
        loginPasswordToggle.setAttribute('aria-label', 'Hide password');
      } else {
        loginPassword.type = 'password';
        icon.textContent = 'visibility';
        loginPasswordToggle.setAttribute('aria-label', 'Show password');
      }
    });
  }

  if (loginForm) {
    if (loginEmail) {
      loginEmail.addEventListener('blur', () => {
        const email = loginEmail.value.trim();
        if (email && !Validation.email(email)) {
          Validation.showError('loginEmail', 'Please enter a valid email address');
        } else {
          Validation.hideError('loginEmail');
        }
      });
      loginEmail.addEventListener('input', () => {
        loginEmail.value = InputFilters.sanitizeEmail(loginEmail.value);
        Validation.hideError('loginEmail');
        hideLoginGlobalError();
      });
    }
    if (loginPassword) {
      loginPassword.addEventListener('input', () => {
        Validation.hideError('loginPassword');
        hideLoginGlobalError();
      });
    }
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = loginEmail.value.trim();
      const password = loginPassword.value;
      let isValid = true;
      const invalidIds = [];
      if (!email) {
        Validation.showError('loginEmail', 'Email is required');
        isValid = false;
        invalidIds.push('loginEmail');
      } else if (!Validation.email(email)) {
        Validation.showError('loginEmail', 'Please enter a valid email address');
        isValid = false;
        invalidIds.push('loginEmail');
      } else {
        Validation.hideError('loginEmail');
      }
      if (!password) {
        Validation.showError('loginPassword', 'Password is required');
        isValid = false;
        invalidIds.push('loginPassword');
      } else {
        Validation.hideError('loginPassword');
        if (!PasswordPolicy.isAllowed(password)) {
          Validation.showError('loginPassword', 'This symbol is not allowed in the password.');
          isValid = false;
          invalidIds.push('loginPassword');
        }
      }
      if (!isValid) {
        const firstInvalid = invalidIds[0];
        if (firstInvalid) {
          const el = document.getElementById(firstInvalid);
          if (el) el.focus();
        }
        return;
      }
      try {
        if (rememberMeCheckbox && rememberMeCheckbox.checked) {
          localStorage.setItem(REMEMBER_KEYS.flag, 'true');
          localStorage.setItem(REMEMBER_KEYS.creds, JSON.stringify({ email, password }));
          sessionStorage.removeItem(REMEMBER_KEYS.creds);
        } else {
          localStorage.setItem(REMEMBER_KEYS.flag, 'false');
          sessionStorage.setItem(REMEMBER_KEYS.creds, JSON.stringify({ email, password }));
          localStorage.removeItem(REMEMBER_KEYS.creds);
        }
      } catch {}
      LoadingState.setLoading(loginSubmitButton, true);
      try {
        if (!window.Auth || typeof Auth.authenticate !== 'function') {
          throw new Error('Login is temporarily unavailable. Please try again later.');
        }
        const result = Auth.authenticate(email, password);
        if (!result.success) {
          if (result.reason === 'email_not_found') {
            Validation.showError('loginEmail', 'No account found with this email');
          } else if (result.reason === 'wrong_password') {
            Validation.showError('loginPassword', 'Incorrect password');
          } else {
            Validation.showError('loginPassword', 'Invalid email or password');
          }
          showLoginGlobalError('No account found with these details.');
          LoadingState.setLoading(loginSubmitButton, false);
          return;
        }
        Auth.setCurrentUser(result.user);
        hideLoginGlobalError();
        await new Promise(resolve => setTimeout(resolve, 500));
        window.location.href = 'dashboard.html';
      } catch (error) {
        Validation.showError('loginPassword', error.message || 'Invalid email or password');
        showLoginGlobalError('No account found with these details.');
        LoadingState.setLoading(loginSubmitButton, false);
      }
    });
  }

  if (forgotPasswordLink && forgotPasswordModal && modalOverlay && modalContent) {
    ModalManager.setupFocusTrap(modalContent);
    forgotPasswordLink.addEventListener('click', (e) => {
      e.preventDefault();
      ModalManager.open(forgotPasswordModal, modalOverlay, modalContent);
    });
    const closeForgotPasswordModal = () => {
      ModalManager.close(forgotPasswordModal, modalOverlay, modalContent);
    };
    if (closeModalX) closeModalX.addEventListener('click', closeForgotPasswordModal);
    if (gotItButton) gotItButton.addEventListener('click', closeForgotPasswordModal);
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeForgotPasswordModal();
      });
    }
  }

  if (guestButton && guestModal && guestModalOverlay && guestModalContent) {
    ModalManager.setupFocusTrap(guestModalContent);
    const checkGuestFormFields = () => {
      if (!guestFirstNameInput || !guestLastNameInput || !guestSubmitButton) return;
      const firstName = guestFirstNameInput.value.trim();
      const lastName = guestLastNameInput.value.trim();
      const allFilled = firstName !== '' && lastName !== '';
      if (allFilled) {
        guestSubmitButton.disabled = false;
        guestSubmitButton.classList.remove('bg-primary/50', 'hover:bg-primary/50', 'cursor-not-allowed');
        guestSubmitButton.classList.add('bg-primary', 'hover:bg-primary/90', 'cursor-pointer');
      } else {
        guestSubmitButton.disabled = true;
        guestSubmitButton.classList.remove('bg-primary', 'hover:bg-primary/90', 'cursor-pointer');
        guestSubmitButton.classList.add('bg-primary/50', 'hover:bg-primary/50', 'cursor-not-allowed');
      }
    };
    guestButton.addEventListener('click', (e) => {
      e.preventDefault();
      ModalManager.open(guestModal, guestModalOverlay, guestModalContent);
    });
    const closeGuestModal = () => {
      ModalManager.close(guestModal, guestModalOverlay, guestModalContent);
    };
    if (closeGuestModalX) closeGuestModalX.addEventListener('click', closeGuestModal);
    if (guestModalOverlay) {
      guestModalOverlay.addEventListener('click', (e) => {
        if (e.target === guestModalOverlay) closeGuestModal();
      });
    }
    if (guestFirstNameInput) {
      guestFirstNameInput.addEventListener('input', () => {
        guestFirstNameInput.value = InputFilters.sanitizeName(guestFirstNameInput.value);
        Validation.hideError('guestFirstName');
        checkGuestFormFields();
      });
    }
    if (guestLastNameInput) {
      guestLastNameInput.addEventListener('input', () => {
        guestLastNameInput.value = InputFilters.sanitizeName(guestLastNameInput.value);
        Validation.hideError('guestLastName');
        checkGuestFormFields();
      });
    }
    if (guestForm) {
      guestForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const firstName = guestFirstNameInput.value.trim();
        const lastName = guestLastNameInput.value.trim();
        let isValid = true;
        const invalidIds = [];
        if (!firstName) {
          Validation.showError('guestFirstName', 'First name is required');
          isValid = false;
          invalidIds.push('guestFirstName');
        }
        if (!lastName) {
          Validation.showError('guestLastName', 'Last name is required');
          isValid = false;
          invalidIds.push('guestLastName');
        }
        if (!isValid) {
          const firstInvalid = invalidIds[0];
          if (firstInvalid) {
            const el = document.getElementById(firstInvalid);
            if (el) el.focus();
          }
          return;
        }
        try {
          sessionStorage.setItem('guestMode', 'true');
        } catch {}
        window.location.href = 'dashboard.html';
      });
    }
  }

  if (loginGoogleButton && serviceUnavailableModal && serviceModalOverlay && serviceModalContent) {
    ModalManager.setupFocusTrap(serviceModalContent);
    loginGoogleButton.addEventListener('click', (e) => {
      e.preventDefault();
      ModalManager.open(serviceUnavailableModal, serviceModalOverlay, serviceModalContent);
    });
    const closeServiceModal = () => {
      ModalManager.close(serviceUnavailableModal, serviceModalOverlay, serviceModalContent);
    };
    if (closeServiceModalX) closeServiceModalX.addEventListener('click', closeServiceModal);
    if (serviceGotItButton) serviceGotItButton.addEventListener('click', closeServiceModal);
    if (serviceModalOverlay) {
      serviceModalOverlay.addEventListener('click', (e) => {
        if (e.target === serviceModalOverlay) closeServiceModal();
      });
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (ModalManager.activeModal) {
      if (ModalManager.activeModal === forgotPasswordModal) {
        ModalManager.close(forgotPasswordModal, modalOverlay, modalContent);
      } else if (ModalManager.activeModal === guestModal) {
        ModalManager.close(guestModal, guestModalOverlay, guestModalContent);
      } else if (ModalManager.activeModal === serviceUnavailableModal) {
        ModalManager.close(serviceUnavailableModal, serviceModalOverlay, serviceModalContent);
      }
    }
  });
});
