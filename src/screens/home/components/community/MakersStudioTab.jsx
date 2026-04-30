import React from 'react';
import { StudioHub } from '../../../studio/StudioHub.jsx';

export const MakersStudioTab = ({ theme, currentUserId, onNavigate, onCreateOnePager }) => (
  <StudioHub
    theme={theme}
    currentUserId={currentUserId}
    onNavigate={onNavigate}
    onCreateOnePager={onCreateOnePager}
  />
);

export default MakersStudioTab;
