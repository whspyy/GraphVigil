
import React, { useMemo, useRef, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useGraphData } from '../hooks/useGraphData';
import { generateUserDetails } from '../utils/userDetailsGenerator';
import dataset1 from '../data/dataset1.json';
import dataset2 from '../data/dataset2.json';
import dataset3 from '../data/dataset3.json';

interface UserListProps {
  selectedDataset: string;
  selectedUser: string | null;
  onUserSelect: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ 
  selectedDataset, 
  selectedUser, 
  onUserSelect 
}) => {
  // Reference to the scroll area component
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Use the useGraphData hook to get access to userDetailsData for the current dataset
  const { userDetailsData } = useGraphData(selectedDataset);

  // Get users based on selected dataset (keep this for the user IDs)
  const users = useMemo(() => {
    let dataset;
    switch (selectedDataset) {
      case 'dataset1':
        dataset = dataset1;
        break;
      case 'dataset2':
        dataset = dataset2;
        break;
      case 'dataset3':
        dataset = dataset3;
        break;
      default:
        dataset = dataset1;
    }
    return dataset.nodes;
  }, [selectedDataset]);

  // Effect to reset scroll position when dataset changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewportElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewportElement) {
        viewportElement.scrollTop = 0;
      }
    }
  }, [selectedDataset]);

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-lg font-bold mb-1 text-blue-300 text-center">用户列表</h2>
      <ScrollArea className="flex-1 pr-1" ref={scrollAreaRef}>
        <div className="space-y-1">
          {users.map((user: any) => {
            // Get the user details for this user ID to display the nickname
            const userDetails = generateUserDetails(user.id, userDetailsData);
            
            return (
              <div
                key={user.id}
                className={`cursor-pointer p-1.5 rounded-md text-left transition-colors ${
                  selectedUser === user.id 
                    ? 'bg-tech-accent bg-opacity-50 text-white' 
                    : 'hover:bg-tech-blue text-gray-300'
                }`}
                onClick={() => onUserSelect(user.id)}
              >
                <span className="text-sm font-medium">{userDetails.fullName}</span>
                <span className="text-xs text-gray-400 ml-1">({user.id})</span>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserList;
