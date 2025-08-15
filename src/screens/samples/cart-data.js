// Cart-related data and configuration constants for samples feature

// Cart item types
export const CART_ITEM_TYPES = {
    PRODUCT: 'product',
    SET: 'set',
    FULL_SET: 'full-set'
};

// Cart status constants
export const CART_STATUS = {
    EMPTY: 'empty',
    ITEMS_ADDED: 'items-added',
    READY_TO_SUBMIT: 'ready-to-submit',
    SUBMITTED: 'submitted'
};

// Default cart configuration
export const CART_CONFIG = {
    MAX_ITEMS_PER_PRODUCT: 10,
    MAX_TOTAL_ITEMS: 100,
    FREE_SHIPPING_THRESHOLD: 0, // All samples ship free
    SHOW_PRICING: false, // Samples are typically free
};

// Order submission endpoints/config
export const ORDER_CONFIG = {
    SUBMISSION_ENDPOINT: '/api/samples/order',
    CONFIRMATION_EMAIL: true,
    TRACKING_ENABLED: true,
};

// Cart validation rules
export const CART_VALIDATION = {
    REQUIRED_FIELDS: ['shipToName', 'address1'],
    OPTIONAL_FIELDS: ['address2'],
    MIN_ITEMS: 1,
};

// Default cart state
export const EMPTY_CART = {};

// Cart action types (if using with reducer pattern)
export const CART_ACTIONS = {
    ADD_ITEM: 'ADD_ITEM',
    REMOVE_ITEM: 'REMOVE_ITEM',
    UPDATE_QUANTITY: 'UPDATE_QUANTITY',
    CLEAR_CART: 'CLEAR_CART',
    SUBMIT_ORDER: 'SUBMIT_ORDER',
};