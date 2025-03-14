import { render, screen } from '@testing-library/react';
import React from 'react';

import LoadingAnimation from '../LoadingAnimation';

describe('LoadingAnimation', () => {
  it('renders loading text', () => {
    render(<LoadingAnimation />);
    expect(screen.getByText('Connecting to Video Chat...')).toBeInTheDocument();
  });

  it('renders video icon', () => {
    render(<LoadingAnimation />);
    const videoIcon = document.querySelector('.h-16.w-16');
    expect(videoIcon).toBeInTheDocument();
  });

  it('renders status indicator', () => {
    render(<LoadingAnimation />);
    const statusIndicator = document.querySelector('.animate-bounce');
    expect(statusIndicator).toBeInTheDocument();
  });
}); 