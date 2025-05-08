
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateUserDetails } from '../utils/userDetailsGenerator';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle } from 'lucide-react';
import { useGraphData } from '../hooks/useGraphData';

interface UserDetailProps {
    selectedUser: string | null;
    selectedDataset: string;
}

const UserDetail: React.FC<UserDetailProps> = ({ selectedUser, selectedDataset }) => {
    const { userDetailsData } = useGraphData(selectedDataset);

  if (!selectedUser) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
        <p>请从用户列表中选择一个用户</p>
      </div>
    );
  }

  console.log("UserDetail component - Selected user:", selectedUser);
  console.log("UserDetail component - Selected dataset:", selectedDataset);
  console.log("UserDetail component - userDetailsData length:", userDetailsData?.length || 0);
  
  const userDetails = generateUserDetails(selectedUser, userDetailsData);
  
  console.log("显示用户详细信息:", selectedUser, "姓名:", userDetails.fullName, "UID:", userDetails.uid);
  
  // Get status badge color based on status
  const getStatusColor = (status: string) => {
    switch(status) {
      case '活跃': return 'bg-green-500 bg-opacity-20 text-green-400';
      case '在线': return 'bg-blue-500 bg-opacity-20 text-blue-400';
      case '离线': return 'bg-gray-500 bg-opacity-20 text-gray-400';
      case '忙碌': return 'bg-orange-500 bg-opacity-20 text-orange-400';
      case '离开': return 'bg-yellow-500 bg-opacity-20 text-yellow-400';
      case '工作中': return 'bg-purple-500 bg-opacity-20 text-purple-400';
      case '学习中': return 'bg-cyan-500 bg-opacity-20 text-cyan-400';
      case '旅行中': return 'bg-indigo-500 bg-opacity-20 text-indigo-400';
      case '会议中': return 'bg-rose-500 bg-opacity-20 text-rose-400';
      case '休息中': return 'bg-emerald-500 bg-opacity-20 text-emerald-400';
      default: return 'bg-green-500 bg-opacity-20 text-green-400';
    }
  };
  
  // Determine if user is certified (from imported data)
  const isCertified = userDetails.isCertified !== undefined ? userDetails.isCertified : false;

  // Activity level is now directly a number between 20 and 100
  const activityValue = userDetails.activityLevel;

  return (
    <div className="w-full h-full flex flex-col">
      <h2 className="text-lg font-bold mb-1 text-blue-300 text-center">用户信息</h2>
      <ScrollArea className="flex-1 pr-1">
        <div className="space-y-3 pl-1">
          <div className="flex items-center justify-between pb-2 border-b border-gray-700">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                {userDetails.fullName.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{userDetails.fullName}</h3>
                <p className="text-xs text-gray-400">@{userDetails.username}</p>
              </div>
            </div>
            {isCertified && (
              <div className="flex items-center mr-2">
                <CheckCircle className="w-5 h-5 text-yellow-300 mr-1" />
                <span className="text-xs text-yellow-300">认证用户</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-sm pl-1">
            <div className="text-gray-400">UID:</div>
            <div className="text-white">{userDetails.uid}</div>
            
            <div className="text-gray-400">性别:</div>
            <div className="text-white">{userDetails.gender}</div>
            
            <div className="text-gray-400">年龄:</div>
            <div className="text-white">{userDetails.age}</div>
            
            <div className="text-gray-400">所在地:</div>
            <div className="text-white">{userDetails.location}</div>
            
            <div className="text-gray-400">注册日期:</div>
            <div className="text-white">{userDetails.joinDate}</div>

            <div className="text-gray-400">账号状态:</div>
            <div className="text-white">
              <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(userDetails.status)}`}>
                {userDetails.status}
              </span>
            </div>

            <div className="text-gray-400">活跃度:</div>
            <div className="text-white w-full pr-4">
              <Progress 
                value={activityValue} 
                className="h-2 bg-gray-700"
              />
              <div className="text-xs text-white text-left mt-1">
                {activityValue}/100
              </div>
            </div>
          </div>

          <div className="border border-gray-700 rounded-md p-2 -ml-1">
            <div className="text-gray-400 mb-1 text-sm pl-1">个性签名:</div>
            <div className="text-white text-sm bg-tech-blue bg-opacity-30 p-2 rounded-md">
              {userDetails.bio}
            </div>
          </div>

          <div className="flex justify-between pt-2 px-4 pb-5">
            <div className="text-center mx-1">
              <div className="text-sm font-bold text-blue-300">{userDetails.followCount}</div>
              <div className="text-xs text-gray-400">关注</div>
            </div>
            <div className="text-center mx-1">
              <div className="text-sm font-bold text-purple-300">{userDetails.followersCount}</div>
              <div className="text-xs text-gray-400">粉丝</div>
            </div>
            <div className="text-center mx-1">
              <div className="text-sm font-bold text-green-300">{userDetails.postsCount}</div>
              <div className="text-xs text-gray-400">发帖</div>
            </div>
            <div className="text-center mx-1">
              <div className="text-sm font-bold text-yellow-300">{userDetails.likesCount}</div>
              <div className="text-xs text-gray-400">获赞</div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default UserDetail;
