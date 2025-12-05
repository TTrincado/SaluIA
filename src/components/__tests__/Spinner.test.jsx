import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Spinner from '../Spinner';

describe('Spinner', () => {
  describe('Rendering', () => {
    it('should render spinner component', () => {
      const { container } = render(<Spinner />);

      const spinner = container.querySelector('div');
      expect(spinner).toBeInTheDocument();
    });

    it('should have correct CSS classes', () => {
      const { container } = render(<Spinner />);

      const spinner = container.querySelector('div');
      expect(spinner).toHaveClass('mx-auto');
      expect(spinner).toHaveClass('h-12');
      expect(spinner).toHaveClass('w-12');
      expect(spinner).toHaveClass('animate-spin');
      expect(spinner).toHaveClass('rounded-full');
    });

    it('should have border styling classes', () => {
      const { container } = render(<Spinner />);

      const spinner = container.querySelector('div');
      expect(spinner).toHaveClass('border-4');
      expect(spinner).toHaveClass('border-gray-200');
      expect(spinner).toHaveClass('border-t-health-accent');
    });

    it('should render as a single div element', () => {
      const { container } = render(<Spinner />);

      const divs = container.querySelectorAll('div');
      expect(divs).toHaveLength(1);
    });
  });

  describe('Visual Properties', () => {
    it('should be centered horizontally with mx-auto', () => {
      const { container } = render(<Spinner />);

      const spinner = container.querySelector('div');
      expect(spinner).toHaveClass('mx-auto');
    });

    it('should have square dimensions (h-12 w-12)', () => {
      const { container } = render(<Spinner />);

      const spinner = container.querySelector('div');
      expect(spinner).toHaveClass('h-12');
      expect(spinner).toHaveClass('w-12');
    });

    it('should be circular with rounded-full', () => {
      const { container } = render(<Spinner />);

      const spinner = container.querySelector('div');
      expect(spinner).toHaveClass('rounded-full');
    });

    it('should have animation class', () => {
      const { container } = render(<Spinner />);

      const spinner = container.querySelector('div');
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Accessibility', () => {
    it('should not have any text content', () => {
      const { container } = render(<Spinner />);

      const spinner = container.querySelector('div');
      expect(spinner?.textContent).toBe('');
    });

    it('should render without errors', () => {
      expect(() => render(<Spinner />)).not.toThrow();
    });
  });

  describe('Integration', () => {
    it('should render multiple spinners independently', () => {
      const { container } = render(
        <div>
          <Spinner />
          <Spinner />
          <Spinner />
        </div>
      );

      const spinners = container.querySelectorAll('.animate-spin');
      expect(spinners).toHaveLength(3);
    });

    it('should maintain styling when rendered in different contexts', () => {
      const { container: container1 } = render(<Spinner />);
      const { container: container2 } = render(
        <div className="bg-red-500">
          <Spinner />
        </div>
      );

      const spinner1 = container1.querySelector('div');
      const spinner2 = container2.querySelector('.animate-spin');

      expect(spinner1?.className).toBe(spinner2?.className);
    });
  });

  describe('Component Structure', () => {
    it('should render without any props', () => {
      expect(() => render(<Spinner />)).not.toThrow();
    });

    it('should not accept or use any props', () => {
      // Spinner doesn't accept props, but React will ignore extra props
      const { container } = render(<Spinner someProp="value" />);

      const spinner = container.querySelector('div');
      expect(spinner).toBeInTheDocument();
    });

    it('should be a pure presentational component', () => {
      const { container: firstRender } = render(<Spinner />);
      const { container: secondRender } = render(<Spinner />);

      const firstSpinner = firstRender.querySelector('div');
      const secondSpinner = secondRender.querySelector('div');

      expect(firstSpinner?.className).toBe(secondSpinner?.className);
    });
  });
});
