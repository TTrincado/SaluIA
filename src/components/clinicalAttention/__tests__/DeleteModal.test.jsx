import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DeleteModal from '../DeleteModal';
import { apiClient } from '../../../modules/api';

// Mock the API client
vi.mock('../../../modules/api', () => ({
  apiClient: {
    deleteClinicalAttention: vi.fn(),
  },
}));

describe('DeleteModal', () => {
  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    clinicalAttentionId: 123,
    deleted_by_id: 'user-456',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock window.location.href
    delete window.location;
    window.location = { href: '' };
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      render(<DeleteModal {...mockProps} isOpen={false} />);

      expect(screen.queryByText('Confirmar Eliminación')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', () => {
      render(<DeleteModal {...mockProps} />);

      expect(screen.getByText('Confirmar Eliminación')).toBeInTheDocument();
    });

    it('should display confirmation message', () => {
      render(<DeleteModal {...mockProps} />);

      expect(
        screen.getByText('¿Está seguro que desea eliminar esta atención clínica?')
      ).toBeInTheDocument();
    });

    it('should display warning about irreversibility', () => {
      render(<DeleteModal {...mockProps} />);

      expect(
        screen.getByText('Esta acción no se puede deshacer.')
      ).toBeInTheDocument();
    });

    it('should display deleted_by_id', () => {
      render(<DeleteModal {...mockProps} />);

      expect(screen.getByText(/A eliminar por: user-456/)).toBeInTheDocument();
    });

    it('should render action buttons', () => {
      render(<DeleteModal {...mockProps} />);

      expect(screen.getByRole('button', { name: 'Cancelar' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Eliminar' })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when Cancel button is clicked', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<DeleteModal {...mockProps} onClose={onClose} />);

      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });
      await user.click(cancelButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when clicking backdrop', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<DeleteModal {...mockProps} onClose={onClose} />);

      const backdrop = screen.getByText('Confirmar Eliminación').closest('div').parentElement;
      await user.click(backdrop);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when clicking modal content', async () => {
      const user = userEvent.setup();
      const onClose = vi.fn();

      render(<DeleteModal {...mockProps} onClose={onClose} />);

      const modalContent = screen.getByText('Confirmar Eliminación');
      await user.click(modalContent);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Delete Functionality', () => {
    it('should call deleteClinicalAttention API when Delete button is clicked', async () => {
      const user = userEvent.setup();
      apiClient.deleteClinicalAttention.mockResolvedValue({
        success: true,
      });

      render(<DeleteModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
      await user.click(deleteButton);

      expect(apiClient.deleteClinicalAttention).toHaveBeenCalledWith(123, 'user-456');
    });

    it('should redirect to clinical attentions list on successful deletion', async () => {
      const user = userEvent.setup();
      apiClient.deleteClinicalAttention.mockResolvedValue({
        success: true,
      });

      render(<DeleteModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(window.location.href).toBe('/clinical_attentions');
      });
    });

    it('should display error message on deletion failure', async () => {
      const user = userEvent.setup();
      apiClient.deleteClinicalAttention.mockResolvedValue({
        success: false,
        error: 'Error al eliminar la atención clínica',
      });

      render(<DeleteModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText('Error al eliminar la atención clínica')
        ).toBeInTheDocument();
      });
    });

    it('should display generic error on exception', async () => {
      const user = userEvent.setup();
      apiClient.deleteClinicalAttention.mockRejectedValue(
        new Error('Network error')
      );

      render(<DeleteModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(
          screen.getByText('Error al eliminar la atención clínica')
        ).toBeInTheDocument();
      });
    });

    it('should not redirect when deletion fails', async () => {
      const user = userEvent.setup();
      apiClient.deleteClinicalAttention.mockResolvedValue({
        success: false,
        error: 'Error',
      });

      render(<DeleteModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      // Should not have redirected
      expect(window.location.href).not.toBe('/clinical_attentions');
    });
  });

  describe('Loading State', () => {
    it('should show loading text when deleting', async () => {
      const user = userEvent.setup();
      apiClient.deleteClinicalAttention.mockImplementation(
        () => new Promise(() => {})
      );

      render(<DeleteModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('Eliminando...')).toBeInTheDocument();
      });
    });

    it('should disable buttons during deletion', async () => {
      const user = userEvent.setup();
      apiClient.deleteClinicalAttention.mockImplementation(
        () => new Promise(() => {})
      );

      render(<DeleteModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
      const cancelButton = screen.getByRole('button', { name: 'Cancelar' });

      await user.click(deleteButton);

      await waitFor(() => {
        expect(deleteButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
      });
    });

    it('should re-enable buttons after deletion completes', async () => {
      const user = userEvent.setup();
      apiClient.deleteClinicalAttention.mockResolvedValue({
        success: false,
        error: 'Error',
      });

      render(<DeleteModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });

      await user.click(deleteButton);

      // Wait for error to appear (which means loading is done)
      await waitFor(() => {
        expect(screen.getByText('Error')).toBeInTheDocument();
      });

      // Buttons should be enabled again
      expect(deleteButton).not.toBeDisabled();
    });
  });

  describe('Modal Styling and Accessibility', () => {
    it('should have proper modal overlay styles', () => {
      render(<DeleteModal {...mockProps} />);

      const overlay = screen.getByText('Confirmar Eliminación').closest('div').parentElement;
      expect(overlay).toHaveClass('fixed', 'inset-0', 'z-50');
    });

    it('should display warning with proper styling', () => {
      render(<DeleteModal {...mockProps} />);

      const warningBox = screen
        .getByText('¿Está seguro que desea eliminar esta atención clínica?')
        .closest('div');

      expect(warningBox).toHaveClass('bg-red-500/10', 'border', 'border-red-500/20');
    });

    it('should have delete button with danger styling', () => {
      render(<DeleteModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
      expect(deleteButton).toHaveClass('bg-red-500', 'text-white');
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing deleted_by_id gracefully', () => {
      const propsWithoutDeletedBy = {
        ...mockProps,
        deleted_by_id: undefined,
      };

      render(<DeleteModal {...propsWithoutDeletedBy} />);

      // Should still render the modal
      expect(screen.getByText('Confirmar Eliminación')).toBeInTheDocument();
    });

    it('should handle missing clinicalAttentionId', async () => {
      const user = userEvent.setup();
      const propsWithoutId = {
        ...mockProps,
        clinicalAttentionId: undefined,
      };

      apiClient.deleteClinicalAttention.mockResolvedValue({
        success: true,
      });

      render(<DeleteModal {...propsWithoutId} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
      await user.click(deleteButton);

      expect(apiClient.deleteClinicalAttention).toHaveBeenCalledWith(
        undefined,
        'user-456'
      );
    });

    it('should clear error state on new delete attempt', async () => {
      const user = userEvent.setup();

      // First attempt fails
      apiClient.deleteClinicalAttention.mockResolvedValueOnce({
        success: false,
        error: 'First error',
      });

      render(<DeleteModal {...mockProps} />);

      const deleteButton = screen.getByRole('button', { name: 'Eliminar' });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByText('First error')).toBeInTheDocument();
      });

      // Second attempt succeeds
      apiClient.deleteClinicalAttention.mockResolvedValueOnce({
        success: true,
      });

      await user.click(screen.getByRole('button', { name: 'Eliminar' }));

      await waitFor(() => {
        expect(window.location.href).toBe('/clinical_attentions');
      });
    });
  });
});
