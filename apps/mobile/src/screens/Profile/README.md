# Profile Screen

Player profile screen for Quizzi mobile app displaying user stats, rank, category performance, and match history.

## Components

### ProfileScreen.tsx
Main profile screen component that composes all profile sub-components.

**Props:**
- `user: User` - Player profile data
- `categoryStats: CategoryStats[]` - Performance breakdown by category
- `matchHistory: MatchHistory[]` - Recent match results (last 10)

### RankDisplay.tsx
Visual rank tier display with badge, points, and progress bar.

**Features:**
- Tier badge with emoji (🥉 Bronze → 👑 Diamond)
- Tier-specific colors matching CLAUDE.md specifications
- Progress bar showing advancement to next tier
- Rank points display
- Max tier achievement message for Diamond

**Tier Configuration:**
- Bronze: 0-1199 (Brown #CD7F32)
- Silver: 1200-1599 (Silver #C0C0C0)
- Gold: 1600-1999 (Gold #FFD700)
- Platinum: 2000-2399 (Teal #00CED1)
- Diamond: 2400+ (Purple #9370DB)

### StatsCard.tsx
Grid layout displaying key player statistics.

**Stats Displayed:**
- Win Rate - Color-coded (green ≥60%, orange ≥50%, red <50%)
- Current Streak - Hot streak indicator (green ≥5, orange ≥3)
- Matches Played - Total games completed
- Avg Response Time - Color-coded performance (green ≤2s, orange ≤4s, red >4s)

### CategoryStats.tsx
Performance breakdown across all 5 quiz categories.

**Features:**
- Category icons and colors
- Win rate percentage per category
- Performance level labels (Excellent, Great, Good, Fair, Practice More)
- Visual progress bars
- Sorted by win rate (best to worst)

**Category Configuration:**
- 🧠 General Knowledge (Purple #6C63FF)
- 🌍 Geography (Cyan #00BCD4)
- 🔬 Science (Green #4CAF50)
- 🎬 Pop Culture (Orange #FF9800)
- ⚽ Sports (Red #F44336)

### MatchHistoryItem.tsx
Individual match result card for recent matches.

**Features:**
- Win/Loss badge and color coding
- Opponent username display
- Category badge with icon
- Match score (e.g., "3-2")
- Rank points change with color coding
- Relative timestamp (e.g., "15m ago", "2d ago")
- Left border indicator for quick win/loss identification

## Mock Data

### mockData.ts
Comprehensive test data for profile screen development.

**Includes:**
- `mockUser` - Gold tier player with good stats
- `mockBronzeUser` - Beginner player for testing low tier
- `mockDiamondUser` - Elite player for testing max tier
- `mockCategoryStats` - Performance across all 5 categories
- `mockMatchHistory` - Last 10 matches with varied results

## Usage

```tsx
import { ProfileScreen } from './src/screens/Profile';
import { mockUser, mockCategoryStats, mockMatchHistory } from './src/screens/Profile/mockData';

<ProfileScreen
  user={mockUser}
  categoryStats={mockCategoryStats}
  matchHistory={mockMatchHistory}
/>
```

## Backend Integration Points

When connecting to the backend API, replace mock data with:

1. **User Data** - GET `/api/users/:userId`
2. **Category Stats** - GET `/api/users/:userId/category-stats`
3. **Match History** - GET `/api/users/:userId/matches?limit=10`

## Future Enhancements

- Pull-to-refresh for updated stats
- Avatar image support (currently shows initials)
- Tap to view full match details
- Share profile functionality
- Friend comparison view
- Achievement badges display
- Rank tier animations on level up

## Design Specifications

- Follows CLAUDE.md tier color guidelines
- Responsive layout for all screen sizes
- Smooth scrolling with proper padding
- Shadow/elevation for card depth
- Color-coded performance indicators
- Mobile-optimized typography

## Performance

- Efficient list rendering for match history
- Optimized calculations in components
- Minimal re-renders with proper memoization opportunities
- Smooth 60 FPS scrolling maintained
