// Utilidades de validación para formularios

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidation {
  field: string;
  isValid: boolean;
  error?: string;
}

/**
 * Valida formato de email
 */
export const validateEmail = (email: string): FieldValidation => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email.trim()) {
    return {
      field: 'email',
      isValid: false,
      error: 'El correo electrónico es requerido'
    };
  }
  
  if (!emailRegex.test(email)) {
    return {
      field: 'email',
      isValid: false,
      error: 'Formato de correo electrónico inválido'
    };
  }
  
  return {
    field: 'email',
    isValid: true
  };
};

/**
 * Valida contraseña
 */
export const validatePassword = (password: string, isRegistration = false): FieldValidation => {
  if (!password) {
    return {
      field: 'password',
      isValid: false,
      error: 'La contraseña es requerida'
    };
  }

  // Para registro, validaciones más estrictas
  if (isRegistration) {
    if (password.length < 8) {
      return {
        field: 'password',
        isValid: false,
        error: 'La contraseña debe tener al menos 8 caracteres'
      };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return {
        field: 'password',
        isValid: false,
        error: 'La contraseña debe contener al menos una letra minúscula'
      };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        field: 'password',
        isValid: false,
        error: 'La contraseña debe contener al menos una letra mayúscula'
      };
    }

    if (!/(?=.*\d)/.test(password)) {
      return {
        field: 'password',
        isValid: false,
        error: 'La contraseña debe contener al menos un número'
      };
    }

    if (!/(?=.*[@$!%*?&])/.test(password)) {
      return {
        field: 'password',
        isValid: false,
        error: 'La contraseña debe contener al menos un carácter especial (@$!%*?&)'
      };
    }
  } else {
    // Para login, validación básica
    if (password.length < 6) {
      return {
        field: 'password',
        isValid: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      };
    }
  }

  return {
    field: 'password',
    isValid: true
  };
};

/**
 * Valida confirmación de contraseña
 */
export const validatePasswordConfirmation = (password: string, confirmPassword: string): FieldValidation => {
  if (!confirmPassword) {
    return {
      field: 'confirmPassword',
      isValid: false,
      error: 'Debes confirmar tu contraseña'
    };
  }

  if (password !== confirmPassword) {
    return {
      field: 'confirmPassword',
      isValid: false,
      error: 'Las contraseñas no coinciden'
    };
  }

  return {
    field: 'confirmPassword',
    isValid: true
  };
};

/**
 * Valida nombre (para registro)
 */
export const validateName = (name: string, fieldName: string = 'nombre'): FieldValidation => {
  if (!name.trim()) {
    return {
      field: fieldName,
      isValid: false,
      error: `El ${fieldName} es requerido`
    };
  }

  if (name.trim().length < 2) {
    return {
      field: fieldName,
      isValid: false,
      error: `El ${fieldName} debe tener al menos 2 caracteres`
    };
  }

  if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(name)) {
    return {
      field: fieldName,
      isValid: false,
      error: `El ${fieldName} solo puede contener letras y espacios`
    };
  }

  return {
    field: fieldName,
    isValid: true
  };
};

/**
 * Valida credenciales de login
 */
export const validateLoginForm = (email: string, password: string): ValidationResult => {
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password, false);

  const errors: string[] = [];
  
  if (!emailValidation.isValid && emailValidation.error) {
    errors.push(emailValidation.error);
  }
  
  if (!passwordValidation.isValid && passwordValidation.error) {
    errors.push(passwordValidation.error);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Valida formulario de registro
 */
export const validateRegisterForm = (
  nombre: string,
  apellido: string,
  email: string,
  password: string,
  confirmPassword: string
): ValidationResult => {
  const nameValidation = validateName(nombre, 'nombre');
  const lastNameValidation = validateName(apellido, 'apellido');
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password, true);
  const confirmPasswordValidation = validatePasswordConfirmation(password, confirmPassword);

  const errors: string[] = [];

  if (!nameValidation.isValid && nameValidation.error) {
    errors.push(nameValidation.error);
  }

  if (!lastNameValidation.isValid && lastNameValidation.error) {
    errors.push(lastNameValidation.error);
  }

  if (!emailValidation.isValid && emailValidation.error) {
    errors.push(emailValidation.error);
  }

  if (!passwordValidation.isValid && passwordValidation.error) {
    errors.push(passwordValidation.error);
  }

  if (!confirmPasswordValidation.isValid && confirmPasswordValidation.error) {
    errors.push(confirmPasswordValidation.error);
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Obtiene mensaje de error amigable para errores del backend
 */
export const getBackendErrorMessage = (error: unknown): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error) {
    // Errores comunes del backend
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return 'Correo electrónico o contraseña incorrectos';
    }
    
    if (error.message.includes('404') || error.message.includes('Not Found')) {
      return 'Usuario no encontrado. Verifica tus credenciales.';
    }
    
    if (error.message.includes('400') || error.message.includes('Bad Request')) {
      return 'Datos inválidos. Revisa la información ingresada.';
    }
    
    if (error.message.includes('409') || error.message.includes('Conflict')) {
      return 'El correo electrónico ya está registrado';
    }
    
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return 'Error interno del servidor. Intenta nuevamente más tarde.';
    }

    if (error.message.includes('Network') || error.message.includes('fetch')) {
      return 'Error de conexión. Verifica tu conexión a internet.';
    }
    
    return error.message;
  }

  return 'Ha ocurrido un error inesperado';
};
