import { createPortal } from 'react-dom';
import React from 'react';

export const DropdownPortal = ({ children }) => {
    return createPortal(
        children,
        document.body
    );
};