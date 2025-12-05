import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SendForm from '../SendForm';
import { apiClient } from '../../../modules/api';

// Mock the API client
vi.mock('../../../modules/api', () => ({
  apiClient: {
    getMedics: vi.fn(),
    getPatients: vi.fn(),
    createClinicalAttention: vi.fn(),
  },
}));

describe('SendForm', () => {
  const mockMedics = {
    resident: [
      { id: 'res-1', first_name: 'Dr. Carlos', last_name: 'Gómez' },
      { id: 'res-2', first_name: 'Dr. Pedro', last_name: 'Sánchez' },
    ],
    supervisor: [
      { id: 'sup-1', first_name: 'Dr. María', last_name: 'López' },
      { id: 'sup-2', first_name: 'Dr. Laura', last_name: 'Fernández' },
    ],
  };

  const mockPatients = [
    {
      id: 'pat-1',
      first_name: 'Juan',
      last_name: 'Pérez',
      rut: '12345678-9',
    },
    {
      id: 'pat-2',
      first_name: 'Ana',
      last_name: 'Torres',
      rut: '98765432-1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };

    apiClient.getMedics.mockResolvedValue({
      success: true,
      data: mockMedics,
    });

    apiClient.getPatients.mockResolvedValue({
      success: true,
      data: { patients: mockPatients },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Rendering and Data Loading', () => {
    it('should render form with all required fields', async () => {
      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByText('Paciente *')).toBeInTheDocument();
      });

      expect(screen.getByText('Médico Residente *')).toBeInTheDocument();
      expect(screen.getByText('Médico Supervisor *')).toBeInTheDocument();
      expect(screen.getByText('Motivo de Consulta *')).toBeInTheDocument();
      expect(screen.getByText('Anamnesis *')).toBeInTheDocument();
      expect(screen.getByText('Diagnóstico Presuntivo *')).toBeInTheDocument();
    });

    it('should load and display patients in dropdown', async () => {
      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByText('12345678-9 — Juan Pérez')).toBeInTheDocument();
      });

      expect(screen.getByText('98765432-1 — Ana Torres')).toBeInTheDocument();
    });

    it('should load and display resident medics', async () => {
      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByText('Dr. Carlos Gómez')).toBeInTheDocument();
      });

      expect(screen.getByText('Dr. Pedro Sánchez')).toBeInTheDocument();
    });

    it('should load and display supervisor medics', async () => {
      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByText('Dr. María López')).toBeInTheDocument();
      });

      expect(screen.getByText('Dr. Laura Fernández')).toBeInTheDocument();
    });

    it('should display loading state for patients', () => {
      apiClient.getPatients.mockImplementation(() => new Promise(() => {}));

      render(<SendForm />);

      expect(screen.getByText('Cargando pacientes...')).toBeInTheDocument();
    });

    it('should display loading state for medics', () => {
      apiClient.getMedics.mockImplementation(() => new Promise(() => {}));

      render(<SendForm />);

      expect(screen.getAllByText('Cargando médicos...').length).toBeGreaterThan(0);
    });

    it('should display error when patients fail to load', async () => {
      apiClient.getPatients.mockResolvedValue({
        success: false,
        error: 'Failed to load patients',
      });

      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load patients')).toBeInTheDocument();
      });
    });

    it('should display error when medics fail to load', async () => {
      apiClient.getMedics.mockResolvedValue({
        success: false,
        error: 'Failed to load medics',
      });

      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load medics')).toBeInTheDocument();
      });
    });
  });

  describe('Session-based Auto-selection', () => {
    it('should auto-select and lock resident doctor for resident user', async () => {
      localStorage.setItem(
        'saluia.session',
        JSON.stringify({
          user: {
            id: 'res-1',
            user_metadata: {
              role: 'resident',
            },
          },
        })
      );

      render(<SendForm />);

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        const residentSelect = selects.find(s => s.querySelector('option')?.textContent?.includes('residente'));
        expect(residentSelect).toHaveValue('res-1');
        expect(residentSelect).toBeDisabled();
      }, { timeout: 2000 });
    });

    it('should auto-select and lock supervisor doctor for supervisor user', async () => {
      localStorage.setItem(
        'saluia.session',
        JSON.stringify({
          user: {
            id: 'sup-1',
            user_metadata: {
              role: 'supervisor',
            },
          },
        })
      );

      render(<SendForm />);

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        const supervisorSelect = selects.find(s => s.querySelector('option')?.textContent?.includes('supervisor'));
        expect(supervisorSelect).toHaveValue('sup-1');
        expect(supervisorSelect).toBeDisabled();
      }, { timeout: 2000 });
    });

    it('should not lock fields for admin users', async () => {
      localStorage.setItem(
        'saluia.session',
        JSON.stringify({
          user: {
            id: 'admin-1',
            user_metadata: {
              role: 'admin',
            },
          },
        })
      );

      render(<SendForm />);

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        const residentSelect = selects.find(s => s.querySelector('option')?.textContent?.includes('residente'));
        const supervisorSelect = selects.find(s => s.querySelector('option')?.textContent?.includes('supervisor'));

        expect(residentSelect).not.toBeDisabled();
        expect(supervisorSelect).not.toBeDisabled();
      }, { timeout: 2000 });
    });
  });

  describe('Vital Signs', () => {
    it('should render all vital sign inputs', async () => {
      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByText('Signos Vitales')).toBeInTheDocument();
      });

      expect(screen.getByText('Temperatura (°C)')).toBeInTheDocument();
      expect(screen.getByText('Presión Sistólica')).toBeInTheDocument();
      expect(screen.getByText('Presión Diastólica')).toBeInTheDocument();
      expect(screen.getByText('Frecuencia Cardíaca')).toBeInTheDocument();
      expect(screen.getByText('Frecuencia Respiratoria')).toBeInTheDocument();
      expect(screen.getByText('Saturación O₂ (%)')).toBeInTheDocument();
      expect(screen.getByText('Glasgow')).toBeInTheDocument();
      expect(screen.getByText('Dolor (0-10)')).toBeInTheDocument();
      expect(screen.getByText('Glicemia Capilar')).toBeInTheDocument();
    });

    it('should allow input in vital signs fields', async () => {
      const user = userEvent.setup();
      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByText('Signos Vitales')).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole('spinbutton');
      const tempInput = inputs.find(inp => inp.previousElementSibling?.textContent === 'Temperatura (°C)');

      await user.type(tempInput, '37.5');

      await waitFor(() => {
        expect(tempInput).toHaveValue(37.5);
      });
    });
  });

  describe('Triage Selection', () => {
    it('should render triage buttons', async () => {
      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByText(/Triage \(1 = más grave\)/)).toBeInTheDocument();
      });

      // Should have buttons 1-5
      expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '3' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '4' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
    });

    it('should select triage level when button is clicked', async () => {
      const user = userEvent.setup();
      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: '2' })).toBeInTheDocument();
      });

      const triageButton = screen.getByRole('button', { name: '2' });
      await user.click(triageButton);

      expect(triageButton).toHaveClass('bg-health-accent');
    });

    it('should show error message when triage not selected', async () => {
      render(<SendForm />);

      await waitFor(() => {
        expect(
          screen.getByText('Debes seleccionar un nivel de triage')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should disable submit button when form is incomplete', async () => {
      render(<SendForm />);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /Crear Atención Clínica/ });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Optional Fields', () => {
    it('should allow submission without Hallazgos Clínicos', async () => {
      const user = userEvent.setup();
      render(<SendForm />);

      await waitFor(() => {
        expect(screen.getByText('Hallazgos Clínicos')).toBeInTheDocument();
      });

      // Hallazgos Clínicos should not have required marker
      const hallazgosLabel = screen.getByText('Hallazgos Clínicos');
      expect(hallazgosLabel.textContent).not.toContain('*');
    });
  });
});
