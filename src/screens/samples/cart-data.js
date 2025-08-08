// Cart and sample management data
export const CART_CONSTANTS = {
    SHIPPING_METHODS: ['standard', 'express', 'overnight'],
    MAX_ITEMS_PER_ORDER: 50,
    BULK_ORDER_THRESHOLD: 20
};

export const CART_FORM_INITIAL = {
    address: '',
    shippingMethod: 'standard',
    specialInstructions: '',
    urgentRequest: false
};

export const ORDER_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing', 
    SHIPPED: 'shipped',
    DELIVERED: 'delivered'
};

export const SAMPLE_CART_SETTINGS = {
    allowBackorders: true,
    maxQuantityPerItem: 5,
    autoAddSetsToCart: false,
    defaultShippingAddress: 'use_profile'
};