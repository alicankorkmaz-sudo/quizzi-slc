# Quizzi PRD

# **PRD: Quiz Duel - Real-time PvP Knowledge Battle App**

## 1. **Idea Summary**

A mobile-first, real-time 1v1 quiz duel app where players race to answer trivia questions correctly. The core mechanic: first correct answer wins the round. Speed and accuracy are equally critical. The game creates competitive tension through real-time racing where every millisecond counts.

## 2. **Target Users / Use Case**

- **Primary:** Competitive casual gamers who enjoy trivia and quick mental challenges
- **Secondary:** Knowledge enthusiasts who want to test their expertise against others
- **Use Cases:** Quick 2-3 minute gaming sessions during commutes, breaks, or downtime; social competition with friends; self-improvement through competitive learning

## 3. **Core Features / Deliverables**

- **Matchmaking System:** Quick pairing with skill-based matching
- **Battle Mechanics:** Real-time competitive UI showing both players; first correct answer wins the round instantly; matches are multi-round competitions
- **5 Launch Categories:** General Knowledge, Geography, Science, Pop Culture, Sports
- **Ranking System:** ELO-based ranking with visual tiers (Bronze → Diamond)

## 4. **Constraints / Requirements**

- **Technical:** React Native for cross-platform; WebSocket for real-time sync; <100ms latency tolerance
- **Design:** Mobile-first UI optimized for one-thumb play; instant visual feedback on taps
- **Content:** Initial bank of 1,000 questions (200 per category)

## 6. **Next Steps / Roadmap**

**Phase 1 - Core SLC**

- Design & prototype battle UI with haptic feedback
- Implement WebSocket infrastructure for real-time sync
- Create question database and rotation system for 5 initial categories
- Build matchmaking and ELO ranking algorithm

**Phase 2 - Polish & Launch**

**Phase 3 - Growth**

This SLC focuses on delivering a complete, delightful experience with just the 1v1 duel core, postponing non-core slc features until product-market fit is validated.