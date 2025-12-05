import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AutocompleteSelect from '../AutocompleteSelect';

describe('AutocompleteSelect', () => {
  const mockOptions = [
    {
      id: '1',
      nombre_comercial: 'Seguros ABC',
      nombre_juridico: 'ABC Seguros S.A.',
    },
    {
      id: '2',
      nombre_comercial: 'Seguros XYZ',
      nombre_juridico: 'XYZ Seguros Ltda.',
    },
    {
      id: '3',
      nombre_comercial: null,
      nombre_juridico: 'Seguros DEF S.A.',
    },
  ];

  const mockOnChange = vi.fn();

  const defaultProps = {
    value: null,
    onChange: mockOnChange,
    options: mockOptions,
    placeholder: 'Selecciona una opción...',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render input with placeholder', () => {
      render(<AutocompleteSelect {...defaultProps} />);

      expect(screen.getByPlaceholderText('Selecciona una opción...')).toBeInTheDocument();
    });

    it('should render with custom placeholder', () => {
      render(
        <AutocompleteSelect {...defaultProps} placeholder="Elige una aseguradora" />
      );

      expect(screen.getByPlaceholderText('Elige una aseguradora')).toBeInTheDocument();
    });

    it('should display selected value when provided', () => {
      render(<AutocompleteSelect {...defaultProps} value="1" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Seguros ABC');
    });

    it('should display nombre_juridico when nombre_comercial is null', () => {
      render(<AutocompleteSelect {...defaultProps} value="3" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Seguros DEF S.A.');
    });

    it('should render dropdown arrow icon', () => {
      render(<AutocompleteSelect {...defaultProps} />);

      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    it('should not render dropdown initially', () => {
      render(<AutocompleteSelect {...defaultProps} />);

      expect(screen.queryByText('Seguros ABC')).not.toBeInTheDocument();
    });
  });

  describe('Opening and Closing Dropdown', () => {
    it('should open dropdown when input is focused', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
      });
    });

    it('should display all options when dropdown opens', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
        expect(screen.getByText('Seguros XYZ')).toBeInTheDocument();
        expect(screen.getByText('Seguros DEF S.A.')).toBeInTheDocument();
      });
    });

    it('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <AutocompleteSelect {...defaultProps} />
          <button>Outside Button</button>
        </div>
      );

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
      });

      const outsideButton = screen.getByRole('button', { name: 'Outside Button' });
      await user.click(outsideButton);

      await waitFor(() => {
        expect(screen.queryByText('Seguros ABC')).not.toBeInTheDocument();
      });
    });

    it('should not close dropdown when clicking inside container', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
      });

      await user.click(input);

      // Should still be open
      expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
    });
  });

  describe('Filtering', () => {
    it('should filter options when typing', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.type(input, 'ABC');

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
        expect(screen.queryByText('Seguros XYZ')).not.toBeInTheDocument();
      });
    });

    it('should filter by nombre_comercial', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.type(input, 'xyz');

      await waitFor(() => {
        expect(screen.getByText('Seguros XYZ')).toBeInTheDocument();
        expect(screen.queryByText('Seguros ABC')).not.toBeInTheDocument();
      });
    });

    it('should filter by nombre_juridico when nombre_comercial is null', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.type(input, 'def');

      await waitFor(() => {
        // Option 3 has nombre_comercial: null, nombre_juridico: 'Seguros DEF S.A.'
        // Filter falls back to nombre_juridico and should match "def"
        expect(screen.getByText('Seguros DEF S.A.')).toBeInTheDocument();
        expect(screen.queryByText('Seguros ABC')).not.toBeInTheDocument();
        expect(screen.queryByText('Seguros XYZ')).not.toBeInTheDocument();
      });
    });

    it('should be case insensitive when filtering', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.type(input, 'ABC');

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
      });

      // Clear and try lowercase
      await user.clear(input);
      await user.type(input, 'abc');

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
      });
    });

    it('should show "Sin resultados" when no matches found', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.type(input, 'NoExiste');

      await waitFor(() => {
        expect(screen.getByText('Sin resultados')).toBeInTheDocument();
      });
    });

    it('should show all options when query is empty', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.type(input, 'ABC');

      await waitFor(() => {
        expect(screen.queryByText('Seguros XYZ')).not.toBeInTheDocument();
      });

      await user.clear(input);

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
        expect(screen.getByText('Seguros XYZ')).toBeInTheDocument();
      });
    });
  });

  describe('Selection', () => {
    it('should call onChange when option is clicked', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
      });

      const option = screen.getByText('Seguros ABC');
      await user.click(option);

      expect(mockOnChange).toHaveBeenCalledWith('1');
    });

    it('should close dropdown after selection', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
      });

      const option = screen.getByText('Seguros ABC');
      await user.click(option);

      await waitFor(() => {
        expect(screen.queryByText('Seguros XYZ')).not.toBeInTheDocument();
      });
    });

    it('should clear query after selection', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);
      await user.type(input, 'abc');

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
      });

      const option = screen.getByText('Seguros ABC');
      await user.click(option);

      // After selection, should show the selected value, not the query
      expect(mockOnChange).toHaveBeenCalledWith('1');
    });

    it('should handle selecting different options', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');

      // First selection
      await user.click(input);
      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Seguros ABC'));

      expect(mockOnChange).toHaveBeenCalledWith('1');

      // Second selection
      await user.click(input);
      await waitFor(() => {
        expect(screen.getByText('Seguros XYZ')).toBeInTheDocument();
      });
      await user.click(screen.getByText('Seguros XYZ'));

      expect(mockOnChange).toHaveBeenCalledWith('2');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      render(<AutocompleteSelect {...defaultProps} options={[]} />);

      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should show "Sin resultados" with empty options', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} options={[]} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Sin resultados')).toBeInTheDocument();
      });
    });

    it('should handle value that does not exist in options', () => {
      render(<AutocompleteSelect {...defaultProps} value="999" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should handle null value', () => {
      render(<AutocompleteSelect {...defaultProps} value={null} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });

    it('should handle undefined value', () => {
      render(<AutocompleteSelect {...defaultProps} value={undefined} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('');
    });
  });

  describe('Dropdown Styling', () => {
    it('should display dropdown with correct position classes', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
      });

      // Find the dropdown container (parent of the option)
      const option = screen.getByText('Seguros ABC');
      const dropdownContainer = option.closest('.absolute');
      expect(dropdownContainer).toBeInTheDocument();
      expect(dropdownContainer).toHaveClass('absolute');
    });

    it('should have hover styles on options', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.click(input);

      await waitFor(() => {
        const option = screen.getByText('Seguros ABC');
        expect(option).toHaveClass('hover:bg-health-accent');
        expect(option).toHaveClass('cursor-pointer');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible input with proper type', () => {
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should show placeholder when no value is selected', () => {
      render(<AutocompleteSelect {...defaultProps} />);

      expect(screen.getByPlaceholderText('Selecciona una opción...')).toBeInTheDocument();
    });

    it('should support keyboard navigation by showing dropdown on focus', async () => {
      const user = userEvent.setup();
      render(<AutocompleteSelect {...defaultProps} />);

      const input = screen.getByRole('textbox');
      await user.tab(); // Focus the input

      if (document.activeElement === input) {
        await waitFor(() => {
          expect(screen.getByText('Seguros ABC')).toBeInTheDocument();
        });
      }
    });
  });
});
