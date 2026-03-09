Implement the player customization modal that appears when clicking a player card on the squad field.

Currently the old SPA version had this feature implemented using vanilla JavaScript.  
Do NOT reuse or copy the old SPA logic.  
Instead, rebuild the functionality using proper React / Next.js component architecture.

IMPORTANT RULES

1. Do NOT import or reuse any old vanilla JS SPA code.
2. Implement everything using React state and Next.js client components.
3. Preserve the existing CSS classes and DOM structure so the UI appearance remains identical.
4. Do NOT modify squad builder logic such as:
   - formation coordinates
   - drag/drop
   - squad state
   - save/load/export
   - OVR calculations
5. Only rebuild the modal interaction system.

------------------------------------------------

GOAL

When the user clicks a player card in the squad-field, open a modal:

modal-content
squad-customization-content
squad-player-customization-modal

This modal should behave exactly like the old SPA version.

------------------------------------------------

TRIGGER

Add an onClick handler to player cards rendered inside squad-field.

Example behavior:

click player card → open customization modal with that player's data.

------------------------------------------------

REACT IMPLEMENTATION

Create a React state in the squad builder component:

selectedPlayerForCustomization

Example:

const [selectedPlayerForCustomization, setSelectedPlayerForCustomization] = useState(null)

Clicking a player card should set this state.

------------------------------------------------

MODAL RENDERING

Render the modal conditionally when selectedPlayerForCustomization is not null.

Example structure:

<div class="squad-player-customization-modal">
  <div class="modal-content">
    <div class="squad-customization-content">

      Player card preview

      Tabs or sections:
      - Rank
      - Training
      - Skills
      - Stats

    </div>
  </div>
</div>

Use the same CSS class names so existing styling still applies.

------------------------------------------------

MODAL FEATURES

The modal must allow:

Rank selection
Training level selection
Skill boost selection
Player stats display
Player card preview

Changes should update the player object stored in squad state.

------------------------------------------------

STATE FLOW

Player card click → setSelectedPlayerForCustomization(player)

Modal reads data from selectedPlayerForCustomization

When user updates rank/training/skills → update squad state

Closing modal → setSelectedPlayerForCustomization(null)

------------------------------------------------

CLOSING MODAL

Modal should close when:

• clicking close button  
• clicking overlay background  
• pressing ESC key  

------------------------------------------------

ACCESSIBILITY

Ensure modal traps focus while open.

Add aria attributes if needed.

------------------------------------------------

ARCHITECTURE

Create a reusable component:

SquadPlayerCustomizationModal.jsx

Props:

player
onClose
onUpdatePlayer

Use React props instead of global variables.

------------------------------------------------

RESULT

Clicking a player on the squad field should open a fully functional player customization modal identical to the old SPA version, but implemented using React / Next.js components instead of vanilla JS.
Any changes to rank or training must update the squad player state so OVR recalculates correctly using the existing squad builder logic.npm run start