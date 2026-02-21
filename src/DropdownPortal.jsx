import { createPortal } from 'react-dom';
import React from 'react';

export const DropdownPortal = React.memo(({ children }) => {
    return createPortal(
        children,
        document.body
    );
});

DropdownPortal.displayName = 'DropdownPortal';