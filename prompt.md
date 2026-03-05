Repair the remaining `/players` feature regressions.

Important rules:

• Do NOT use legacy SPA scripts
• Do NOT import anything from `assets/js/*`
• Do NOT use manual DOM listeners or querySelector logic
• Implement everything using React state/hooks

The `/players` page was migrated from SPA to Next.js and most functionality now works.

Working features:

* auctionable toggle
* 70-player initial pagination
* load more pagination
* sorting
* search filtering

However two SPA parity features are still missing.

---

1️⃣ PLAYER HOVER CARD PREVIEW

Legacy behavior:

When hovering a player row:

• A player card preview appears next to the mouse cursor
• The preview updates instantly when hovering another player
• The preview disappears when leaving the row
• The preview follows the mouse position

Implementation requirements:

* Implement using React state in `PlayersDatabaseInteractions.client.js`
* Track hovered player and mouse coordinates
* Add row events:

  * onMouseEnter
  * onMouseMove
  * onMouseLeave

Render a floating `PlayerCardPreview` component that:

• uses `position: fixed`
• follows the cursor
• updates when hovering different players

Do NOT attach global DOM listeners.

---

2️⃣ CUSTOM STATS MODAL (FULL SPA PARITY)

The stats modal currently only shows base stats:

PAC
SHO
PAS
DRI
DEF
PHY

But the SPA supported **30+ attribute stats**.

Restore the full stat selector list.

Stats must include:

Offense
Acceleration
Agility
Ball Control
Crossing
Curve
Dribbling
Finishing
Free Kick
Long Passing
Long Shot
Penalties
Short Passing
Shot Power
Sprint Speed
Vision
Volley

Defense
Aggression
Awareness
Heading
Marking
Positioning
Reactions
Sliding Tackle
Standing Tackle

Physical
Balance
Jumping
Stamina
Strength

Goalkeeper
GK Diving
GK Handling
GK Kicking
GK Positioning
GK Reflexes

Other
Date Added
Overall
Skill Moves
Weak Foot
Height
Weight
Total Stats

Modal behavior must support:

• selecting multiple stats
• select all
• stat search
• selected counter

When clicking **Apply**:

• selected stats become new columns in the players table
• columns render inside `.player-row-stats`
• values are taken from player attribute data

Example access:

player.attributes[statName]

Columns must update using React state so table rerenders.

---

Important:

Do not break existing functionality:

• sorting
• filtering
• pagination
• load more

Goal: restore full SPA behavior using React/Next.js architecture.
