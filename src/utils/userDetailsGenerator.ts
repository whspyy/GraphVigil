
// Simplified utility function to generate random recent dates for activities
const generateRecentDate = (): string => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Function to generate random join date (for fields not in JSON)
const generateJoinDate = (): string => {
  const year = Math.floor(Math.random() * 15) + 2010;
  const month = Math.floor(Math.random() * 12) + 1;
  const day = Math.floor(Math.random() * 28) + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

export const generateUserDetails = (userId: string, userDetailsArray?: any[]) => {
  // No user ID provided
  if (!userId) {
    return null;
  }

  // Check if we have user details array
  if (!userDetailsArray || userDetailsArray.length === 0) {
    console.log("Warning: No user details array provided");
    return createDefaultUserDetails(userId);
  }
  
  // Extract numeric part from userId (e.g., "user5" -> 5)
  let userIndex = -1;
  if (userId.startsWith('user')) {
    const numericPart = userId.replace(/\D/g, '');
    if (numericPart) {
      userIndex = parseInt(numericPart, 10);
    }
  }
  
  // If we have a valid index (starting from 1), get the corresponding user (adjusting for 0-based indexing)
  if (userIndex > 0 && userIndex <= userDetailsArray.length) {
    const matchedUser = userDetailsArray[userIndex - 1];
    
    console.log(`Found user in dataset: ${matchedUser.user_name}, ID: ${matchedUser.user_id}, index: ${userIndex}`);
    
    // Generate random activities
    const recentActivities = generateRandomActivities();
    
    // Generate random status
    const statuses = ["在线", "离线", "忙碌", "活跃", "离开", "工作中", "学习中", "旅行中", "会议中", "休息中"];
    
    // Generate random activity level between 20 and 100
    const activityValue = Math.floor(Math.random() * 81) + 20;  // Random number between 20 and 100
    
    // Convert gender from number to string
    const genderText = matchedUser.gender === 1 ? '男' : '女';
    
    // Return user details with data from JSON
    return {
      uid: matchedUser.user_id,
      username: matchedUser.user,
      fullName: matchedUser.user_name,
      gender: genderText,
      age: Math.floor(Math.random() * 30) + 18, // Random age between 18-47
      location: matchedUser.ip_location,
      bio: matchedUser.user_description,
      joinDate: generateJoinDate(),
      followCount: matchedUser.follow_count,
      followersCount: matchedUser.fan_count,
      postsCount: matchedUser.post_count,
      likesCount: matchedUser.like_num,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      activityLevel: activityValue,  // Now we store the actual numeric value instead of a string
      recentActivities: recentActivities,
      isCertified: matchedUser.user_type === "认证用户"
    };
  }
  
  console.log(`No user details found for ID: ${userId}, index: ${userIndex}, array length: ${userDetailsArray?.length}`);
  return createDefaultUserDetails(userId);
};

// Helper function to create default user details
function createDefaultUserDetails(userId: string) {
  return {
    uid: "未知",
    username: userId,
    fullName: "未知用户",
    gender: "未知",
    age: 0,
    location: "未知",
    bio: "未找到此用户的详细信息",
    joinDate: "未知",
    followCount: 0,
    followersCount: 0,
    postsCount: 0,
    likesCount: 0,
    status: "离线",
    activityLevel: 20,  // Default minimum activity value
    recentActivities: [],
    isCertified: false
  };
}

// Helper function to generate random activities
function generateRandomActivities() {
  const activities = [
    "分享了一篇技术文章", "发布了新动态", "评论了热门话题", "更新了个人资料", 
    "加入了兴趣小组", "上传了新照片", "添加了新好友", "参与了在线讨论"
  ];
  
  // Generate 3 random activities
  const recentActivities = [];
  const usedActivities = new Set();
  
  for (let i = 0; i < 3; i++) {
    let randomActivity;
    do {
      randomActivity = activities[Math.floor(Math.random() * activities.length)];
    } while (usedActivities.has(randomActivity));
    
    usedActivities.add(randomActivity);
    recentActivities.push({
      date: generateRecentDate(),
      action: randomActivity
    });
  }
  
  // Sort activities by date (most recent first)
  return recentActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
