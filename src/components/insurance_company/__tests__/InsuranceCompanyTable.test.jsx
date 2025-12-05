import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import InsuranceCompanyTable from '../InsuranceCompanyTable';
import { apiClient } from '../../../modules/api';

// Mock the API client
vi.mock('../../../modules/api', () => ({
  apiClient: {
    getInsuranceCompanies: vi.fn(),
    uploadInsuranceExcel: vi.fn(),
  },
}));

// Mock AutocompleteSelect component
vi.mock('../../admin/AutocompleteSelect', () => ({
  default: ({ value, onChange, options, placeholder }) => (
    <select
      data-testid="autocomplete-select"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.nombre_comercial || opt.nombre_juridico}
        </option>
      ))}
    </select>
  ),
}));

describe('InsuranceCompanyTable', () => {
  const mockCompanies = [
    {
      id: 1,
      nombre_comercial: 'Seguros ABC',
      nombre_juridico: 'ABC Seguros S.A.',
      rut: '12345678-9',
    },
    {
      id: 2,
      nombre_comercial: 'Seguros XYZ',
      nombre_juridico: 'XYZ Seguros Ltda.',
      rut: '98765432-1',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading and Error States', () => {
    it('should display loading state initially', () => {
      apiClient.getInsuranceCompanies.mockImplementation(
        () => new Promise(() => {})
      );

      render(<InsuranceCompanyTable />);
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should display error message when API call fails', async () => {
      apiClient.getInsuranceCompanies.mockResolvedValue({
        success: false,
        error: 'Error al cargar',
      });

      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar')).toBeInTheDocument();
      });
    });

    it('should handle exception during API call', async () => {
      apiClient.getInsuranceCompanies.mockRejectedValue(
        new Error('Network error')
      );

      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(
          screen.getByText('Error al cargar aseguradoras')
        ).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    beforeEach(() => {
      apiClient.getInsuranceCompanies.mockResolvedValue({
        success: true,
        data: {
          results: mockCompanies,
          total: 2,
        },
      });
    });

    it('should render insurance companies table with data', async () => {
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getAllByText('Seguros ABC').length).toBeGreaterThan(0);
      });

      expect(screen.getByText('ABC Seguros S.A.')).toBeInTheDocument();
      expect(screen.getByText('12345678-9')).toBeInTheDocument();
      expect(screen.getAllByText('Seguros XYZ').length).toBeGreaterThan(0);
      expect(screen.getByText('XYZ Seguros Ltda.')).toBeInTheDocument();
      expect(screen.getByText('98765432-1')).toBeInTheDocument();
    });

    it('should display table headers correctly', async () => {
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getByText('ID')).toBeInTheDocument();
      });

      expect(screen.getByText('Nombre Comercial')).toBeInTheDocument();
      expect(screen.getByText('Razón Social')).toBeInTheDocument();
      expect(screen.getByText('RUT')).toBeInTheDocument();
    });

    it('should render Ver más links for each company', async () => {
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        const links = screen.getAllByText('Ver más');
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/aseguradora/details/1');
        expect(links[1]).toHaveAttribute('href', '/aseguradora/details/2');
      });
    });

    it('should display message when no companies exist', async () => {
      apiClient.getInsuranceCompanies.mockResolvedValue({
        success: true,
        data: {
          results: [],
          total: 0,
        },
      });

      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(
          screen.getByText('No hay aseguradoras registradas.')
        ).toBeInTheDocument();
      });
    });

    it('should display dash for missing nombre_comercial', async () => {
      const companiesWithoutNombre = [
        {
          id: 1,
          nombre_comercial: null,
          nombre_juridico: 'Test Seguros S.A.',
          rut: '12345678-9',
        },
      ];

      apiClient.getInsuranceCompanies.mockResolvedValue({
        success: true,
        data: {
          results: companiesWithoutNombre,
          total: 1,
        },
      });

      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        const cells = screen.getAllByText('—');
        expect(cells.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      apiClient.getInsuranceCompanies.mockResolvedValue({
        success: true,
        data: {
          results: mockCompanies,
          total: 50,
        },
      });
    });

    it('should display pagination controls', async () => {
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getByText('Anterior')).toBeInTheDocument();
      });

      expect(screen.getByText('Siguiente')).toBeInTheDocument();
      expect(screen.getByText(/Página 1 de/)).toBeInTheDocument();
    });

    it('should disable Anterior button on first page', async () => {
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        const anteriorButton = screen.getByText('Anterior');
        expect(anteriorButton).toBeDisabled();
      });
    });

    it('should enable Siguiente button when more pages exist', async () => {
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        const siguienteButton = screen.getByText('Siguiente');
        expect(siguienteButton).not.toBeDisabled();
      });
    });

    it('should change page when clicking Siguiente', async () => {
      const user = userEvent.setup();
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getByText('Siguiente')).toBeInTheDocument();
      });

      const siguienteButton = screen.getByText('Siguiente');
      await user.click(siguienteButton);

      await waitFor(() => {
        expect(apiClient.getInsuranceCompanies).toHaveBeenCalledWith({
          page: 2,
          page_size: 10,
        });
      });
    });

    it('should change page size when selecting from dropdown', async () => {
      const user = userEvent.setup();
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getByText('Registros por página:')).toBeInTheDocument();
      });

      const selects = screen.getAllByRole('combobox');
      const pageSizeSelect = selects.find(s => s.querySelector('option[value="20"]'));
      await user.selectOptions(pageSizeSelect, '20');

      await waitFor(() => {
        expect(apiClient.getInsuranceCompanies).toHaveBeenCalledWith({
          page: 1,
          page_size: 20,
        });
      });
    });

    it('should display correct record count', async () => {
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getByText('Mostrando 1-10 de 50')).toBeInTheDocument();
      });
    });

    it('should reset to page 1 when changing page size', async () => {
      const user = userEvent.setup();
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getByText('Siguiente')).toBeInTheDocument();
      });

      // Go to page 2
      await user.click(screen.getByText('Siguiente'));

      await waitFor(() => {
        expect(apiClient.getInsuranceCompanies).toHaveBeenCalledWith({
          page: 2,
          page_size: 10,
        });
      });

      // Change page size
      const selects = screen.getAllByRole('combobox');
      const pageSizeSelect = selects.find(s => s.querySelector('option[value="20"]'));
      await user.selectOptions(pageSizeSelect, '20');

      await waitFor(() => {
        expect(apiClient.getInsuranceCompanies).toHaveBeenCalledWith({
          page: 1,
          page_size: 20,
        });
      });
    });
  });

  describe('Excel Upload Functionality', () => {
    beforeEach(() => {
      apiClient.getInsuranceCompanies.mockResolvedValue({
        success: true,
        data: {
          results: mockCompanies,
          total: 2,
        },
      });
    });

    it('should render excel upload section', async () => {
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getByText('Aseguradora')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Archivo Excel (.xlsx)')
      ).toBeInTheDocument();
      expect(screen.getByText('⬆️ Subir Excel')).toBeInTheDocument();
    });

    it('should show error when uploading without selecting company', async () => {
      const user = userEvent.setup();
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getAllByText('Seguros ABC').length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      const uploadButton = screen.getByText('⬆️ Subir Excel');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(
          screen.getByText('Selecciona una aseguradora.')
        ).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should show error when uploading without selecting file', async () => {
      const user = userEvent.setup();
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getAllByText('Seguros ABC').length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // Select a company
      const select = screen.getByTestId('autocomplete-select');
      await user.selectOptions(select, '1');

      const uploadButton = screen.getByText('⬆️ Subir Excel');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(
          screen.getByText('Selecciona un archivo Excel (.xlsx).')
        ).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should successfully upload excel file', async () => {
      const user = userEvent.setup();
      apiClient.uploadInsuranceExcel.mockResolvedValue({
        success: true,
        data: { updated: 5 },
      });

      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getAllByText('Seguros ABC').length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // Select a company
      const select = screen.getByTestId('autocomplete-select');
      await user.selectOptions(select, '1');

      // Select a file
      const file = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const fileInput = screen.getByLabelText(/Elegir archivo/);
      await user.upload(fileInput, file);

      // Click upload
      const uploadButton = screen.getByText('⬆️ Subir Excel');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(apiClient.uploadInsuranceExcel).toHaveBeenCalledWith('1', file);
      }, { timeout: 2000 });

      await waitFor(() => {
        expect(
          screen.getByText(
            'Archivo procesado correctamente. Registros afectados: 5.'
          )
        ).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should display error message on failed upload', async () => {
      const user = userEvent.setup();
      apiClient.uploadInsuranceExcel.mockResolvedValue({
        success: false,
        error: 'Error al procesar archivo.',
      });

      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getAllByText('Seguros ABC').length).toBeGreaterThan(0);
      }, { timeout: 2000 });

      // Select a company
      const select = screen.getByTestId('autocomplete-select');
      await user.selectOptions(select, '1');

      // Select a file
      const file = new File(['test'], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const fileInput = screen.getByLabelText(/Elegir archivo/);
      await user.upload(fileInput, file);

      // Click upload
      const uploadButton = screen.getByText('⬆️ Subir Excel');
      await user.click(uploadButton);

      await waitFor(() => {
        expect(
          screen.getByText('Error al procesar archivo.')
        ).toBeInTheDocument();
      }, { timeout: 2000 });
    });

    it('should display file name when file is selected', async () => {
      const user = userEvent.setup();
      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(screen.getByText('Elegir archivo...')).toBeInTheDocument();
      });

      const file = new File(['test'], 'companies.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const fileInput = screen.getByLabelText(/Elegir archivo/);
      await user.upload(fileInput, file);

      await waitFor(() => {
        expect(screen.getByText('companies.xlsx')).toBeInTheDocument();
      });
    });
  });

  describe('API Integration', () => {
    it('should call API with correct pagination parameters on initial load', async () => {
      apiClient.getInsuranceCompanies.mockResolvedValue({
        success: true,
        data: {
          results: mockCompanies,
          total: 2,
        },
      });

      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(apiClient.getInsuranceCompanies).toHaveBeenCalledWith({
          page: 1,
          page_size: 10,
        });
      });
    });

    it('should reload data when page changes', async () => {
      const user = userEvent.setup();
      apiClient.getInsuranceCompanies.mockResolvedValue({
        success: true,
        data: {
          results: mockCompanies,
          total: 50,
        },
      });

      render(<InsuranceCompanyTable />);

      await waitFor(() => {
        expect(apiClient.getInsuranceCompanies).toHaveBeenCalledTimes(1);
      });

      const siguienteButton = screen.getByText('Siguiente');
      await user.click(siguienteButton);

      await waitFor(() => {
        expect(apiClient.getInsuranceCompanies).toHaveBeenCalledTimes(2);
        expect(apiClient.getInsuranceCompanies).toHaveBeenLastCalledWith({
          page: 2,
          page_size: 10,
        });
      });
    });
  });
});
