;(function (window) {
  const Validation = {
    email(email) {
      const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return re.test(email);
    },
    passwordStrength(password) {
      if (!password || password.length === 0) return 0;
      const condition1 = password.length >= 6;
      const condition2 = password.length >= 8;
      const condition3 = condition2 && ((/[a-z]/.test(password) && /[A-Z]/.test(password)) || /\d/.test(password));
      const condition4 = condition3 && /[!@#$%^&*()_\-+=]/.test(password);
      if (condition4) return 4;
      if (condition3) return 3;
      if (condition2) return 2;
      if (condition1) return 1;
      return 0;
    },
    getStrengthText(strength) {
      const texts = ['', 'Weak', 'Weak', 'Medium', 'Strong'];
      return texts[strength] || '';
    },
    showError(elementId, message) {
      let errorElement = document.getElementById(elementId + '-error');
      const inputElement = document.getElementById(elementId);
      if (!errorElement && inputElement) {
        const describedBy = inputElement.getAttribute('aria-describedby');
        if (describedBy) {
          const resolvedId = describedBy.split(' ')[0];
          errorElement = document.getElementById(resolvedId);
        }
      }
      if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        errorElement.setAttribute('role', 'alert');
        errorElement.setAttribute('aria-live', 'polite');
      }
      if (inputElement) {
        inputElement.classList.add('border-red-500', 'dark:border-red-500');
        inputElement.setAttribute('aria-invalid', 'true');
      }
    },
    hideError(elementId) {
      let errorElement = document.getElementById(elementId + '-error');
      const inputElement = document.getElementById(elementId);
      if (!errorElement && inputElement) {
        const describedBy = inputElement.getAttribute('aria-describedby');
        if (describedBy) {
          const resolvedId = describedBy.split(' ')[0];
          errorElement = document.getElementById(resolvedId);
        }
      }
      if (errorElement) {
        errorElement.classList.add('hidden');
      }
      if (inputElement) {
        inputElement.classList.remove('border-red-500', 'dark:border-red-500');
        inputElement.removeAttribute('aria-invalid');
      }
    }
  };
  const PasswordPolicy = {
    allowedPattern: /^[a-zA-Z0-9!@#$%^&*()_\-+=]+$/,
    isAllowed(value) {
      return this.allowedPattern.test(value);
    },
    rulesDescription: 'Allowed: letters a-z A-Z, numbers 0-9, symbols ! @ # $ % ^ & * ( ) _ - + ='
  };
  window.Validation = Validation;
  window.PasswordPolicy = PasswordPolicy;
})(window);
