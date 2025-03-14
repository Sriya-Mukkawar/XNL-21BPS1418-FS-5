import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useSession } from 'next-auth/react';
import React from 'react';
import { RecoilRoot } from 'recoil';

import ChatListItem from '../Chat/ChatListItem';
import { FullConversationType } from '@/lib/types';

jest.mock('next-auth/react');

const mockConversation: FullConversationType = {
  id: '1',
  name: 'Test Conversation',
  isGroup: false,
  logo: null,
  users: [
    {
      id: '1',
      name: 'Test User',
      email: 'test@example.com',
      image: '/test.jpg',
      emailVerified: true,
      verificationCode: null,
      hashedPassword: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      conversationIds: [],
      seenMessageIds: [],
      about: null,
      lastSeen: new Date(),
    },
  ],
  messages: [
    {
      id: '1',
      body: 'Test Message',
      image: null,
      audio: null,
      video: null,
      type: 'text',
      metadata: null,
      createdAt: new Date(),
      seen: [],
      seenIds: [],
      conversationId: '1',
      senderId: '1',
      sender: {
        id: '1',
        name: 'Test User',
        email: 'test@example.com',
        emailVerified: true,
        verificationCode: null,
        image: null,
        hashedPassword: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        conversationIds: [],
        seenMessageIds: [],
        about: null,
        lastSeen: new Date(),
      },
    },
  ],
  messagesIds: ['1'],
  userIds: ['1'],
  createdAt: new Date(),
  lastMessageAt: new Date(),
};

describe('ChatListItem', () => {
  beforeEach(() => {
    (useSession as jest.Mock).mockReturnValue({
      data: {
        user: {
          email: 'test@example.com',
        },
      },
      status: 'authenticated',
    });
  });

  it('renders conversation name', () => {
    render(
      <RecoilRoot>
        <ChatListItem
          conversation={mockConversation}
          email="test@example.com"
        />
      </RecoilRoot>
    );
    expect(screen.getByText('Test Conversation')).toBeInTheDocument();
  });

  it('renders last message', () => {
    render(
      <RecoilRoot>
        <ChatListItem
          conversation={mockConversation}
          email="test@example.com"
        />
      </RecoilRoot>
    );
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('handles click event', () => {
    const { container } = render(
      <RecoilRoot>
        <ChatListItem
          conversation={mockConversation}
          email="test@example.com"
        />
      </RecoilRoot>
    );
    
    const listItem = container.firstChild;
    fireEvent.click(listItem as Element);
    // Add assertions for click behavior
  });
}); 