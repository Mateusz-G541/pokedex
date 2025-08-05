/**
 * UI Interface Test Data
 * 
 * WHY: Centralized UI data ensures consistent selectors and timeouts across all E2E tests
 */

import { UITestData, ValidationRules, ErrorMessages } from '../types/test-data.types';

export const UIData: UITestData = {
  viewport: {
    width: 1280,
    height: 720
  },
  
  timeouts: {
    short: 2000,    // Quick interactions
    medium: 5000,   // Network requests
    long: 10000,    // Complex operations
    network: 15000  // Network-dependent operations
  },
  
  selectors: {
    // Search functionality
    searchInput: '[data-testid="pokemon-search-input"], input[placeholder*="Pokemon"], #search-input',
    searchButton: '[data-testid="search-button"], button[type="submit"], .search-btn',
    
    // Random Pokemon functionality
    randomButton: '[data-testid="random-button"], .random-btn, button:has-text("Random")',
    randomLegendaryButton: '[data-testid="random-legendary-button"], .random-legendary-btn, button:has-text("Random Legendary")',
    
    // Pokemon display
    pokemonCard: '[data-testid="pokemon-card"], .pokemon-card, .pokemon-info',
    pokemonImage: '[data-testid="pokemon-image"], .pokemon-image, img[alt*="Pokemon"]',
    pokemonName: '[data-testid="pokemon-name"], .pokemon-name, h1, h2',
    
    // Team management
    teamTab: '[data-testid="team-tab"], .team-tab, button:has-text("Team")',
    addToTeamButton: '[data-testid="add-to-team"], .add-to-team-btn, button:has-text("Add to Team")',
    removeFromTeamButton: '[data-testid="remove-from-team"], .remove-from-team-btn, button:has-text("Remove")',
    teamMember: '[data-testid="team-member"], .team-member, .team-pokemon',
    
    // Error and loading states
    errorMessage: '[data-testid="error-message"], .error-message, .alert-error',
    loadingIndicator: '[data-testid="loading"], .loading, .spinner'
  }
};

export const ValidationRules: ValidationRules = {
  generation1: {
    minId: 1,
    maxId: 151,
    totalCount: 151
  },
  
  pokemonName: {
    minLength: 1,
    maxLength: 50,
    allowedCharacters: /^[a-zA-Z\s\-'\.]+$/
  },
  
  search: {
    minQueryLength: 1,
    maxResults: 10
  },
  
  team: {
    maxSize: 6,
    minSize: 0
  }
};

export const ErrorMessages: ErrorMessages = {
  pokemon: {
    notFound: 'Pokemon not found',
    invalidId: 'Invalid Pokemon ID',
    networkError: 'Network error occurred',
    loadingFailed: 'Failed to load Pokemon data'
  },
  
  team: {
    duplicate: 'Pokemon is already in your team',
    full: 'Your team is full! You can only have 6 Pokemon',
    empty: 'Your team is empty',
    removeSuccess: 'Pokemon removed from team',
    addSuccess: 'Pokemon added to team'
  },
  
  search: {
    noResults: 'No Pokemon found matching your search',
    tooShort: 'Search query too short',
    invalidCharacters: 'Invalid characters in search query'
  },
  
  api: {
    serverError: 'Server error occurred',
    timeout: 'Request timed out',
    unauthorized: 'Unauthorized access',
    notFound: 'Resource not found'
  }
};

// Environment-specific configurations
export const EnvironmentConfig = {
  local: {
    baseUrl: 'http://localhost:3001',
    apiUrl: 'http://localhost:3000',
    timeout: UIData.timeouts.medium
  },
  
  ci: {
    baseUrl: 'http://localhost:3001',
    apiUrl: 'http://localhost:3000',
    timeout: UIData.timeouts.long // Longer timeouts for CI
  },
  
  staging: {
    baseUrl: 'https://staging-pokemon-app.vercel.app',
    apiUrl: 'https://staging-pokemon-api.vercel.app',
    timeout: UIData.timeouts.long
  }
};

// Responsive breakpoints for testing
export const ResponsiveBreakpoints = {
  mobile: { width: 375, height: 667 },
  tablet: { width: 768, height: 1024 },
  desktop: { width: 1280, height: 720 },
  largeDesktop: { width: 1920, height: 1080 }
};

// Accessibility testing data
export const AccessibilityData = {
  requiredAriaLabels: [
    'pokemon-search-input',
    'search-button',
    'random-button',
    'add-to-team-button'
  ],
  
  keyboardNavigation: {
    searchFlow: ['Tab', 'Enter'],
    teamManagement: ['Tab', 'Space', 'Enter'],
    navigation: ['Tab', 'Shift+Tab']
  },
  
  colorContrast: {
    minimumRatio: 4.5,
    largeTextRatio: 3.0
  }
};
