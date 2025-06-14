/**
 * Application constants
 */

// Stripe Configuration
export const STRIPE_CONFIG = {
  // TODO: Move to environment variables in production
  PUBLIC_KEY:
    "pk_test_51Q2YysK7LyHlGaLs1KaOcD1Gk6A8b8l45LVF3q9URgskNKwgFHBEIPRKtMXGZEu0kFn9Iq0yWGcJ0Aatm5XCMsiK00SWythWSu",
};

// LocalStorage Keys
export const STORAGE_KEYS = {
  QUANTITIES: "quantities",
  SHIFTS: "shifts",
  PRODUCT_SHIFTS: "product_shifts",
  CART_ITEMS: "cart_items",
};

// Event Types
export const EVENT_TYPES = {
  SHIFT_EVENT: "shift_event",
  PRODUCT_SALE: "product_sale",
};

// Debounce Timings (in milliseconds)
export const DEBOUNCE_TIMINGS = {
  LOCAL_STORAGE_SAVE: 300,
  SEARCH: 500,
};

// UI Constants
export const UI_CONSTANTS = {
  MAX_SHIFTS_PER_ORDER: 1,
  SCROLL_BEHAVIOR: "smooth",
};

// Error Messages
export const ERROR_MESSAGES = {
  AUTH_REQUIRED: "Log in om af te rekenen.",
  NO_PRODUCTS_SELECTED: "Selecteer ten minste één product om af te rekenen.",
  TIMESLOT_REQUIRED:
    "Selecteer een tijdslot voor producten die een tijdslot vereisen.",
  MULTIPLE_SHIFTS_ERROR: "Selecteer slechts één tijdslot per bestelling.",
  CHECKOUT_ERROR: "Er is een fout opgetreden tijdens het afrekenen.",
  LOAD_EVENTS_ERROR: "Er is een fout opgetreden bij het laden van de events.",
  LOAD_PRODUCTS_ERROR:
    "Er is een fout opgetreden bij het laden van de producten.",
  STRIPE_LOAD_ERROR: "Failed to load Stripe",
};

// Notification Titles
export const NOTIFICATION_TITLES = {
  AUTH_ERROR: "Authenticatie",
  VALIDATION_ERROR: "Controleer je invoer",
  CHECKOUT_ERROR: "Afrekenfout",
  LOAD_ERROR: "Laadprobleem",
};
