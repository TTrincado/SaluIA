import React from 'react';

/**
 * MetricCard - Componente reutilizable para mostrar un KPI individual
 * 
 * @param {string} title - Título de la métrica
 * @param {string|number} value - Valor principal a mostrar (puede incluir %)
 * @param {string} subtitle - Descripción adicional o contexto
 * @param {string} theme - Tema de color: 'default', 'success', 'warning', 'danger', 'info'
 * @param {string} icon - Emoji o ícono opcional para mostrar
 */
export default function MetricCard({ 
  title, 
  value, 
  subtitle, 
  theme = 'default',
  icon = null
}) {
  // Definir estilos por tema
  const themeStyles = {
    default: {
      bg: 'bg-gray-50',
      border: 'border-health-border',
      valueColor: 'text-health-text',
      iconBg: 'bg-gray-100'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      valueColor: 'text-green-600',
      iconBg: 'bg-green-100'
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      valueColor: 'text-amber-600',
      iconBg: 'bg-amber-100'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      valueColor: 'text-red-600',
      iconBg: 'bg-red-100'
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      valueColor: 'text-blue-600',
      iconBg: 'bg-blue-100'
    },
    highlight: {
      bg: 'bg-health-accent/10',
      border: 'border-health-accent/30',
      valueColor: 'text-health-accent',
      iconBg: 'bg-health-accent/20'
    }
  };

  const currentTheme = themeStyles[theme] || themeStyles.default;

  return (
    <div 
      className={`
        ${currentTheme.bg} 
        ${currentTheme.border} 
        border 
        rounded-2xl 
        p-6 
        transition-all 
        hover:scale-[1.02]
        hover:shadow-lg
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-health-text-muted mb-2">
            {title}
          </h3>
          <div className={`text-3xl font-bold ${currentTheme.valueColor} mb-1`}>
            {value}
          </div>
          {subtitle && (
            <p className="text-xs text-health-text-muted mt-2">
              {subtitle}
            </p>
          )}
        </div>
        
        {icon && (
          <div className={`
            ${currentTheme.iconBg} 
            w-12 h-12 
            rounded-xl 
            flex 
            items-center 
            justify-center 
            text-2xl
          `}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * MetricCardWithProgress - Variante de MetricCard que incluye una barra de progreso
 * 
 * @param {string} title - Título de la métrica
 * @param {number} value - Valor numérico del porcentaje (0-100)
 * @param {string} subtitle - Descripción adicional
 * @param {string} theme - Tema de color
 * @param {number} total - Valor total para mostrar contexto (opcional)
 * @param {number} count - Valor absoluto para mostrar contexto (opcional)
 */
export function MetricCardWithProgress({ 
  title, 
  value, 
  subtitle, 
  theme = 'default',
  total = null,
  count = null
}) {
  const themeStyles = {
    default: 'bg-gray-300',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    highlight: 'bg-health-accent'
  };

  const progressBarColor = themeStyles[theme] || themeStyles.default;

  return (
    <div
      className={`
        bg-gray-50
        border
        border-health-border
        rounded-2xl
        p-6
        transition-all
        hover:scale-[1.02]
        hover:shadow-lg
      `}
    >
      <h3 className="text-sm font-medium text-health-text-muted mb-2">
        {title}
      </h3>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-bold text-health-text">
          {value}%
        </span>
        {count !== null && (
          <span className="text-sm text-health-text-muted">
            ({count}{total ? ` de ${total}` : ''})
          </span>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className={`${progressBarColor} h-full rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>

      {subtitle && (
        <p className="text-xs text-health-text-muted mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}

