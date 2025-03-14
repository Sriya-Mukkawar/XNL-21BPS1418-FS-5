import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Avatar } from './ui/avatar';
import { useUsers } from '../hooks/useUsers';

interface User {
  id: string;
  name: string | null;
  image: string | null;
}

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: (userId: string) => void;
}

export const ShareModal = ({ isOpen, onClose, onShare }: ShareModalProps) => {
  const { users } = useUsers();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share with</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 max-h-[400px] overflow-y-auto p-4">
          {users?.map((user: User) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer"
              onClick={() => {
                onShare(user.id);
                onClose();
              }}
            >
              <div className="flex items-center gap-3">
                <Avatar>
                  <img src={user.image || ''} alt={user.name || ''} />
                </Avatar>
                <span className="font-medium dark:text-white">{user.name}</span>
              </div>
              <Button variant="ghost" size="sm" className="dark:text-white dark:hover:bg-gray-600">
                Share
              </Button>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 