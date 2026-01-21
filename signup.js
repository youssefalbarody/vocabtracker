document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const signupFirstName = document.getElementById('signupFirstName');
  const signupLastName = document.getElementById('signupLastName');
  const signupEmail = document.getElementById('signupEmail');
  const password = document.getElementById('password');
  const confirmpassword = document.getElementById('confirmpassword');
  const togglePasswordBtn = document.getElementById('toggle-password');
  const signupSubmitButton = document.getElementById('signupSubmitButton');
  const googleSignupButton = document.getElementById('googleSignupButton');
  const serviceModal = document.getElementById('serviceUnavailableModal');
  const serviceModalOverlay = document.getElementById('serviceModalOverlay');
  const serviceModalContent = document.getElementById('serviceModalContent');
  const closeServiceModalX = document.getElementById('closeServiceModalX');
  const serviceGotItButton = document.getElementById('serviceGotItButton');

  const LoadingState = {
    setLoading(button, isLoading) {
      const buttonText = button.querySelector('#signupButtonText, span:not(.material-symbols-outlined)');
      const spinner = button.querySelector('#signupSpinner, .material-symbols-outlined#signupSpinner');
      const icon = button.querySelector('#signupIcon, .material-symbols-outlined:not(#signupSpinner)');
      if (isLoading) {
        button.disabled = true;
        if (spinner) spinner.classList.remove('hidden');
        if (icon) icon.classList.add('hidden');
        if (buttonText) buttonText.textContent = 'Creating account...';
      } else {
        button.disabled = false;
        if (spinner) spinner.classList.add('hidden');
        if (icon) icon.classList.remove('hidden');
        if (buttonText) buttonText.textContent = 'Sign Up';
      }
    }
  };

  const InputFilters = {
    sanitizeName(value) {
      return value.replace(/[^a-zA-ZÀ-ÖØ-öø-ÿ' -]/g, '');
    },
    sanitizeEmail(value) {
      return value.replace(/[^a-zA-Z0-9@._+-]/g, '');
    },
    sanitizePassword(value) {
      return value.replace(/\s/g, '');
    }
  };

  function updatePasswordStrength(pwd) {
    const strength = Validation.passwordStrength(pwd);
    const strengthText = document.getElementById('strength-text');
    const strengthBars = [1, 2, 3, 4].map(i => document.getElementById(`strength-bar-${i}`));
    strengthBars.forEach((bar, index) => {
      if (!bar) return;
      const barIndex = index + 1;
      bar.classList.remove(
        'bg-red-500',
        'bg-orange-500',
        'bg-green-300',
        'bg-gray-200',
        'bg-gray-700',
        'dark:bg-gray-700',
        'dark:bg-gray-200',
        'dark:bg-red-500',
        'dark:bg-orange-500',
        'dark:bg-green-300'
      );
      if (pwd.length === 0 || strength === 0) {
        bar.classList.add('bg-gray-200', 'dark:bg-gray-700');
        bar.setAttribute('aria-label', `Strength bar ${barIndex} - inactive`);
      } else if (strength === 1 || strength === 2) {
        if (barIndex <= 2) {
          bar.classList.add('bg-red-500', 'dark:bg-red-500');
          bar.setAttribute('aria-label', `Strength bar ${barIndex} - weak`);
        } else {
          bar.classList.add('bg-gray-200', 'dark:bg-gray-700');
          bar.setAttribute('aria-label', `Strength bar ${barIndex} - inactive`);
        }
      } else if (strength === 3) {
        if (barIndex <= 3) {
          bar.classList.add('bg-orange-500', 'dark:bg-orange-500');
          bar.setAttribute('aria-label', `Strength bar ${barIndex} - medium`);
        } else {
          bar.classList.add('bg-gray-200', 'dark:bg-gray-700');
          bar.setAttribute('aria-label', `Strength bar ${barIndex} - inactive`);
        }
      } else if (strength === 4) {
        bar.classList.add('bg-green-300', 'dark:bg-green-300');
        bar.setAttribute('aria-label', `Strength bar ${barIndex} - strong`);
      }
    });
    if (strengthText) {
      if (pwd.length === 0) {
        strengthText.textContent = '';
      } else {
        const strengthLabel = Validation.getStrengthText(strength);
        strengthText.textContent = `Password strength: ${strengthLabel}`;
      }
    }
    const strengthContainer = document.getElementById('password-strength');
    if (strengthContainer && pwd.length > 0) {
      const strengthLabel = Validation.getStrengthText(strength);
      strengthContainer.setAttribute('aria-label', `Password strength: ${strengthLabel}`);
    }
  }

  function showSuccessMessage(message) {
    const existingMessage = document.getElementById('signup-success-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    const successDiv = document.createElement('div');
    successDiv.id = 'signup-success-message';
    successDiv.className = 'mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg';
    successDiv.innerHTML = '<div class="flex items-center gap-2"><span class="material-symbols-outlined text-green-600 dark:text-green-400">check_circle</span><p class="text-green-700 dark:text-green-400 text-sm font-medium">' + message + '</p></div>';
    if (signupForm && signupForm.parentNode) {
      signupForm.parentNode.insertBefore(successDiv, signupForm.nextSibling);
    }
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.style.transition = 'opacity 0.3s ease-out';
        successDiv.style.opacity = '0';
        setTimeout(() => {
          if (successDiv.parentNode) {
            successDiv.remove();
          }
        }, 300);
      }
    }, 5000);
  }

  if (togglePasswordBtn && password) {
    togglePasswordBtn.addEventListener('click', () => {
      const type = password.type === 'password' ? 'text' : 'password';
      password.type = type;
      const icon = togglePasswordBtn.querySelector('span');
      if (icon) icon.textContent = type === 'password' ? 'visibility' : 'visibility_off';
      togglePasswordBtn.setAttribute('aria-label', type === 'password' ? 'Show password' : 'Hide password');
    });
  }

  if (password) {
    password.addEventListener('input', (e) => {
      password.value = InputFilters.sanitizePassword(password.value);
      updatePasswordStrength(e.target.value);
      Validation.hideError('password');
    });
  }

  if (signupFirstName) {
    signupFirstName.addEventListener('blur', () => {
      const firstName = signupFirstName.value.trim();
      if (!firstName) {
        Validation.showError('signupFirstName', 'First name is required');
      } else {
        Validation.hideError('signupFirstName');
      }
    });
    signupFirstName.addEventListener('input', () => {
      signupFirstName.value = InputFilters.sanitizeName(signupFirstName.value);
      Validation.hideError('signupFirstName');
    });
  }

  if (signupLastName) {
    signupLastName.addEventListener('blur', () => {
      const lastName = signupLastName.value.trim();
      if (!lastName) {
        Validation.showError('signupLastName', 'Last name is required');
      } else {
        Validation.hideError('signupLastName');
      }
    });
    signupLastName.addEventListener('input', () => {
      signupLastName.value = InputFilters.sanitizeName(signupLastName.value);
      Validation.hideError('signupLastName');
    });
  }

  if (signupEmail) {
    signupEmail.addEventListener('blur', () => {
      const email = signupEmail.value.trim();
      if (email && !Validation.email(email)) {
        Validation.showError('signupEmail', 'Please enter a valid email address');
      } else {
        Validation.hideError('signupEmail');
      }
    });
    signupEmail.addEventListener('input', () => {
      signupEmail.value = InputFilters.sanitizeEmail(signupEmail.value);
      Validation.hideError('signupEmail');
    });
  }

  if (confirmpassword) {
    confirmpassword.addEventListener('input', () => {
      if (confirmpassword.value && password.value) {
        if (confirmpassword.value !== password.value) {
          Validation.showError('confirmpassword', 'Passwords do not match');
        } else {
          Validation.hideError('confirmpassword');
        }
      } else {
        Validation.hideError('confirmpassword');
      }
    });
    confirmpassword.addEventListener('blur', () => {
      if (confirmpassword.value && password.value && confirmpassword.value !== password.value) {
        Validation.showError('confirmpassword', 'Passwords do not match');
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const firstName = signupFirstName ? signupFirstName.value.trim() : '';
      const lastName = signupLastName ? signupLastName.value.trim() : '';
      const email = signupEmail.value.trim();
      const passwordValue = password.value;
      const confirmPasswordValue = confirmpassword.value;
      let isValid = true;
      const invalidIds = [];
      if (!firstName) {
        Validation.showError('signupFirstName', 'First name is required');
        isValid = false;
        invalidIds.push('signupFirstName');
      } else {
        Validation.hideError('signupFirstName');
      }
      if (!lastName) {
        Validation.showError('signupLastName', 'Last name is required');
        isValid = false;
        invalidIds.push('signupLastName');
      } else {
        Validation.hideError('signupLastName');
      }
      if (!email) {
        Validation.showError('signupEmail', 'Email is required');
        isValid = false;
        invalidIds.push('signupEmail');
      } else if (!Validation.email(email)) {
        Validation.showError('signupEmail', 'Please enter a valid email address');
        isValid = false;
        invalidIds.push('signupEmail');
      } else {
        Validation.hideError('signupEmail');
      }
      if (!passwordValue) {
        Validation.showError('password', 'Password is required');
        isValid = false;
        invalidIds.push('password');
      } else if (passwordValue.length < 8) {
        Validation.showError('password', 'Password must be at least 8 characters long');
        isValid = false;
        invalidIds.push('password');
      } else {
        Validation.hideError('password');
        if (!PasswordPolicy.isAllowed(passwordValue)) {
          Validation.showError('password', 'This symbol is not allowed in the password.');
          isValid = false;
          invalidIds.push('password');
        }
      }
      if (!confirmPasswordValue) {
        Validation.showError('confirmpassword', 'Please confirm your password');
        isValid = false;
        invalidIds.push('confirmpassword');
      } else if (passwordValue !== confirmPasswordValue) {
        Validation.showError('confirmpassword', 'Passwords do not match');
        isValid = false;
        invalidIds.push('confirmpassword');
      } else {
        Validation.hideError('confirmpassword');
      }
      if (!isValid) {
        const firstInvalid = invalidIds[0];
        if (firstInvalid) {
          const el = document.getElementById(firstInvalid);
          if (el) el.focus();
        }
        return;
      }
      LoadingState.setLoading(signupSubmitButton, true);
      try {
        if (!window.Auth || typeof Auth.registerUser !== 'function') {
          throw new Error('Signup is temporarily unavailable. Please try again later.');
        }
        const result = Auth.registerUser({
          firstName,
          lastName,
          email,
          password: passwordValue
        });
        if (!result.success) {
          if (result.reason === 'email_exists') {
            Validation.showError('signupEmail', 'An account with this email already exists');
          } else if (result.reason === 'storage_failed') {
            Validation.showError('signupEmail', 'Unable to save your account. Please check your browser storage and try again.');
          } else {
            Validation.showError('signupEmail', 'Unable to create account. Please try again.');
          }
          LoadingState.setLoading(signupSubmitButton, false);
          return;
        }
        await new Promise(resolve => setTimeout(resolve, 800));
        showSuccessMessage('Account created successfully. Redirecting to login...');
        signupForm.reset();
        updatePasswordStrength('');
        LoadingState.setLoading(signupSubmitButton, false);
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1200);
      } catch (error) {
        Validation.showError('signupEmail', error.message || 'An error occurred. Please try again.');
        LoadingState.setLoading(signupSubmitButton, false);
      }
    });
  }

  if (googleSignupButton && serviceModal && serviceModalOverlay && serviceModalContent) {
    ModalManager.setupFocusTrap(serviceModalContent);
    googleSignupButton.addEventListener('click', (e) => {
      e.preventDefault();
      ModalManager.open(serviceModal, serviceModalOverlay, serviceModalContent);
    });
    const closeServiceModal = () => {
      ModalManager.close(serviceModal, serviceModalOverlay, serviceModalContent);
    };
    if (closeServiceModalX) closeServiceModalX.addEventListener('click', closeServiceModal);
    if (serviceGotItButton) serviceGotItButton.addEventListener('click', closeServiceModal);
    if (serviceModalOverlay) {
      serviceModalOverlay.addEventListener('click', (e) => {
        if (e.target === serviceModalOverlay) closeServiceModal();
      });
    }
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      if (ModalManager.activeModal && ModalManager.activeModal === serviceModal) {
        ModalManager.close(serviceModal, serviceModalOverlay, serviceModalContent);
      }
    });
  }
});
