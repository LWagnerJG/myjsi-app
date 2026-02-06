import React, { useState, useMemo } from 'react';
import { PortalNativeSelect } from '../forms/PortalNativeSelect';
import { Trash2 } from 'lucide-react';

export const EditablePersonRow = ({ person, theme, onUpdateRole, onRemovePerson }) => {
    const [isEditing, setIsEditing] = useState(false);

    const roleOptions = useMemo(() => [
        { label: 'Administrator', value: 'Administrator' },
        { label: 'Admin/Sales Support', value: 'Admin/Sales Support' },
        { label: 'Sales', value: 'Sales' },
        { label: 'Designer', value: 'Designer' },
        { label: 'Sales/Designer', value: 'Sales/Designer' },
        { label: 'Installer', value: 'Installer' }
    ], []);

    const handleRoleChange = (e) => {
        onUpdateRole(person.name, e.target.value);
        setIsEditing(false);
    };

    return (
        <button
            onClick={() => setIsEditing(!isEditing)}
            className="w-full flex flex-col items-start px-3 py-2 rounded-full transition-all duration-200"
            style={{
                backgroundColor: isEditing ? theme.colors.subtle : 'transparent',
            }}
        >
            <div className="flex items-center justify-between w-full">
                <span className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>
                    {person.name}
                </span>
                {person.status === 'pending' && <Hourglass className="w-3 h-3 text-amber-500 ml-2" />}
            </div>

            {isEditing && (
                <div className="flex items-center space-x-2 animate-fade-in w-full mt-2">
                    <PortalNativeSelect
                        label=""
                        value={person.roleLabel}
                        onChange={handleRoleChange}
                        options={roleOptions}
                        theme={theme}
                        placeholder="Change Role"
                    />
                    <button onClick={(e) => { e.stopPropagation(); onRemovePerson(person.name); }} className="p-2 rounded-full" style={{ color: '#B85C5C' }}>
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}
        </button>
    );
};
