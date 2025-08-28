import React from 'react';
import { SecretCornersAccessWrapper } from './secret-corners-access-wrapper';
import SecretCornersPage from '../../pages/secret-corners';

export default function SecretCorners() {
  return (
    <SecretCornersAccessWrapper>
      <SecretCornersPage />
    </SecretCornersAccessWrapper>
  );
}