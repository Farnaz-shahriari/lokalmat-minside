import React from 'react';

/**
 * Tab Component System
 * 
 * A Material Design-inspired tab component with consistent hover states:
 * - Cursor changes to pointer on hover
 * - Background color appears on hover (bg-muted)
 * - Smooth color transitions
 * - Active tab shows primary underline and foreground text color
 * - Inactive tabs show muted-foreground text color
 * 
 * Usage:
 * 
 * <TabGroup>
 *   <Tab 
 *     active={activeTab === 'tab1'} 
 *     onClick={() => setActiveTab('tab1')}
 *   >
 *     Tab 1
 *   </Tab>
 *   <Tab 
 *     active={activeTab === 'tab2'} 
 *     onClick={() => setActiveTab('tab2')}
 *   >
 *     Tab 2
 *   </Tab>
 * </TabGroup>
 */

interface TabProps {
  /** Whether this tab is currently active */
  active?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Tab label/content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

/**
 * Individual Tab button component
 * 
 * Features:
 * - Height: 48px (h-12)
 * - Padding: px-4 py-[14px]
 * - Typography: label-medium
 * - Hover: cursor-pointer + bg-muted
 * - Active: primary underline + foreground text
 * - Inactive: muted-foreground text
 */
export function Tab({ 
  active = false, 
  onClick, 
  children, 
  className = '',
  disabled = false 
}: TabProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative h-12 px-4 py-[14px]
        flex items-center justify-center
        whitespace-nowrap
        label-medium
        transition-colors
        cursor-pointer
        hover:bg-muted
        ${active ? 'text-foreground' : 'text-muted-foreground'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Tab content */}
      <span className="relative z-10">{children}</span>
      
      {/* Active indicator - 2px primary line at bottom */}
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
      )}
    </button>
  );
}

interface TabGroupProps {
  /** Tab buttons as children */
  children: React.ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
  /** Whether tabs should scroll horizontally on overflow */
  scrollable?: boolean;
}

/**
 * TabGroup container component
 * 
 * Wraps multiple Tab components and provides consistent layout.
 * Optional horizontal scrolling for many tabs.
 */
export function TabGroup({ 
  children, 
  className = '',
  scrollable = true 
}: TabGroupProps) {
  return (
    <div 
      className={`
        flex items-center gap-0
        ${scrollable ? 'overflow-x-auto scrollbar-hide' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

/**
 * Alternative: Compact Tab variant for smaller spaces
 * Height: 40px, smaller padding
 */
export function TabCompact({ 
  active = false, 
  onClick, 
  children, 
  className = '',
  disabled = false 
}: TabProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative h-10 px-3 py-2
        flex items-center justify-center
        whitespace-nowrap
        label-small
        transition-colors
        cursor-pointer
        hover:bg-muted
        ${active ? 'text-foreground' : 'text-muted-foreground'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
      
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
      )}
    </button>
  );
}

/**
 * Alternative: Large Tab variant for prominent navigation
 * Height: 56px, larger text
 */
export function TabLarge({ 
  active = false, 
  onClick, 
  children, 
  className = '',
  disabled = false 
}: TabProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative h-14 px-6 py-4
        flex items-center justify-center
        whitespace-nowrap
        label-large
        transition-colors
        cursor-pointer
        hover:bg-muted
        ${active ? 'text-primary' : 'text-foreground'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
      
      {active && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-t-full" />
      )}
    </button>
  );
}
