## Features

- Smooth platformer movement with double jump
- Two types of flying enemies with different behaviors
- Collectible coins scattered around the level
- Progressive difficulty (more enemies spawn as you score higher)
- Lives system with temporary invincibility

## How to play

**Controls:**
- Arrow keys or A/D: Move left/right
- Space, W, or Up Arrow: Jump (press again in air for double jump)
- R: Restart after game over

**Goal:**
Collect gold coins (+50 points) while avoiding enemies. You have 3 lives.

**Enemies:**
- Orange triangles: Wander around randomly
- Pink diamonds: Chase after you

**Difficulties found at the beginning**

- Coins were too close to each other, which had made the game easier and not very fun to play
  Solution : Made a distance of at least 40-80 pixels from one coin to another/Making some coins on platforms, some othes in the air.

- Some enemies were falling

- The wanderer were moving at the same direction

**AI Usage**

I used Claude sonnet 4.5

I used AI in those cases :
    - Coin Visual : I wanted coins to look like actual gold coins with a shine effect.

    - All wanderer enemies were moving in the same direction at start, but I wanted them to move in random direction.

    - Score-Based Difficulty Scaling : Game became boring after a while. I wanted it to get harder as score increased.

    - Creating a trail fade effect behind the player.