import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Info, Clock } from 'lucide-react';
import { STATUS_STYLES, radius, isDarkTheme } from '../../design-system/tokens.js';

const STATUS_ICONS = {
  success: CheckCircle,
  warning: AlertCircle,
  error: XCircle,
  info: Info,
  pending: Clock
};

/**
 * StatusBadge Component
 *
 * Displays status with color-coded pill badge and optional icon
 * Supports multiple status types with automatic dark mode detection
 *
 * @param {string} status - Status type: 'success', 'warning', 'error', 'info', 'pending'
 * @param {string} label - Text to display in badge
 * @param {string} size - Badge size: 'sm', 'md', 'lg'
 * @param {boolean} showIcon - Whether to show status icon
 * @param {object} theme - Theme object for dark mode detection
 */
export const StatusBadge = ({
  status = 'info',
  label,
  size = 'md',
  showIcon = true,
  theme
}) => {
  const style = STATUS_STYLES[status] || STATUS_STYLES.info;
  const Icon = STATUS_ICONS[status];
  const isDark = theme ? isDarkTheme(theme) : false;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${sizeClasses[size]}`}
      style={{
        backgroundColor: isDark ? style.darkBg : style.bg,
        color: isDark ? style.darkColor : style.color
      }}
    >
      {showIcon && Icon && <Icon className={iconSizes[size]} />}
      {label}
    </span>
  );
};

// Predefined status badges for common use cases
export const OrderStatusBadge = ({ status, theme }) => {
  const statusMap = {
    'Order Entry': { status: 'pending', label: 'Order Entry' },
    'Acknowledged': { status: 'warning', label: 'Acknowledged' },
    'In Production': { status: 'info', label: 'In Production' },
    'Shipping': { status: 'success', label: 'Shipping' },
    'Delivered': { status: 'success', label: 'Delivered' },
    'Cancelled': { status: 'error', label: 'Cancelled' }
  };

  const mappedStatus = statusMap[status] || { status: 'info', label: status };

  return (
    <StatusBadge
      status={mappedStatus.status}
      label={mappedStatus.label}
      theme={theme}
    />
  );
};

export const ProjectStatusBadge = ({ stage, theme }) => {
  const stageMap = {
    'Discovery': { status: 'info', label: 'Discovery' },
    'Specifying': { status: 'info', label: 'Specifying' },
    'Decision/Bidding': { status: 'warning', label: 'Bidding' },
    'PO Expected': { status: 'warning', label: 'PO Expected' },
    'Won': { status: 'success', label: 'Won' },
    'Lost': { status: 'error', label: 'Lost' }
  };

  const mappedStage = stageMap[stage] || { status: 'info', label: stage };

  return (
    <StatusBadge
      status={mappedStage.status}
      label={mappedStage.label}
      theme={theme}
    />
  );
};
