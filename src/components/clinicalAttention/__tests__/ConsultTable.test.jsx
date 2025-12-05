import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ConsultTable from '../ConsultTable';
import { apiClient } from '../../../modules/api';

// Mock the API client
vi.mock('../../../modules/api', () => ({
  apiClient: {
    getClinicalAttentions: vi.fn(),
    updateClinicalAttention: vi.fn(),
  },
}));

describe('ConsultTable', () => {
  const mockClinicalAttentions = [
    {
      id: 1,
      id_episodio: 'EP001',
      created_at: '2025-01-15T10:30:00Z',
      patient: {
        first_name: 'Juan',
        last_name: 'Pérez',
        rut: '12345678-9',
      },
      resident_doctor: {
        first_name: 'Dr. Carlos',
        last_name: 'Gómez',
      },
      supervisor_doctor: {
        first_name: 'Dr. María',
        last_name: 'López',
      },
      ai_result: true,
      medic_approved: null,
      supervisor_approved: null,
      pertinencia: null,
    },
    {
      id: 2,
      id_episodio: 'EP002',
      created_at: '2025-01-16T14:20:00Z',
      patient: {
        first_name: 'Ana',
        last_name: 'Torres',
        rut: '98765432-1',
      },
      resident_doctor: {
        first_name: 'Dr. Pedro',
        last_name: 'Sánchez',
      },
      supervisor_doctor: {
        first_name: 'Dr. Laura',
        last_name: 'Fernández',
      },
      ai_result: false,
      medic_approved: true,
      supervisor_approved: true,
      pertinencia: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Loading and Error States', () => {
    it('should display loading state initially', () => {
      apiClient.getClinicalAttentions.mockImplementation(
        () => new Promise(() => {})
      );

      render(<ConsultTable />);
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should display error message when API call fails', async () => {
      apiClient.getClinicalAttentions.mockResolvedValue({
        success: false,
        error: 'Error al cargar los datos',
      });

      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument();
      });
    });

    it('should handle exception during API call', async () => {
      apiClient.getClinicalAttentions.mockRejectedValue(
        new Error('Network error')
      );

      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar los datos')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: mockClinicalAttentions,
          total: 2,
        },
      });
    });

    it('should render clinical attentions table with data', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      expect(screen.getByText('Ana Torres')).toBeInTheDocument();
      expect(screen.getByText('12345678-9')).toBeInTheDocument();
      expect(screen.getByText('98765432-1')).toBeInTheDocument();
    });

    it('should display table headers correctly', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Fecha')).toBeInTheDocument();
      });

      expect(screen.getByText('# Episodio')).toBeInTheDocument();
      expect(screen.getByText('Nombre Paciente')).toBeInTheDocument();
      expect(screen.getByText('RUT')).toBeInTheDocument();
      expect(screen.getByText('Ley Urgencia')).toBeInTheDocument();
      expect(screen.getByText('Pertinencia')).toBeInTheDocument();
      expect(screen.getByText('Análisis IA')).toBeInTheDocument();
    });

    it('should display episode IDs', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('EP001')).toBeInTheDocument();
      });

      expect(screen.getByText('EP002')).toBeInTheDocument();
    });

    it('should render Ver más links for each attention', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        const links = screen.getAllByText('Ver más');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/clinical_attentions/details/1');
        expect(links[1]).toHaveAttribute('href', '/clinical_attentions/details/2');
      });
    });

    it('should display no records message when no data', async () => {
      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: [],
          total: 0,
        },
      });

      render(<ConsultTable />);

      await waitFor(() => {
        expect(
          screen.getByText('No hay registros disponibles.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Status Display', () => {
    beforeEach(() => {
      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: mockClinicalAttentions,
          total: 2,
        },
      });
    });

    it('should display AI analysis status correctly', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        const aplicaStatuses = screen.getAllByText('Aplica');
        expect(aplicaStatuses.length).toBeGreaterThan(0);
      });

      const noAplicaStatuses = screen.getAllByText('No aplica');
      expect(noAplicaStatuses.length).toBeGreaterThan(0);
    });

    it('should display resident validation status', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
      });

      expect(screen.getByText('Aprobado')).toBeInTheDocument();
    });

    it('should display supervisor validation status', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        const sinObsStatuses = screen.getAllByText('Sin observaciones');
        expect(sinObsStatuses.length).toBeGreaterThan(0);
      });

      const ratificadoStatuses = screen.getAllByText('Ratificado');
      expect(ratificadoStatuses.length).toBeGreaterThan(0);
    });

    it('should display pertinencia status correctly', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
      });

      expect(screen.getByText('Pertinente')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    beforeEach(() => {
      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: mockClinicalAttentions,
          total: 2,
        },
      });
    });

    it('should render filter inputs', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Juan Pérez o 12.345/)).toBeInTheDocument();
      });
    });

    it('should filter by patient name', async () => {
      const user = userEvent.setup();
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      const patientFilter = screen.getByPlaceholderText(/Juan Pérez o 12.345/);
      await user.type(patientFilter, 'Ana');

      // Juan should not be visible after filtering
      await waitFor(() => {
        expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
      });

      // Ana should still be visible
      expect(screen.getByText('Ana Torres')).toBeInTheDocument();
    });

    it('should filter by patient RUT', async () => {
      const user = userEvent.setup();
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      const patientFilter = screen.getByPlaceholderText(/Juan Pérez o 12.345/);
      await user.type(patientFilter, '98765');

      await waitFor(() => {
        expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Ana Torres')).toBeInTheDocument();
    });

    it('should filter by resident validation status', async () => {
      const user = userEvent.setup();
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      const selects = screen.getAllByRole('combobox');
      const statusFilter = selects.find(s => s.querySelector('option[value="approved"]'));

      await user.selectOptions(statusFilter, 'approved');

      await waitFor(() => {
        expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Ana Torres')).toBeInTheDocument();
    });

    it('should filter by supervisor validation status', async () => {
      const user = userEvent.setup();
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      const selects = screen.getAllByRole('combobox');
      // Find supervisor status select (has "Sin observaciones" option)
      const statusFilter = selects.find(s => s.querySelector('option[value="pending"]')?.textContent === 'Sin observaciones');

      await user.selectOptions(statusFilter, 'approved');

      await waitFor(() => {
        expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
      });

      expect(screen.getByText('Ana Torres')).toBeInTheDocument();
    });

    it('should show no results message when filters match nothing', async () => {
      const user = userEvent.setup();
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      const patientFilter = screen.getByPlaceholderText(/Juan Pérez o 12.345/);
      await user.type(patientFilter, 'NonExistentPatient');

      await waitFor(() => {
        expect(
          screen.getByText('No se encontraron resultados con estos filtros.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: mockClinicalAttentions,
          total: 50,
        },
      });
    });

    it('should display pagination controls', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Anterior')).toBeInTheDocument();
      });

      expect(screen.getByText('Siguiente')).toBeInTheDocument();
      expect(screen.getByText(/Página 1 de/)).toBeInTheDocument();
    });

    it('should disable Anterior button on first page', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        const anteriorButton = screen.getByText('Anterior');
        expect(anteriorButton).toBeDisabled();
      });
    });

    it('should enable Siguiente button when more pages exist', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        const siguienteButton = screen.getByText('Siguiente');
        expect(siguienteButton).not.toBeDisabled();
      });
    });

    it('should change page when clicking Siguiente', async () => {
      const user = userEvent.setup();
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Siguiente')).toBeInTheDocument();
      });

      const siguienteButton = screen.getByText('Siguiente');
      await user.click(siguienteButton);

      await waitFor(() => {
        expect(apiClient.getClinicalAttentions).toHaveBeenCalledWith({
          page: 2,
          page_size: 10,
        });
      });
    });

    it('should change page size', async () => {
      const user = userEvent.setup();
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText(/Registros por página/)).toBeInTheDocument();
      });

      const selects = screen.getAllByRole('combobox');
      const pageSizeSelect = selects.find(s => s.querySelector('option[value="20"]')?.textContent === '20');

      await user.selectOptions(pageSizeSelect, '20');

      await waitFor(() => {
        expect(apiClient.getClinicalAttentions).toHaveBeenCalledWith({
          page: 1,
          page_size: 20,
        });
      });
    });

    it('should display correct record count', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Mostrando 1-10 de 50 registros')).toBeInTheDocument();
      });
    });
  });

  describe('Pertinencia Edit (Admin)', () => {
    beforeEach(() => {
      // Set admin session
      localStorage.setItem(
        'saluia.session',
        JSON.stringify({
          user: {
            id: 'admin-123',
            user_metadata: {
              role: 'admin',
              first_name: 'Admin',
              last_name: 'User',
            },
          },
        })
      );

      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: mockClinicalAttentions,
          total: 2,
        },
      });
    });

    it('should show pertinencia dropdown for admin users', async () => {
      render(<ConsultTable />);

      await waitFor(() => {
        const selects = screen.getAllByRole('combobox');
        // Should have: page size + 2 pertinencia selects
        expect(selects.length).toBeGreaterThan(1);
      });
    });

    it('should update pertinencia when admin changes value', async () => {
      const user = userEvent.setup();
      apiClient.updateClinicalAttention.mockResolvedValue({
        success: true,
      });

      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
      });

      const selects = screen.getAllByRole('combobox');
      // Find pertinencia select (not the page size select)
      const pertinenciaSelect = selects.find(
        (s) => s.querySelector('option[value="true"]')
      );

      await user.selectOptions(pertinenciaSelect, 'true');

      await waitFor(() => {
        expect(apiClient.updateClinicalAttention).toHaveBeenCalledWith(1, {
          pertinencia: true,
        });
      });
    });

    it('should revert pertinencia on update error', async () => {
      const user = userEvent.setup();
      apiClient.updateClinicalAttention.mockResolvedValue({
        success: false,
        error: 'Error al actualizar',
      });

      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getAllByText('Pendiente').length).toBeGreaterThan(0);
      });

      const selects = screen.getAllByRole('combobox');
      const pertinenciaSelect = selects.find(
        (s) => s.querySelector('option[value="true"]')
      );

      await user.selectOptions(pertinenciaSelect, 'true');

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith('Error al actualizar pertinencia');
      });
    });
  });

  describe('Role-based Filtering', () => {
    it('should filter data for resident role', async () => {
      localStorage.setItem(
        'saluia.session',
        JSON.stringify({
          user: {
            id: 'resident-123',
            user_metadata: {
              role: 'resident',
              first_name: 'Dr. Carlos',
              last_name: 'Gómez',
            },
          },
        })
      );

      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: mockClinicalAttentions,
          total: 2,
        },
      });

      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      // Should only show records where the resident is Dr. Carlos Gómez
      expect(screen.queryByText('Ana Torres')).not.toBeInTheDocument();
    });

    it('should filter data for supervisor role', async () => {
      localStorage.setItem(
        'saluia.session',
        JSON.stringify({
          user: {
            id: 'supervisor-123',
            user_metadata: {
              role: 'supervisor',
              first_name: 'Dr. Laura',
              last_name: 'Fernández',
            },
          },
        })
      );

      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: mockClinicalAttentions,
          total: 2,
        },
      });

      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Ana Torres')).toBeInTheDocument();
      });

      // Should only show records where supervisor is Dr. Laura Fernández
      expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
    });

    it('should show all data for admin role', async () => {
      localStorage.setItem(
        'saluia.session',
        JSON.stringify({
          user: {
            id: 'admin-123',
            user_metadata: {
              role: 'admin',
              first_name: 'Admin',
              last_name: 'User',
            },
          },
        })
      );

      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: mockClinicalAttentions,
          total: 2,
        },
      });

      render(<ConsultTable />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      expect(screen.getByText('Ana Torres')).toBeInTheDocument();
    });
  });

  describe('API Integration', () => {
    it('should call API with correct pagination parameters on initial load', async () => {
      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: mockClinicalAttentions,
          total: 2,
        },
      });

      render(<ConsultTable />);

      await waitFor(() => {
        expect(apiClient.getClinicalAttentions).toHaveBeenCalledWith({
          page: 1,
          page_size: 10,
        });
      });
    });

    it('should reload data when page changes', async () => {
      const user = userEvent.setup();
      apiClient.getClinicalAttentions.mockResolvedValue({
        success: true,
        data: {
          results: mockClinicalAttentions,
          total: 50,
        },
      });

      render(<ConsultTable />);

      await waitFor(() => {
        expect(apiClient.getClinicalAttentions).toHaveBeenCalledTimes(1);
      });

      const siguienteButton = screen.getByText('Siguiente');
      await user.click(siguienteButton);

      await waitFor(() => {
        expect(apiClient.getClinicalAttentions).toHaveBeenCalledTimes(2);
        expect(apiClient.getClinicalAttentions).toHaveBeenLastCalledWith({
          page: 2,
          page_size: 10,
        });
      });
    });
  });
});
