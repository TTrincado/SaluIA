import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MetricCard, { MetricCardWithProgress } from '../MetricCard';

describe('MetricCard', () => {
  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<MetricCard title="Test Metric" value={42} />);

      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('should render with subtitle', () => {
      render(
        <MetricCard
          title="Total Users"
          value={100}
          subtitle="Active in last 30 days"
        />
      );

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('Active in last 30 days')).toBeInTheDocument();
    });

    it('should render without subtitle', () => {
      render(<MetricCard title="Metric" value={50} />);

      expect(screen.getByText('Metric')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });

    it('should render with icon', () => {
      const { container } = render(
        <MetricCard title="Test" value={10} icon="📊" />
      );

      expect(screen.getByText('📊')).toBeInTheDocument();
    });

    it('should render without icon', () => {
      const { container } = render(<MetricCard title="Test" value={10} />);

      const iconContainer = container.querySelector('.w-12.h-12');
      expect(iconContainer).not.toBeInTheDocument();
    });

    it('should render with string value', () => {
      render(<MetricCard title="Status" value="Active" />);

      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('should render with percentage value', () => {
      render(<MetricCard title="Completion" value="95%" />);

      expect(screen.getByText('95%')).toBeInTheDocument();
    });
  });

  describe('Theme Styling', () => {
    it('should apply default theme when no theme specified', () => {
      const { container } = render(<MetricCard title="Test" value={10} />);

      const card = container.querySelector('.bg-gray-50');
      expect(card).toBeInTheDocument();
    });

    it('should apply success theme', () => {
      const { container } = render(
        <MetricCard title="Test" value={10} theme="success" />
      );

      const card = container.querySelector('.bg-green-50');
      expect(card).toBeInTheDocument();
    });

    it('should apply warning theme', () => {
      const { container } = render(
        <MetricCard title="Test" value={10} theme="warning" />
      );

      const card = container.querySelector('.bg-amber-50');
      expect(card).toBeInTheDocument();
    });

    it('should apply danger theme', () => {
      const { container } = render(
        <MetricCard title="Test" value={10} theme="danger" />
      );

      const card = container.querySelector('.bg-red-50');
      expect(card).toBeInTheDocument();
    });

    it('should apply info theme', () => {
      const { container } = render(
        <MetricCard title="Test" value={10} theme="info" />
      );

      const card = container.querySelector('.bg-blue-50');
      expect(card).toBeInTheDocument();
    });

    it('should apply highlight theme', () => {
      const { container } = render(
        <MetricCard title="Test" value={10} theme="highlight" />
      );

      // Check for health-accent background (with opacity)
      const card = container.querySelector('div[class*="bg-health-accent"]');
      expect(card).toBeInTheDocument();
    });

    it('should fallback to default theme for invalid theme', () => {
      const { container } = render(
        <MetricCard title="Test" value={10} theme="invalid" />
      );

      const card = container.querySelector('.bg-gray-50');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Icon Rendering', () => {
    it('should display icon when provided', () => {
      render(<MetricCard title="Test" value={10} icon="🎯" />);

      expect(screen.getByText('🎯')).toBeInTheDocument();
    });

    it('should apply correct icon container styles', () => {
      const { container } = render(
        <MetricCard title="Test" value={10} icon="🎯" theme="success" />
      );

      const iconContainer = container.querySelector('.w-12.h-12.rounded-xl');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should apply theme-specific icon background', () => {
      const { container } = render(
        <MetricCard title="Test" value={10} icon="📈" theme="success" />
      );

      const iconContainer = container.querySelector('.bg-green-100');
      expect(iconContainer).toBeInTheDocument();
    });

    it('should render multiple emoji icons', () => {
      render(<MetricCard title="Test" value={10} icon="🎉🎊" />);

      expect(screen.getByText('🎉🎊')).toBeInTheDocument();
    });
  });

  describe('Layout and Structure', () => {
    it('should have rounded corners', () => {
      const { container } = render(<MetricCard title="Test" value={10} />);

      const card = container.querySelector('.rounded-2xl');
      expect(card).toBeInTheDocument();
    });

    it('should have border', () => {
      const { container } = render(<MetricCard title="Test" value={10} />);

      const card = container.querySelector('.border');
      expect(card).toBeInTheDocument();
    });

    it('should have padding', () => {
      const { container } = render(<MetricCard title="Test" value={10} />);

      const card = container.querySelector('.p-6');
      expect(card).toBeInTheDocument();
    });

    it('should have hover effects', () => {
      const { container } = render(<MetricCard title="Test" value={10} />);

      const card = container.querySelector('.hover\\:scale-\\[1\\.02\\]');
      expect(card).toBeInTheDocument();
    });

    it('should have transition animation', () => {
      const { container } = render(<MetricCard title="Test" value={10} />);

      const card = container.querySelector('.transition-all');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Content Display', () => {
    it('should display title with correct styling', () => {
      render(<MetricCard title="Patient Count" value={150} />);

      const title = screen.getByText('Patient Count');
      expect(title).toHaveClass('text-sm');
      expect(title).toHaveClass('font-medium');
    });

    it('should display value with large font', () => {
      const { container } = render(<MetricCard title="Test" value={999} />);

      const value = screen.getByText('999');
      expect(value).toHaveClass('text-3xl');
      expect(value).toHaveClass('font-bold');
    });

    it('should display subtitle with small font', () => {
      render(
        <MetricCard title="Test" value={10} subtitle="Last updated today" />
      );

      const subtitle = screen.getByText('Last updated today');
      expect(subtitle).toHaveClass('text-xs');
    });
  });
});

describe('MetricCardWithProgress', () => {
  describe('Basic Rendering', () => {
    it('should render with required props', () => {
      render(<MetricCardWithProgress title="Progress" value={75} />);

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('should render with subtitle', () => {
      render(
        <MetricCardWithProgress
          title="Completion"
          value={80}
          subtitle="Almost there"
        />
      );

      expect(screen.getByText('Completion')).toBeInTheDocument();
      expect(screen.getByText('80%')).toBeInTheDocument();
      expect(screen.getByText('Almost there')).toBeInTheDocument();
    });

    it('should render without subtitle', () => {
      render(<MetricCardWithProgress title="Progress" value={50} />);

      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('should render with count', () => {
      render(<MetricCardWithProgress title="Tasks" value={50} count={5} />);

      expect(screen.getByText('(5)')).toBeInTheDocument();
    });

    it('should render with count and total', () => {
      render(
        <MetricCardWithProgress title="Tasks" value={50} count={5} total={10} />
      );

      expect(screen.getByText('(5 de 10)')).toBeInTheDocument();
    });

    it('should not render count when null', () => {
      render(<MetricCardWithProgress title="Progress" value={50} />);

      const countText = screen.queryByText(/\(/);
      expect(countText).not.toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={60} />
      );

      const progressContainer = container.querySelector('.bg-gray-200.rounded-full.h-2');
      expect(progressContainer).toBeInTheDocument();
    });

    it('should set progress bar width based on value', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={75} />
      );

      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '75%' });
    });

    it('should cap progress bar at 100%', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={150} />
      );

      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should handle 0% value', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={0} />
      );

      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should have transition animation on progress bar', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} />
      );

      const progressBar = container.querySelector('.transition-all.duration-500');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Theme Styling for Progress Bar', () => {
    it('should apply default theme to progress bar', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} />
      );

      const progressBar = container.querySelector('.bg-gray-300');
      expect(progressBar).toBeInTheDocument();
    });

    it('should apply success theme to progress bar', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} theme="success" />
      );

      const progressBar = container.querySelector('.bg-green-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('should apply warning theme to progress bar', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} theme="warning" />
      );

      const progressBar = container.querySelector('.bg-amber-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('should apply danger theme to progress bar', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} theme="danger" />
      );

      const progressBar = container.querySelector('.bg-red-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('should apply info theme to progress bar', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} theme="info" />
      );

      const progressBar = container.querySelector('.bg-blue-500');
      expect(progressBar).toBeInTheDocument();
    });

    it('should apply highlight theme to progress bar', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} theme="highlight" />
      );

      const progressBar = container.querySelector('.bg-health-accent');
      expect(progressBar).toBeInTheDocument();
    });

    it('should fallback to default theme for invalid theme', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} theme="invalid" />
      );

      const progressBar = container.querySelector('.bg-gray-300');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Card Styling', () => {
    it('should have rounded corners', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} />
      );

      const card = container.querySelector('.rounded-2xl');
      expect(card).toBeInTheDocument();
    });

    it('should have border', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} />
      );

      const card = container.querySelector('.border');
      expect(card).toBeInTheDocument();
    });

    it('should have padding', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} />
      );

      const card = container.querySelector('.p-6');
      expect(card).toBeInTheDocument();
    });

    it('should have hover effects', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={50} />
      );

      const card = container.querySelector('.hover\\:scale-\\[1\\.02\\]');
      expect(card).toBeInTheDocument();
    });
  });

  describe('Value Display', () => {
    it('should display percentage symbol', () => {
      render(<MetricCardWithProgress title="Test" value={85} />);

      expect(screen.getByText('85%')).toBeInTheDocument();
    });

    it('should display count in parentheses', () => {
      render(<MetricCardWithProgress title="Test" value={50} count={3} />);

      expect(screen.getByText('(3)')).toBeInTheDocument();
    });

    it('should display count and total in Spanish format', () => {
      render(
        <MetricCardWithProgress title="Test" value={50} count={7} total={14} />
      );

      expect(screen.getByText('(7 de 14)')).toBeInTheDocument();
    });

    it('should handle large count numbers', () => {
      render(
        <MetricCardWithProgress
          title="Test"
          value={90}
          count={950}
          total={1000}
        />
      );

      expect(screen.getByText('(950 de 1000)')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle value greater than 100', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={120} />
      );

      expect(screen.getByText('120%')).toBeInTheDocument();
      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should handle negative values', () => {
      const { container } = render(
        <MetricCardWithProgress title="Test" value={-10} />
      );

      expect(screen.getByText('-10%')).toBeInTheDocument();
      const progressBar = container.querySelector('.h-full.rounded-full');
      expect(progressBar).toHaveStyle({ width: '-10%' });
    });

    it('should handle decimal values', () => {
      render(<MetricCardWithProgress title="Test" value={45.5} />);

      expect(screen.getByText('45.5%')).toBeInTheDocument();
    });

    it('should render with all optional props', () => {
      render(
        <MetricCardWithProgress
          title="Complete Task"
          value={75}
          subtitle="Great progress!"
          theme="success"
          count={15}
          total={20}
        />
      );

      expect(screen.getByText('Complete Task')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Great progress!')).toBeInTheDocument();
      expect(screen.getByText('(15 de 20)')).toBeInTheDocument();
    });
  });
});
