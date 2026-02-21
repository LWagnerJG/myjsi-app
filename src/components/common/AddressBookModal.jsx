import React from 'react';
import { Modal } from './Modal';

export const AddressBookModal = ({ show, onClose, addresses, onSelectAddress, theme }) => {
    if (!show) return null;

    return (
        <Modal show={show} onClose={onClose} title="Select Address" theme={theme}>
            <div className="space-y-2">
                {addresses && addresses.length > 0 ? (
                    addresses.map((addr, index) => (
                        <div
                            key={index}
                            onClick={() => onSelectAddress(addr.address)}
                            className="p-3 rounded-lg cursor-pointer transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                            style={{ color: theme.colors.textPrimary }}
                        >
                            <p className="font-bold">{addr.name}</p>
                            <p className="text-sm">{addr.address}</p>
                        </div>
                    ))
                ) : (
                    <p style={{ color: theme.colors.textSecondary }}>No addresses found in directory.</p>
                )}
            </div>
        </Modal>
    );
};
