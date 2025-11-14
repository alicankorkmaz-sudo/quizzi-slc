# Quizzi v2 PRD

# **PRD: Quiz Duel - Real-time PvP Knowledge Battle App**

## 1. **Idea Summary**

A mobile-first, real-time 1v1 quiz duel app where players compete head-to-head in fast-paced knowledge battles. Players race to answer questions correctly first, earning ranks and rewards through their speed and accuracy. The app combines trivia knowledge with reflex-based gameplay to create an exciting, competitive experience.

## 2. **Target Users / Use Case**

- **Primary:** Competitive casual gamers (18-35) who enjoy trivia and quick mental challenges
- **Secondary:** Knowledge enthusiasts who want to test their expertise against others
- **Use Cases:** Quick 2-3 minute gaming sessions during commutes, breaks, or downtime; social competition with friends; self-improvement through competitive learning

## 3. **Core Features / Deliverables**

- **Matchmaking System:** Quick pairing with skill-based matching (±200 rank points)
- **Battle Mechanics:** Split-screen or mirrored UI showing both players' progress; first correct tap wins the round; best of 5 rounds per match
- **5 Launch Categories:** General Knowledge, Geography, Science, Pop Culture, Sports
- **Ranking System:** ELO-based ranking with visual tiers (Bronze → Diamond)
- **Player Profiles:** Username, avatar, rank badge, win rate, streak counter
- **Monetization Trinity:**
    - Rewarded ads for extra lives/continues
    - Premium ($4.99/mo): No ads, exclusive avatars, 2x rank points
    - Cosmetics: Avatar frames, victory animations, tap effects

## 4. **Constraints / Requirements**

- **Technical:** React Native or Flutter for cross-platform; WebSocket for real-time sync; <100ms latency tolerance
- **Design:** Mobile-first UI optimized for one-thumb play; instant visual feedback on taps
- **Content:** Initial bank of 1,000 questions (200 per category); anti-cheat measures for question rotation
- **Platform:** Simultaneous iOS/Android launch
- **Performance:** 60 FPS animations; 3-second max matchmaking time

## 5. **Success Criteria**

- **Week 1:** 1,000 downloads, 40% D1 retention
- **Month 1:** 10,000 MAU, 25% D7 retention, 3+ average sessions/day
- **Month 3:** 15% of users convert to premium or make any purchase
- **Ongoing:** Average match completion rate >80%; <5 second matchmaking p95

## 6. **Next Steps / Roadmap**

**Phase 1 - Core SLC (Weeks 1-6)**

- Design & prototype battle UI with haptic feedback
- Implement WebSocket infrastructure for real-time sync
- Create question database and rotation system
- Build matchmaking and ELO ranking algorithm
- Develop 3 polished categories for soft launch

**Phase 2 - Polish & Launch (Weeks 7-10)**

- Add remaining 2 categories
- Implement basic monetization (rewarded ads only)
- Create onboarding tutorial
- Beta test with 100 users for balance tuning
- Launch on both app stores

**Phase 3 - Growth (Weeks 11-16)**

- Add friend challenges and rematch options
- Implement full monetization (premium + cosmetics)
- Tournament/event system
- Social features (spectate mode, share victories)
- 5 additional categories based on user data

**Immediate Action Items:**

1. Create high-fidelity mockups of battle screen
2. Set up React Native/Flutter project with WebSocket POC
3. Source or create initial 200 questions for Geography category
4. Define exact ranking tiers and point calculations
5. Implement basic matchmaking server with mock data

This SLC focuses on delivering a complete, delightful experience with just the 1v1 duel core, postponing social features and complex monetization until product-market fit is validated.