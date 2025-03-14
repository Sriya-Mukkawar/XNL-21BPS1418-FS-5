import { render, screen } from '@testing-library/react';
import { useSession } from 'next-auth/react';
import React from 'react';
import { RecoilRoot } from 'recoil';

import ChatList from '../Chat/ChatList';

// Mock the useSession hook
jest.mock('next-auth/react');

describe('ChatList', () => {
  beforeEach(() => {
    // Mock the session data
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          name: 'Test User',
          email: 'test@example.com',
          image: '/images/placeholder.jpg',
        },
      },
      status: 'authenticated',
    });
  });

  it('renders user profile image', () => {
    render(
      <RecoilRoot>
        <ChatList />
      </RecoilRoot>
    );
    const profileImage = screen.getByAltText('Profile');
    expect(profileImage).toBeInTheDocument();
  });

  it('renders action buttons', () => {
    render(
      <RecoilRoot>
        <ChatList />
      </RecoilRoot>
    );
    const buttons = document.querySelectorAll('.cursor-pointer');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders chat list container', () => {
    render(
      <RecoilRoot>
        <ChatList />
      </RecoilRoot>
    );
    const container = document.querySelector('.h-[calc(100vh-56px)]');
    expect(container).toBeInTheDocument();
  });
}); 