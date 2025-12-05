import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AuthForm from '../AuthForm';
import { apiClient } from '../../modules/api';

// Mock the API client
vi.mock('../../modules/api', () => ({
  apiClient: {
    login: vi.fn(),
    registerUser: vi.fn(),
  },
}));

describe('AuthForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Login Mode - Rendering', () => {
    it('should render login form with title', () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByText('Iniciar sesión')).toBeInTheDocument();
    });

    it('should render email input', () => {
      render(<AuthForm mode="login" />);

      const emailInput = screen.getByPlaceholderText('Correo electrónico');
      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toBeRequired();
    });

    it('should render password input', () => {
      render(<AuthForm mode="login" />);

      const passwordInput = screen.getByPlaceholderText('Contraseña');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toBeRequired();
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });

    it('should render submit button', () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    });

    it('should render logo and app name', () => {
      render(<AuthForm mode="login" />);

      expect(screen.getByAltText('SaluIA Logo')).toBeInTheDocument();
      expect(screen.getByText('SaluIA')).toBeInTheDocument();
    });

    it('should not render name fields in login mode', () => {
      render(<AuthForm mode="login" />);

      expect(screen.queryByPlaceholderText('Nombre')).not.toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Apellido')).not.toBeInTheDocument();
    });

    it('should not render role selector in login mode', () => {
      render(<AuthForm mode="login" />);

      const roleSelect = screen.queryByRole('combobox');
      expect(roleSelect).not.toBeInTheDocument();
    });
  });

  describe('Register Mode - Rendering', () => {
    it('should render register form with title', () => {
      render(<AuthForm mode="register" />);

      expect(screen.getByText('Crear cuenta nueva')).toBeInTheDocument();
    });

    it('should render name and last name inputs', () => {
      render(<AuthForm mode="register" />);

      expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Apellido')).toBeInTheDocument();
    });

    it('should render role selector', () => {
      render(<AuthForm mode="register" />);

      const roleSelect = screen.getByRole('combobox');
      expect(roleSelect).toBeInTheDocument();
    });

    it('should have resident as default role', () => {
      render(<AuthForm mode="register" />);

      const roleSelect = screen.getByRole('combobox');
      expect(roleSelect).toHaveValue('resident');
    });

    it('should render all role options', () => {
      render(<AuthForm mode="register" />);

      expect(screen.getByRole('option', { name: 'Médico Residente' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Médico Jefe' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Jefe de Servicio' })).toBeInTheDocument();
    });

    it('should render submit button with register text', () => {
      render(<AuthForm mode="register" />);

      expect(screen.getByRole('button', { name: 'Registrarse' })).toBeInTheDocument();
    });

    it('should render email and password inputs', () => {
      render(<AuthForm mode="register" />);

      expect(screen.getByPlaceholderText('Correo electrónico')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Contraseña')).toBeInTheDocument();
    });
  });

  describe('Login Mode - User Interaction', () => {
    it('should allow typing in email input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthForm mode="login" />);

      const emailInput = screen.getByPlaceholderText('Correo electrónico');
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should allow typing in password input', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthForm mode="login" />);

      const passwordInput = screen.getByPlaceholderText('Contraseña');
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should show loading state when submitting', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.login.mockImplementation(() => new Promise(() => {}));

      render(<AuthForm mode="login" />);

      const emailInput = screen.getByPlaceholderText('Correo electrónico');
      const passwordInput = screen.getByPlaceholderText('Contraseña');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Entrar' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Procesando...' })).toBeInTheDocument();
      });
    });

    it('should disable button when loading', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.login.mockImplementation(() => new Promise(() => {}));

      render(<AuthForm mode="login" />);

      const emailInput = screen.getByPlaceholderText('Correo electrónico');
      const passwordInput = screen.getByPlaceholderText('Contraseña');

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      const submitButton = screen.getByRole('button', { name: 'Entrar' });
      await user.click(submitButton);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: 'Procesando...' });
        expect(button).toBeDisabled();
      });
    });
  });

  describe('Register Mode - User Interaction', () => {
    it('should allow filling all registration fields', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthForm mode="register" />);

      await user.type(screen.getByPlaceholderText('Nombre'), 'Juan');
      await user.type(screen.getByPlaceholderText('Apellido'), 'Pérez');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'juan@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'secure123');

      expect(screen.getByPlaceholderText('Nombre')).toHaveValue('Juan');
      expect(screen.getByPlaceholderText('Apellido')).toHaveValue('Pérez');
      expect(screen.getByPlaceholderText('Correo electrónico')).toHaveValue('juan@example.com');
      expect(screen.getByPlaceholderText('Contraseña')).toHaveValue('secure123');
    });

    it('should allow changing role', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthForm mode="register" />);

      const roleSelect = screen.getByRole('combobox');
      await user.selectOptions(roleSelect, 'supervisor');

      expect(roleSelect).toHaveValue('supervisor');
    });

    it('should handle role change to admin', async () => {
      const user = userEvent.setup({ delay: null });
      render(<AuthForm mode="register" />);

      const roleSelect = screen.getByRole('combobox');
      await user.selectOptions(roleSelect, 'admin');

      expect(roleSelect).toHaveValue('admin');
    });
  });

  describe('Login - Success Flow', () => {
    it('should handle successful login', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.login.mockResolvedValue({
        success: true,
        data: {
          session: {
            user: { id: '123', email: 'test@example.com' },
            token: 'fake-token',
          },
        },
      });

      render(<AuthForm mode="login" />);

      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Entrar' }));

      await waitFor(() => {
        expect(apiClient.login).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido/a!')).toBeInTheDocument();
      });

      expect(screen.getByText('Redirigiendo al dashboard...')).toBeInTheDocument();
    });

    it('should store session in localStorage on successful login', async () => {
      const user = userEvent.setup({ delay: null });
      const mockSession = {
        user: { id: '123', email: 'test@example.com' },
        token: 'fake-token',
      };

      apiClient.login.mockResolvedValue({
        success: true,
        data: { session: mockSession },
      });

      render(<AuthForm mode="login" />);

      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Entrar' }));

      await waitFor(() => {
        const stored = localStorage.getItem('saluia.session');
        expect(stored).toBeTruthy();
        expect(JSON.parse(stored)).toEqual(mockSession);
      });
    });

    it('should display success screen with redirect message', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.login.mockResolvedValue({
        success: true,
        data: {
          session: {
            user: { id: '123', email: 'test@example.com' },
            token: 'fake-token',
          },
        },
      });

      render(<AuthForm mode="login" />);

      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Entrar' }));

      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido/a!')).toBeInTheDocument();
        expect(screen.getByText('Redirigiendo al dashboard...')).toBeInTheDocument();
      });
    });
  });

  describe('Login - Error Handling', () => {
    it('should display error message on failed login', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.login.mockResolvedValue({
        success: false,
        error: 'Error 401: Unauthorized',
      });

      render(<AuthForm mode="login" />);

      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'wrongpass');
      await user.click(screen.getByRole('button', { name: 'Entrar' }));

      await waitFor(() => {
        expect(screen.getByText('Credenciales inválidas')).toBeInTheDocument();
      });
    });

    it('should display generic error message', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.login.mockResolvedValue({
        success: false,
        error: 'Network error',
      });

      render(<AuthForm mode="login" />);

      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Entrar' }));

      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });
    });

    it('should handle missing session data', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.login.mockResolvedValue({
        success: true,
        data: {}, // No session
      });

      render(<AuthForm mode="login" />);

      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Entrar' }));

      await waitFor(() => {
        expect(screen.getByText('Datos de sesión inválidos.')).toBeInTheDocument();
      });
    });

    it('should re-enable button after error', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.login.mockResolvedValue({
        success: false,
        error: 'Error',
      });

      render(<AuthForm mode="login" />);

      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');

      const submitButton = screen.getByRole('button', { name: 'Entrar' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: 'Entrar' })).not.toBeDisabled();
    });
  });

  describe('Register - Success Flow', () => {
    it('should handle successful registration and login', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.registerUser.mockResolvedValue({
        success: true,
        data: { user: { id: '123' } },
      });
      apiClient.login.mockResolvedValue({
        success: true,
        data: {
          session: {
            user: { id: '123', email: 'newuser@example.com' },
            token: 'fake-token',
          },
        },
      });

      render(<AuthForm mode="register" />);

      await user.type(screen.getByPlaceholderText('Nombre'), 'Juan');
      await user.type(screen.getByPlaceholderText('Apellido'), 'Pérez');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'newuser@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'secure123');
      await user.click(screen.getByRole('button', { name: 'Registrarse' }));

      await waitFor(() => {
        expect(apiClient.registerUser).toHaveBeenCalledWith({
          first: 'Juan',
          last: 'Pérez',
          email: 'newuser@example.com',
          password: 'secure123',
          role: 'resident',
        });
      });

      await waitFor(() => {
        expect(screen.getByText('¡Cuenta creada!')).toBeInTheDocument();
      });
    });

    it('should call login after successful registration', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.registerUser.mockResolvedValue({
        success: true,
        data: { user: { id: '123' } },
      });
      apiClient.login.mockResolvedValue({
        success: true,
        data: {
          session: {
            user: { id: '123', email: 'newuser@example.com' },
            token: 'fake-token',
          },
        },
      });

      render(<AuthForm mode="register" />);

      await user.type(screen.getByPlaceholderText('Nombre'), 'Ana');
      await user.type(screen.getByPlaceholderText('Apellido'), 'García');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'ana@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'pass123');
      await user.click(screen.getByRole('button', { name: 'Registrarse' }));

      await waitFor(() => {
        expect(apiClient.login).toHaveBeenCalledWith({
          email: 'ana@example.com',
          password: 'pass123',
        });
      });
    });

    it('should display success screen after registration', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.registerUser.mockResolvedValue({
        success: true,
        data: { user: { id: '123' } },
      });
      apiClient.login.mockResolvedValue({
        success: true,
        data: {
          session: {
            user: { id: '123', email: 'newuser@example.com' },
            token: 'fake-token',
          },
        },
      });

      render(<AuthForm mode="register" />);

      await user.type(screen.getByPlaceholderText('Nombre'), 'Juan');
      await user.type(screen.getByPlaceholderText('Apellido'), 'Pérez');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'newuser@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'secure123');
      await user.click(screen.getByRole('button', { name: 'Registrarse' }));

      await waitFor(() => {
        expect(screen.getByText('¡Cuenta creada!')).toBeInTheDocument();
        expect(screen.getByText('Redirigiendo al dashboard...')).toBeInTheDocument();
      });
    });
  });

  describe('Register - Error Handling', () => {
    it('should display error on failed registration', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.registerUser.mockResolvedValue({
        success: false,
        error: 'Email already exists',
      });

      render(<AuthForm mode="register" />);

      await user.type(screen.getByPlaceholderText('Nombre'), 'Juan');
      await user.type(screen.getByPlaceholderText('Apellido'), 'Pérez');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'existing@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'secure123');
      await user.click(screen.getByRole('button', { name: 'Registrarse' }));

      await waitFor(() => {
        expect(screen.getByText('Email already exists')).toBeInTheDocument();
      });
    });

    it('should show success even when login fails after registration', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.registerUser.mockResolvedValue({
        success: true,
        data: { user: { id: '123' } },
      });
      apiClient.login.mockResolvedValue({
        success: false,
        error: 'Login failed',
      });

      render(<AuthForm mode="register" />);

      await user.type(screen.getByPlaceholderText('Nombre'), 'Juan');
      await user.type(screen.getByPlaceholderText('Apellido'), 'Pérez');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'juan@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'secure123');
      await user.click(screen.getByRole('button', { name: 'Registrarse' }));

      // Should still show success message even if auto-login fails
      await waitFor(() => {
        expect(screen.getByText('¡Cuenta creada!')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should require email field', () => {
      render(<AuthForm mode="login" />);

      const emailInput = screen.getByPlaceholderText('Correo electrónico');
      expect(emailInput).toBeRequired();
    });

    it('should require password field', () => {
      render(<AuthForm mode="login" />);

      const passwordInput = screen.getByPlaceholderText('Contraseña');
      expect(passwordInput).toBeRequired();
    });

    it('should require minimum password length', () => {
      render(<AuthForm mode="login" />);

      const passwordInput = screen.getByPlaceholderText('Contraseña');
      expect(passwordInput).toHaveAttribute('minLength', '6');
    });

    it('should require name fields in register mode', () => {
      render(<AuthForm mode="register" />);

      expect(screen.getByPlaceholderText('Nombre')).toBeRequired();
      expect(screen.getByPlaceholderText('Apellido')).toBeRequired();
    });

    it('should require role selection in register mode', () => {
      render(<AuthForm mode="register" />);

      const roleSelect = screen.getByRole('combobox');
      expect(roleSelect).toBeRequired();
    });
  });

  describe('Success Screen', () => {
    it('should display checkmark icon on success', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.login.mockResolvedValue({
        success: true,
        data: {
          session: {
            user: { id: '123', email: 'test@example.com' },
            token: 'fake-token',
          },
        },
      });

      render(<AuthForm mode="login" />);

      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'test@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'password123');
      await user.click(screen.getByRole('button', { name: 'Entrar' }));

      await waitFor(() => {
        expect(screen.getByText('¡Bienvenido/a!')).toBeInTheDocument();
      });

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should show different success message for register', async () => {
      const user = userEvent.setup({ delay: null });
      apiClient.registerUser.mockResolvedValue({
        success: true,
        data: { user: { id: '123' } },
      });
      apiClient.login.mockResolvedValue({
        success: true,
        data: {
          session: {
            user: { id: '123', email: 'new@example.com' },
            token: 'fake-token',
          },
        },
      });

      render(<AuthForm mode="register" />);

      await user.type(screen.getByPlaceholderText('Nombre'), 'Juan');
      await user.type(screen.getByPlaceholderText('Apellido'), 'Pérez');
      await user.type(screen.getByPlaceholderText('Correo electrónico'), 'new@example.com');
      await user.type(screen.getByPlaceholderText('Contraseña'), 'secure123');
      await user.click(screen.getByRole('button', { name: 'Registrarse' }));

      await waitFor(() => {
        expect(screen.getByText('¡Cuenta creada!')).toBeInTheDocument();
      });
    });
  });
});
