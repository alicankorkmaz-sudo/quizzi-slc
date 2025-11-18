-- Randomize avatars for users who currently have emoji_dog
-- This creates variety in the user base

UPDATE User 
SET avatar = (
  CASE (abs(random()) % 16)
    WHEN 0 THEN 'emoji_dog'
    WHEN 1 THEN 'emoji_cat'
    WHEN 2 THEN 'emoji_panda'
    WHEN 3 THEN 'emoji_fox'
    WHEN 4 THEN 'emoji_lightning'
    WHEN 5 THEN 'emoji_fire'
    WHEN 6 THEN 'emoji_diamond'
    WHEN 7 THEN 'emoji_target'
    WHEN 8 THEN 'emoji_cool'
    WHEN 9 THEN 'emoji_nerd'
    WHEN 10 THEN 'emoji_party'
    WHEN 11 THEN 'emoji_devil'
    WHEN 12 THEN 'emoji_star'
    WHEN 13 THEN 'emoji_rainbow'
    WHEN 14 THEN 'emoji_pizza'
    ELSE 'emoji_game'
  END
)
WHERE avatar = 'emoji_dog';
