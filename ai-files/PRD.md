# Quizzi PRD

# **PRD: Quiz Duel - Real-time PvP Knowledge Battle App**

## 1. **Idea Summary**

A mobile-first, real-time 1v1 quiz duel app where players compete head-to-head in fast-paced knowledge battles. Players race to answer questions correctly first, earning ranks and rewards through their speed and accuracy. The app combines trivia knowledge with reflex-based gameplay to create an exciting, competitive experience.

## 2. **Target Users / Use Case**

- **Primary:** Competitive casual gamers who enjoy trivia and quick mental challenges
- **Secondary:** Knowledge enthusiasts who want to test their expertise against others
- **Use Cases:** Quick 2-3 minute gaming sessions during commutes, breaks, or downtime; social competition with friends; self-improvement through competitive learning

## 3. **Core Features / Deliverables**

- **Matchmaking System:** Quick pairing with skill-based matching
- **Battle Mechanics:** Split-screen or mirrored UI showing both players' progress; first correct tap wins the round; best of 5 rounds per match
- **Battle Type:** Best of 5 style (whoever gets 3 round first wins the match) battle for first phase of SLC
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