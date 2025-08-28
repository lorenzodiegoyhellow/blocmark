// Mock data for the Secret Corners community features

// For Top Contributors
export const mockContributors = [
  {
    id: 1,
    name: "Alex Morgan",
    image: "/attached_assets/6I4B5772.jpg",
    approvedLocations: 12,
    likesReceived: 89,
    badges: ["Top Explorer", "Photo Master"],
    rank: 1
  },
  {
    id: 2,
    name: "Jamie Chen",
    image: "/attached_assets/6I4B6500.jpg",
    approvedLocations: 9,
    likesReceived: 74,
    badges: ["Local Guide"],
    rank: 2
  },
  {
    id: 3,
    name: "Taylor Swift",
    image: "/attached_assets/victorian28972.jpg",
    approvedLocations: 7,
    likesReceived: 56,
    badges: ["Photo Master"],
    rank: 3
  },
  {
    id: 4,
    name: "Jordan Lee",
    approvedLocations: 5,
    likesReceived: 41,
    badges: ["Local Guide"],
    rank: 4
  },
  {
    id: 5,
    name: "Casey Kim",
    approvedLocations: 4,
    likesReceived: 29,
    badges: [],
    rank: 5
  }
];

// For Community Forum
export const mockForumCategories = [
  {
    id: "general",
    name: "General Discussion",
    slug: "general-discussion",
    description: "General photography and travel discussion"
  },
  {
    id: "locations",
    name: "Locations",
    slug: "locations",
    description: "Discuss specific photo locations and tips"
  },
  {
    id: "gear",
    name: "Photography Gear",
    slug: "photography-gear",
    description: "Camera equipment and accessories"
  },
  {
    id: "techniques",
    name: "Techniques",
    slug: "techniques",
    description: "Photography techniques and post-processing"
  }
];

export const mockForumPosts = [
  {
    id: 1,
    title: "Best time for urban photography?",
    content: "I've been trying to capture some urban landscapes but struggling with timing. What time of day do you find works best for urban photography, especially in dense city areas?",
    category: mockForumCategories[0],
    user: {
      id: 1,
      name: "Alex Morgan",
      image: "/attached_assets/6I4B5772.jpg",
      role: "user" as const
    },
    createdAt: "2025-04-10T15:30:00Z",
    likes: 12,
    views: 89,
    comments: 7,
    isPinned: true
  },
  {
    id: 2,
    title: "Hidden beach spots in California",
    content: "I'm planning a trip to California and would love to know about some less-known beach spots for photography. Any recommendations?",
    category: mockForumCategories[1],
    user: {
      id: 2,
      name: "Jamie Chen",
      image: "/attached_assets/6I4B6500.jpg",
      role: "user" as const
    },
    createdAt: "2025-04-12T09:45:00Z",
    likes: 8,
    views: 62,
    comments: 5
  },
  {
    id: 3,
    title: "Camera recommendations for night photography",
    content: "I'm looking to upgrade my camera for better night photography. Budget around $1500. Any recommendations from the community?",
    category: mockForumCategories[2],
    user: {
      id: 3,
      name: "Taylor Swift",
      image: "/attached_assets/victorian28972.jpg",
      role: "user" as const
    },
    createdAt: "2025-04-15T18:20:00Z",
    likes: 15,
    views: 103,
    comments: 12
  }
];

export const mockForumComments = [
  {
    id: 1,
    content: "I personally find the 'blue hour' right after sunset to be magical for urban photography. The city lights start to come on, but there's still enough natural light to balance the scene.",
    user: {
      id: 2,
      name: "Jamie Chen",
      image: "/attached_assets/6I4B6500.jpg",
      role: "user" as const
    },
    createdAt: "2025-04-10T16:45:00Z",
    likes: 5,
    isLiked: false,
    replies: [
      {
        id: 4,
        content: "Agree with this! Also, early Sunday mornings can be great because cities are often less crowded.",
        user: {
          id: 4,
          name: "Jordan Lee",
          role: "user" as const
        },
        createdAt: "2025-04-10T17:30:00Z",
        likes: 2,
        isLiked: false
      }
    ]
  },
  {
    id: 2,
    content: "Golden hour works well too, especially if you can position yourself to catch reflections off glass buildings. But it really depends on the specific city and its layout.",
    user: {
      id: 5,
      name: "Casey Kim",
      role: "user" as const
    },
    createdAt: "2025-04-11T09:15:00Z",
    likes: 3,
    isLiked: true
  }
];

// For Weekly Challenge
export const mockWeeklyChallenge = {
  id: 1,
  title: "Urban Reflections",
  description: "This week, capture photos that feature reflections in an urban environment. Look for puddles after rain, glass buildings, polished surfaces, or any creative reflection in a city setting.",
  startDate: "2025-04-10T00:00:00Z",
  endDate: "2025-04-17T23:59:59Z",
  theme: "Urban",
  entries: 24,
  prizes: [
    "Feature in Blocmark's Instagram",
    "Pro account for 3 months",
    "Photography e-book bundle"
  ],
  previousWinner: {
    id: 2,
    name: "Jamie Chen",
    image: "/attached_assets/6I4B6500.jpg",
    photoUrl: "/attached_assets/victorian28972.jpg",
    photoTitle: "Morning Fog at Golden Gate"
  }
};