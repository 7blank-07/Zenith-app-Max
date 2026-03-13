'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { normalizeSearchText } from './search-normalization';

const SquadPlayerCustomizationModal = dynamic(() => import('./SquadPlayerCustomizationModal'), {
  loading: () => null
});
const ComparePlayersTool = dynamic(() => import('./ComparePlayersTool.client'), {
  loading: () => null
});

const TOOL_ALIASES = Object.freeze({
  squadbuilder: 'squadbuilder',
  'squad-builder': 'squadbuilder',
  compare: 'compare'
});
const SQUAD_SAVE_KEY = 'savedSquad_main';
const SQUAD_BUILDER_PENDING_PICK_KEY = 'squad_builder_pending_pick';
const SQUAD_BUILDER_ROUNDTRIP_STATE_KEY = 'squad_builder_roundtrip_state';
const TOOLS_SUPPLEMENTAL_PLAYERS_KEY = 'toolsSupplementalPlayers';
const DEFAULT_SQUAD_FILTERS = Object.freeze({
  position: '',
  league: '',
  club: '',
  nation: '',
  skill: '',
  ratingMin: 40,
  ratingMax: 150,
  auctionable: false
});

const SQUAD_FORMATIONS = Object.freeze({
  '3-4-1-2': [
      { id: 'GK', label: 'GK', x: 55, y: 83 },
      { id: 'LCB', label: 'CB', x: 28, y: 65 },
      { id: 'CB', label: 'CB', x: 55, y: 65 },
      { id: 'RCB', label: 'CB', x: 82, y: 65 },
      { id: 'LM', label: 'LM', x: 20, y: 36 },
      { id: 'LCM', label: 'CM', x: 40, y: 46 },
      { id: 'RCM', label: 'CM', x: 70, y: 46 },
      { id: 'RM', label: 'RM', x: 90, y: 36 },
      { id: 'CAM', label: 'CAM', x: 55, y: 31 },
      { id: 'LS', label: 'ST', x: 43, y: 16 },
      { id: 'RS', label: 'ST', x: 67, y: 16 }
  ],
  '3-4-2-1': [
      { id: 'GK', label: 'GK', x: 53, y: 86 },
      { id: 'LCB', label: 'LCB', x: 31, y: 69 },
      { id: 'CB', label: 'CB', x: 53, y: 61 },
      { id: 'RCB', label: 'RCB', x: 72, y: 69 },
      { id: 'LM', label: 'LM', x: 19, y: 39 },
      { id: 'LCM', label: 'LCM', x: 36, y: 49 },
      { id: 'RCM', label: 'RCM', x: 68, y: 49 },
      { id: 'RM', label: 'RM', x: 85, y: 39 },
      { id: 'LAM', label: 'CAM', x: 36, y: 26 },
      { id: 'RAM', label: 'CAM', x: 68, y: 26 },
      { id: 'ST', label: 'ST', x: 53, y: 14 }
  ],
  '3-4-3-DIAMOND': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LCB', label: 'LCB', x: 30, y: 66 },
      { id: 'CB', label: 'CB', x: 53, y: 66 },
      { id: 'RCB', label: 'RCB', x: 77, y: 66 },
      { id: 'LM', label: 'LM', x: 25, y: 40 },
      { id: 'CDM', label: 'CDM', x: 43, y: 47 },
      { id: 'CAM', label: 'CAM', x: 63, y: 42 },
      { id: 'RM', label: 'RM', x: 83, y: 40 },
      { id: 'LW', label: 'LW', x: 35, y: 22 },
      { id: 'ST', label: 'ST', x: 53, y: 17 },
      { id: 'RW', label: 'RW', x: 72, y: 22 }
  ],
  '3-4-3-FLAT': [
      { id: 'GK', label: 'GK', x: 53, y: 84 },
      { id: 'LCB', label: 'LCB', x: 29, y: 67 },
      { id: 'CB', label: 'CB', x: 53, y: 67 },
      { id: 'RCB', label: 'RCB', x: 76, y: 67 },
      { id: 'LM', label: 'LM', x: 20, y: 43 },
      { id: 'LCM', label: 'CM', x: 42, y: 43 },
      { id: 'RCM', label: 'CM', x: 64, y: 43 },
      { id: 'RM', label: 'RM', x: 86, y: 43 },
      { id: 'LW', label: 'LW', x: 32, y: 16 },
      { id: 'ST', label: 'ST', x: 53, y: 15 },
      { id: 'RW', label: 'RW', x: 74, y: 16 }
  ],
  '3-5-1-1': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LCB', label: 'LCB', x: 25, y: 61 },
      { id: 'CB', label: 'CB', x: 53, y: 61 },
      { id: 'RCB', label: 'RCB', x: 78, y: 61 },
      { id: 'LM', label: 'LM', x: 21, y: 32 },
      { id: 'LDM', label: 'CDM', x: 43, y: 47 },
      { id: 'CM', label: 'CM', x: 53, y: 33 },
      { id: 'RDM', label: 'CDM', x: 65, y: 47 },
      { id: 'RM', label: 'RM', x: 85, y: 32 },
      { id: 'LST', label: 'ST', x: 42, y: 17 },
      { id: 'RST', label: 'ST', x: 66, y: 17 }
  ],
  '3-5-2': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LCB', label: 'LCB', x: 27, y: 63 },
      { id: 'CB', label: 'CB', x: 53, y: 63 },
      { id: 'RCB', label: 'RCB', x: 78, y: 63 },
      { id: 'LM', label: 'LM', x: 20, y: 39 },
      { id: 'LDM', label: 'CDM', x: 41, y: 47 },
      { id: 'CAM', label: 'CAM', x: 53, y: 33 },
      { id: 'RDM', label: 'CDM', x: 64, y: 47 },
      { id: 'RM', label: 'RM', x: 85, y: 39 },
      { id: 'LS', label: 'ST', x: 41, y: 16 },
      { id: 'RS', label: 'ST', x: 67, y: 16 }
  ],
  '4-1-2-1-2-NARROW': [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 66 },
      { id: 'LCB', label: 'CB', x: 38, y: 70 },
      { id: 'RCB', label: 'CB', x: 69, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 66 },
      { id: 'CDM', label: 'CDM', x: 54, y: 54 },
      { id: 'LCM', label: 'CM', x: 37, y: 42 },
      { id: 'RCM', label: 'CM', x: 72, y: 42 },
      { id: 'CAM', label: 'CAM', x: 54, y: 28 },
      { id: 'LS', label: 'ST', x: 43, y: 12 },
      { id: 'RS', label: 'ST', x: 66, y: 12 }
  ],
  '4-1-2-1-2-WIDE': [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LB', label: 'LB', x: 17, y: 69 },
      { id: 'LCB', label: 'CB', x: 38, y: 70 },
      { id: 'RCB', label: 'CB', x: 72, y: 70 },
      { id: 'RB', label: 'RB', x: 90, y: 69 },
      { id: 'CDM', label: 'CDM', x: 54, y: 54 },
      { id: 'LM', label: 'LM', x: 25, y: 39 },
      { id: 'RM', label: 'RM', x: 78, y: 39 },
      { id: 'CAM', label: 'CAM', x: 54, y: 28 },
      { id: 'LS', label: 'ST', x: 42, y: 17 },
      { id: 'RS', label: 'ST', x: 66, y: 17 }
  ],
  '4-1-3-2': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 66 },
      { id: 'LCB', label: 'CB', x: 37, y: 68 },
      { id: 'RCB', label: 'CB', x: 73, y: 68 },
      { id: 'RB', label: 'RB', x: 91, y: 66 },
      { id: 'CDM', label: 'CDM', x: 53, y: 54 },
      { id: 'LM', label: 'LM', x: 24, y: 34 },
      { id: 'CM', label: 'CM', x: 53, y: 34 },
      { id: 'RM', label: 'RM', x: 80, y: 34 },
      { id: 'LS', label: 'ST', x: 42, y: 17 },
      { id: 'RS', label: 'ST', x: 66, y: 17 }
  ],
  '4-1-4-1': [
      { id: 'GK', label: 'GK', x: 52, y: 83 },
      { id: 'LB', label: 'LB', x: 19, y: 68 },
      { id: 'LCB', label: 'CB', x: 38, y: 68 },
      { id: 'RCB', label: 'CB', x: 66, y: 68 },
      { id: 'RB', label: 'RB', x: 85, y: 68 },
      { id: 'CDM', label: 'CDM', x: 52, y: 53 },
      { id: 'LM', label: 'LM', x: 22, y: 37 },
      { id: 'LCM', label: 'CM', x: 42, y: 37 },
      { id: 'RCM', label: 'CM', x: 62, y: 37 },
      { id: 'RM', label: 'RM', x: 82, y: 37 },
      { id: 'ST', label: 'ST', x: 52, y: 18 }
  ],
  '4-2-1-3': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 66 },
      { id: 'LCB', label: 'CB', x: 36, y: 68 },
      { id: 'RCB', label: 'CB', x: 70, y: 68 },
      { id: 'RB', label: 'RB', x: 88, y: 66 },
      { id: 'LDM', label: 'CDM', x: 37, y: 47 },
      { id: 'RDM', label: 'CDM', x: 68, y: 47 },
      { id: 'CAM', label: 'CAM', x: 53, y: 37 },
      { id: 'LW', label: 'LW', x: 32, y: 19 },
      { id: 'ST', label: 'ST', x: 53, y: 17 },
      { id: 'RW', label: 'RW', x: 73, y: 19 }
  ],
  '4-2-1-3-WIDE': [
      { id: 'GK', label: 'GK', x: 54, y: 86 },
      { id: 'LB', label: 'LB', x: 17, y: 66 },
      { id: 'LCB', label: 'CB', x: 40, y: 70 },
      { id: 'RCB', label: 'CB', x: 68, y: 70 },
      { id: 'RB', label: 'RB', x: 87, y: 66 },
      { id: 'LDM', label: 'CDM', x: 44, y: 54 },
      { id: 'RDM', label: 'CDM', x: 64, y: 54 },
      { id: 'CAM', label: 'CAM', x: 54, y: 34 },
      { id: 'LW', label: 'LW', x: 27, y: 22 },
      { id: 'ST', label: 'ST', x: 54, y: 15 },
      { id: 'RW', label: 'RW', x: 80, y: 22 }
  ],
  '4-2-2-2': [
      { id: 'GK', label: 'GK', x: 52, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 70 },
      { id: 'LCB', label: 'CB', x: 38, y: 70 },
      { id: 'RCB', label: 'CB', x: 71, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 70 },
      { id: 'LDM', label: 'CDM', x: 46, y: 50 },
      { id: 'RDM', label: 'CDM', x: 64, y: 50 },
      { id: 'LAM', label: 'CAM', x: 33, y: 33 },
      { id: 'RAM', label: 'CAM', x: 76, y: 33 },
      { id: 'LS', label: 'ST', x: 44, y: 17 },
      { id: 'RS', label: 'ST', x: 64, y: 17 }
  ],
  '4-2-3-1-NARROW': [
      { id: 'GK', label: 'GK', x: 52, y: 82 },
      { id: 'LB', label: 'LB', x: 18, y: 64 },
      { id: 'LCB', label: 'CB', x: 38, y: 68 },
      { id: 'RCB', label: 'CB', x: 66, y: 68 },
      { id: 'RB', label: 'RB', x: 85, y: 64 },
      { id: 'LDM', label: 'CDM', x: 30, y: 46 },
      { id: 'RDM', label: 'CDM', x: 73, y: 46 },
      { id: 'LAM', label: 'CAM', x: 38, y: 29 },
      { id: 'CAM', label: 'CAM', x: 52, y: 39 },
      { id: 'RAM', label: 'CAM', x: 66, y: 29 },
      { id: 'ST', label: 'ST', x: 52, y: 12 }
  ],
  '3-1-4-2': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LCB', label: 'CB', x: 35, y: 68 },
      { id: 'CB', label: 'CB', x: 53, y: 58 },
      { id: 'RCB', label: 'CB', x: 72, y: 68 },
      { id: 'CDM', label: 'CDM', x: 53, y: 37 },
      { id: 'LCM', label: 'CM', x:37, y: 37 },
      { id: 'RCM', label: 'CM', x: 70, y: 37 },
      { id: 'LM', label: 'LM', x: 22, y: 40 },
      { id: 'RM', label: 'RM', x: 86, y: 40 },
      { id: 'LST', label: 'ST', x: 43, y: 17 },
      { id: 'RST', label: 'ST', x: 66, y: 17 }
  ],
  '4-2-3-1-WIDE': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 17, y: 68 },
      { id: 'LCB', label: 'CB', x: 36, y: 70 },
      { id: 'RCB', label: 'CB', x: 68, y: 70 },
      { id: 'RB', label: 'RB', x: 85, y: 68 },
      { id: 'LDM', label: 'CDM', x: 38, y: 46 },
      { id: 'RDM', label: 'CDM', x: 65, y: 46 },
      { id: 'LM', label: 'LM', x: 22, y: 37 },
      { id: 'CAM', label: 'CAM', x: 53, y: 33 },
      { id: 'RM', label: 'RM', x: 80, y: 37 },
      { id: 'ST', label: 'ST', x: 53, y: 16 }
  ],
  '4-2-4': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 17, y: 65 },
      { id: 'LCB', label: 'CB', x: 35, y: 67 },
      { id: 'RCB', label: 'CB', x: 72, y: 67 },
      { id: 'RB', label: 'RB', x: 90, y: 65 },
      { id: 'LDM', label: 'CDM', x: 40, y: 42 },
      { id: 'RDM', label: 'CDM', x: 68, y: 42 },
      { id: 'LW', label: 'LW', x: 28, y: 24 },
      { id: 'LS', label: 'ST', x: 44, y: 17 },
      { id: 'RS', label: 'ST', x: 65, y: 17 },
      { id: 'RW', label: 'RW', x: 80, y: 24 }
  ],
  '4-3-1-2': [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 68 },
      { id: 'LCB', label: 'CB', x: 37, y: 70 },
      { id: 'RCB', label: 'CB', x: 70, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 68 },
      { id: 'LCM', label: 'CM', x: 33, y: 42 },
      { id: 'CM', label: 'CM', x: 54, y: 51 },
      { id: 'RCM', label: 'CM', x: 76, y: 42 },
      { id: 'CAM', label: 'CAM', x: 54, y: 31 },
      { id: 'LS', label: 'ST', x: 42, y: 16 },
      { id: 'RS', label: 'ST', x: 66, y: 16 }
  ],
  '4-3-2-1': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 19, y: 66 },
      { id: 'LCB', label: 'CB', x: 39, y: 68 },
      { id: 'RCB', label: 'CB', x: 67, y: 68 },
      { id: 'RB', label: 'RB', x: 88, y: 66 },
      { id: 'LCM', label: 'CM', x: 32, y: 48 },
      { id: 'CM', label: 'CM', x: 53, y: 48 },
      { id: 'RCM', label: 'CM', x: 77, y: 48 },
      { id: 'LAM', label: 'CAM', x: 38, y: 26 },
      { id: 'RAM', label: 'CAM', x: 68, y: 26 },
      { id: 'ST', label: 'ST', x: 53, y: 16 }
  ],
  '4-3-3': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 68 },
      { id: 'LCB', label: 'CB', x: 36, y: 70 },
      { id: 'RCB', label: 'CB', x: 66, y: 70 },
      { id: 'RB', label: 'RB', x: 85, y: 68 },
      { id: 'LCM', label: 'CM', x: 34, y: 49 },
      { id: 'CM', label: 'CM', x: 53, y: 44 },
      { id: 'RCM', label: 'CM', x: 73, y: 49 },
      { id: 'LW', label: 'LW', x: 34, y: 21 },
      { id: 'ST', label: 'ST', x: 53, y: 18 },
      { id: 'RW', label: 'RW', x: 71, y: 21 }
  ],
  '4-3-3-ATTACK': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 66 },
      { id: 'LCB', label: 'CB', x: 36, y: 68 },
      { id: 'RCB', label: 'CB', x: 68, y: 68 },
      { id: 'RB', label: 'RB', x: 87, y: 66 },
      { id: 'LCM', label: 'CM', x: 32, y: 43 },
      { id: 'CAM', label: 'CAM', x: 53, y: 40 },
      { id: 'RCM', label: 'CM', x: 76, y: 43 },
      { id: 'LW', label: 'LW', x: 32, y: 19 },
      { id: 'ST', label: 'ST', x: 53, y: 17 },
      { id: 'RW', label: 'RW', x: 76, y: 19 }
  ],
  '4-3-3-DEFEND': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 17, y: 67 },
      { id: 'LCB', label: 'CB', x: 37, y: 68 },
      { id: 'RCB', label: 'CB', x: 67, y: 68 },
      { id: 'RB', label: 'RB', x: 87, y: 67 },
      { id: 'LDM', label: 'CDM', x: 29, y: 46 },
      { id: 'CM', label: 'CM', x: 53, y: 44 },
      { id: 'RDM', label: 'CDM', x: 78, y: 46 },
      { id: 'LW', label: 'LW', x: 31, y: 23 },
      { id: 'ST', label: 'ST', x: 53, y: 17 },
      { id: 'RW', label: 'RW', x: 76, y: 23 }
  ],
  '4-3-3-FALSE9': [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LB', label: 'LB', x: 19, y: 66 },
      { id: 'LCB', label: 'CB', x: 38, y: 70 },
      { id: 'RCB', label: 'CB', x: 69, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 66 },
      { id: 'LCM', label: 'CM', x: 35, y: 44 },
      { id: 'CM', label: 'CM', x: 54, y: 49 },
      { id: 'RCM', label: 'CM', x: 75, y: 44 },
      { id: 'LW', label: 'LW', x: 37, y: 19 },
      { id: 'CF', label: 'CF', x: 54, y: 24 },
      { id: 'RW', label: 'RW', x: 72, y: 19 }
  ],
  '4-3-3-HOLDING': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 68 },
      { id: 'LCB', label: 'CB', x: 36, y: 70 },
      { id: 'RCB', label: 'CB', x: 67, y: 70 },
      { id: 'RB', label: 'RB', x: 85, y: 68 },
      { id: 'CDM', label: 'CDM', x: 53, y: 47 },
      { id: 'LCM', label: 'CM', x: 33, y: 44 },
      { id: 'RCM', label: 'CM', x: 72, y: 44 },
      { id: 'LW', label: 'LW', x: 36, y: 19 },
      { id: 'ST', label: 'ST', x: 53, y: 17 },
      { id: 'RW', label: 'RW', x: 69, y: 19 }
  ],
  '4-4-1-1': [
      { id: 'GK', label: 'GK', x: 53, y: 86 },
      { id: 'LB', label: 'LB', x: 18, y: 66 },
      { id: 'LCB', label: 'CB', x: 39, y: 70 },
      { id: 'RCB', label: 'CB', x: 67, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 66 },
      { id: 'LM', label: 'LM', x: 25, y: 44 },
      { id: 'LCM', label: 'CM', x: 43, y: 46 },
      { id: 'RCM', label: 'CM', x: 63, y: 46 },
      { id: 'RM', label: 'RM', x: 81, y: 44 },
      { id: 'CAM', label: 'CAM', x: 53, y: 28 },
      { id: 'ST', label: 'ST', x: 53, y: 13 }
  ],
  '4-4-1-1-ATTACK': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 66 },
      { id: 'LCB', label: 'CB', x: 36, y: 68 },
      { id: 'RCB', label: 'CB', x: 71, y: 68 },
      { id: 'RB', label: 'RB', x: 89, y: 66 },
      { id: 'LM', label: 'LM', x: 20, y: 42 },
      { id: 'LCM', label: 'CM', x: 38, y: 41 },
      { id: 'RCM', label: 'CM', x: 69, y: 41 },
      { id: 'RM', label: 'RM', x: 87, y: 42 },
      { id: 'CAM', label: 'CAM', x: 53, y: 34 },
      { id: 'ST', label: 'ST', x: 53, y: 16 }
  ],
  '4-4-2-FLAT': [
      { id: 'GK', label: 'GK', x: 55, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 64 },
      { id: 'LCB', label: 'CB', x: 41, y: 66 },
      { id: 'RCB', label: 'CB', x: 66, y: 66 },
      { id: 'RB', label: 'RB', x: 90, y: 64 },
      { id: 'LM', label: 'LM', x: 15, y: 40 },
      { id: 'LCM', label: 'CM', x: 41, y: 42 },
      { id: 'RCM', label: 'CM', x: 66, y: 42 },
      { id: 'RM', label: 'RM', x: 90, y: 40 },
      { id: 'LS', label: 'ST', x: 40, y: 16 },
      { id: 'RS', label: 'ST', x: 67, y: 16 }
  ],
  '4-4-2-HOLDING': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 19, y: 65 },
      { id: 'LCB', label: 'CB', x: 43, y: 67 },
      { id: 'RCB', label: 'CB', x: 64, y: 67 },
      { id: 'RB', label: 'RB', x: 85, y: 65 },
      { id: 'LM', label: 'LM', x: 22, y: 38 },
      { id: 'LDM', label: 'CDM', x: 43, y: 43 },
      { id: 'RDM', label: 'CDM', x: 64, y: 43 },
      { id: 'RM', label: 'RM', x: 82, y: 38 },
      { id: 'LS', label: 'ST', x: 43, y: 16 },
      { id: 'RS', label: 'ST', x: 64, y: 16 }
  ],
  '4-5-1': [
      { id: 'GK', label: 'GK', x: 52, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 66 },
      { id: 'LCB', label: 'CB', x: 36, y: 70 },
      { id: 'RCB', label: 'CB', x: 68, y: 70 },
      { id: 'RB', label: 'RB', x: 85, y: 66 },
      { id: 'LM', label: 'LM', x: 18, y: 42 },
      { id: 'LAM', label: 'CAM', x: 35, y: 33 },
      { id: 'CM', label: 'CM', x: 52, y: 46 },
      { id: 'RAM', label: 'CAM', x: 67, y: 33 },
      { id: 'RM', label: 'RM', x: 85, y: 42 },
      { id: 'ST', label: 'ST', x: 52, y: 14 }
  ],
  '4-5-1-FLAT': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 15, y: 68 },
      { id: 'LCB', label: 'CB', x: 34, y: 70 },
      { id: 'RCB', label: 'CB', x: 72, y: 70 },
      { id: 'RB', label: 'RB', x: 88, y: 68 },
      { id: 'LM', label: 'LM', x: 20, y: 42 },
      { id: 'LCM', label: 'CM', x: 37, y: 44 },
      { id: 'CM', label: 'CM', x: 53, y: 46 },
      { id: 'RCM', label: 'CM', x: 69, y: 44 },
      { id: 'RM', label: 'RM', x: 84, y: 42 },
      { id: 'ST', label: 'ST', x: 53, y: 17 }
  ],
  '5-2-1-2': [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LWB', label: 'LWB', x: 18, y: 61 },
      { id: 'LCB', label: 'CB', x: 37, y: 63},
      { id: 'CB', label: 'CB', x: 54, y: 63},
      { id: 'RCB', label: 'CB', x: 70, y: 63 },
      { id: 'RWB', label: 'RWB', x: 88, y: 61 },
      { id: 'LCM', label: 'CM', x: 34, y: 42 },
      { id: 'RCM', label: 'CM', x: 72, y: 42 },
      { id: 'CAM', label: 'CAM', x: 54, y: 30 },
      { id: 'LS', label: 'ST', x: 42, y: 16 },
      { id: 'RS', label: 'ST', x: 66, y: 16 }
  ],
  '5-2-2-1': [
      { id: 'GK', label: 'GK', x: 52, y: 83 },
      { id: 'LWB', label: 'LWB', x: 12, y: 56 },
      { id: 'LCB', label: 'CB', x: 33, y: 59 },
      { id: 'CB', label: 'CB', x: 52, y: 59 },
      { id: 'RCB', label: 'CB', x: 70, y: 59 },
      { id: 'RWB', label: 'RWB', x: 89, y: 56 },
      { id: 'LCM', label: 'CM', x: 42, y: 38 },
      { id: 'RCM', label: 'CM', x: 61, y: 38 },
      { id: 'LW', label: 'LW', x: 33, y: 20 },
      { id: 'RW', label: 'RW', x: 71, y: 20 },
      { id: 'ST', label: 'ST', x: 52, y: 16 }
  ],
  '5-3-2': [
      { id: 'GK', label: 'GK', x: 54, y: 83 },
      { id: 'LWB', label: 'LWB', x: 17, y: 61 },
      { id: 'LCB', label: 'CB', x: 36, y: 63 },
      { id: 'CB', label: 'CB', x: 54, y: 63 },
      { id: 'RCB', label: 'CB', x: 71, y: 63 },
      { id: 'RWB', label: 'RWB', x: 88, y: 61 },
      { id: 'LCM', label: 'CM', x: 29, y: 37 },
      { id: 'CM', label: 'CM', x: 54, y: 37 },
      { id: 'RCM', label: 'CM', x: 77, y: 37 },
      { id: 'LS', label: 'ST', x: 41, y: 17 },
      { id: 'RS', label: 'ST', x: 67, y: 17 }
  ],
  '5-4-1': [
      { id: 'GK', label: 'GK', x: 53, y: 86 },
      { id: 'LWB', label: 'LWB', x: 15, y: 57 },
      { id: 'LCB', label: 'CB', x: 33, y: 63 },
      { id: 'CB', label: 'CB', x: 53, y: 67 },
      { id: 'RCB', label: 'CB', x: 73, y: 63 },
      { id: 'RWB', label: 'RWB', x: 91, y: 57 },
      { id: 'LM', label: 'LM', x: 28, y: 36 },
      { id: 'LCM', label: 'CM', x: 45, y: 39 },
      { id: 'RCM', label: 'CM', x: 61, y: 39 },
      { id: 'RM', label: 'RM', x: 78, y: 35 },
      { id: 'ST', label: 'ST', x: 53, y: 14 }
  ],
  '5-4-1-HOLDING': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LWB', label: 'LWB', x: 14, y: 61 },
      { id: 'LCB', label: 'CB', x: 33, y: 64 },
      { id: 'CB', label: 'CB', x: 53, y: 64 },
      { id: 'RCB', label: 'CB', x: 72, y: 64 },
      { id: 'RWB', label: 'RWB', x: 89, y: 61 },
      { id: 'LM', label: 'LM', x: 29, y: 31 },
      { id: 'CDM', label: 'CDM', x: 44, y: 38 },
      { id: 'CAM', label: 'CAM', x: 66, y: 25 },
      { id: 'RM', label: 'RM', x: 78, y: 33 },
      { id: 'ST', label: 'ST', x: 53, y: 17  }
  ],
  '5-4-1-DEFEND': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 16, y: 67 },
      { id: 'LCB', label: 'CB', x: 33, y: 60 },
      { id: 'CB', label: 'CB', x: 53, y: 57 },
      { id: 'RCB', label: 'CB', x: 72, y: 60 },
      { id: 'RB', label: 'RB', x: 89, y: 67 },
      { id: 'LM', label: 'LM', x: 23, y: 36 },
      { id: 'LCM', label: 'CM', x: 41, y: 33 },
      { id: 'RCM', label: 'CM', x: 68, y: 33 },
      { id: 'RM', label: 'RM', x: 84, y: 36 },
      { id: 'ST', label: 'ST', x: 53, y: 17  }
  ],
  '4-4-1-1-FLAT': [
      { id: 'GK', label: 'GK', x: 53, y: 83 },
      { id: 'LB', label: 'LB', x: 18, y: 61 },
      { id: 'LCB', label: 'CB', x: 38, y: 64 },
      { id: 'RCB', label: 'CB', x: 69, y: 64 },
      { id: 'RB', label: 'RB', x: 88, y: 64 },
      { id: 'RCM', label: 'CM', x: 66, y: 41 },
      { id: 'LM', label: 'LM', x: 25, y: 34 },
      { id: 'LCM', label: 'CM', x: 40, y: 41 },
      { id: 'CF', label: 'CF', x: 53, y: 34 },
      { id: 'RM', label: 'RM', x: 82, y: 34 },
      { id: 'ST', label: 'ST', x: 53, y: 17  }
  ]
});

const FIELD_THEMES = Object.freeze({
  'stadium-blue': {
    id: 'stadium-blue',
    name: 'FC Stadium',
    background: 'url(/assets/images/background/squad_builder_1.webp) center/cover no-repeat',
    className: ''
  },
  'camp-nou': {
    id: 'camp-nou',
    name: 'Camp Nou',
    background: 'url(/assets/images/background/squad_builder_2.webp) center/cover no-repeat',
    className: ''
  },
  'old-trafford': {
    id: 'old-trafford',
    name: 'Old Trafford',
    background: 'url(/assets/images/background/squad_builder_3.webp) center/cover no-repeat',
    className: 'theme-old-trafford'
  },
  'santiago-bernabeu': {
    id: 'santiago-bernabeu',
    name: 'Santiago Bernabeu',
    background: 'url(/assets/images/background/squad_builder_4.webp) center/cover no-repeat',
    className: 'theme-santiago-bernabeu'
  },
  anfield: {
    id: 'anfield',
    name: 'Anfield',
    background: 'url(/assets/images/background/squad_builder_5.webp) center/cover no-repeat',
    className: 'theme-anfield'
  }
});

const POSITION_PENALTIES = Object.freeze({
  GK: Object.freeze({
    gk: 0,
    lb: -18,
    cb: -18,
    rb: -18,
    lwb: -18,
    rwb: -18,
    cdm: -18,
    cm: -18,
    cam: -18,
    lm: -18,
    rm: -18,
    lw: -18,
    rw: -18,
    cf: -18,
    st: -18
  }),
  ST: Object.freeze({
    st: 0,
    rw: -6,
    lw: -6,
    cf: 0,
    cm: -18,
    rm: -18,
    lm: -18,
    cdm: -18,
    cb: -18,
    lb: -18,
    rb: -18,
    lwb: -18,
    rwb: -18,
    cam: -9,
    gk: -18
  }),
  LW: Object.freeze({
    lw: 0,
    st: -6,
    cf: -6,
    lwb: -6,
    rw: -4,
    lm: -4,
    rm: -18,
    cm: -18,
    cdm: -18,
    cb: -18,
    rb: -18,
    rwb: -18,
    cam: -18,
    lb: -9,
    gk: -18
  }),
  RW: Object.freeze({
    rw: 0,
    lw: -4,
    rm: -4,
    st: -6,
    cf: -6,
    rwb: -6,
    lm: -18,
    cm: -18,
    cdm: -18,
    lb: -18,
    cb: -18,
    lwb: -18,
    cam: -18,
    rb: -9,
    gk: -18
  }),
  CAM: Object.freeze({
    cam: 0,
    cf: 0,
    cm: -4,
    lm: -6,
    rm: -6,
    st: -9,
    cdm: -9,
    lw: -18,
    rw: -18,
    lb: -18,
    cb: -18,
    rb: -18,
    lwb: -18,
    rwb: -18,
    gk: -18
  }),
  CM: Object.freeze({
    cm: 0,
    cdm: -4,
    cam: -4,
    lm: -4,
    rm: -4,
    cf: -9,
    lb: -9,
    cb: -9,
    rb: -9,
    lwb: -9,
    rwb: -9,
    lw: -18,
    st: -18,
    rw: -18,
    gk: -18
  }),
  CDM: Object.freeze({
    cdm: 0,
    cm: -4,
    cb: -4,
    lm: -6,
    rm: -6,
    lb: -6,
    rb: -6,
    lwb: -6,
    rwb: -6,
    cam: -9,
    lw: -18,
    st: -18,
    rw: -18,
    cf: -18,
    gk: -18
  }),
  LM: Object.freeze({
    lm: 0,
    rm: -4,
    lw: -4,
    lwb: -4,
    cdm: -6,
    lb: -6,
    cam: -6,
    cm: -6,
    cb: -9,
    rb: -9,
    rwb: -9,
    st: -18,
    rw: -18,
    cf: -18,
    gk: -18
  }),
  RM: Object.freeze({
    rm: 0,
    rw: -4,
    rwb: -4,
    cam: -5,
    cm: -5,
    cdm: -5,
    rb: -5,
    lb: -7,
    cb: -7,
    lwb: -8,
    cf: -8,
    st: -17,
    lw: -18,
    lm: -17,
    gk: -18
  }),
  LB: Object.freeze({
    lb: 0,
    lwb: 0,
    cb: -4,
    rb: -4,
    rwb: -4,
    cdm: -6,
    lm: -6,
    lw: -9,
    cm: -9,
    cam: -9,
    rm: -9,
    st: -18,
    rw: -18,
    cf: -18,
    gk: -18
  }),
  CB: Object.freeze({
    cb: 0,
    lb: -4,
    rb: -4,
    cdm: -4,
    cm: -9,
    lm: -9,
    rm: -9,
    lwb: -9,
    rwb: -9,
    lw: -18,
    st: -18,
    rw: -18,
    cam: -18,
    cf: -18,
    gk: -18
  }),
  RB: Object.freeze({
    rb: 0,
    rwb: 0,
    lb: -4,
    cb: -4,
    lwb: -4,
    cdm: -6,
    rm: -6,
    rw: -9,
    cm: -9,
    lm: -9,
    lw: -18,
    st: -18,
    cf: -18,
    cam: -18,
    gk: -18
  }),
  LWB: Object.freeze({
    lwb: 0,
    lb: 0,
    rb: -3,
    rwb: -3,
    lm: -3,
    lw: -5,
    cdm: -5,
    cm: -7,
    cb: -7,
    rm: -7,
    st: -15,
    cf: -15,
    cam: -15,
    rw: -15,
    gk: -18
  }),
  RWB: Object.freeze({
    rwb: 0,
    rb: 0,
    lb: -3,
    lwb: -3,
    rm: -5,
    cdm: -5,
    rw: -5,
    lm: -7,
    cm: -7,
    cb: -7,
    lw: -15,
    st: -15,
    cf: -15,
    cam: -15,
    gk: -18
  }),
  CF: Object.freeze({
    cf: 0,
    cam: -4,
    st: -4,
    cm: -4,
    lm: -4,
    rm: -4,
    lw: -6,
    rw: -6,
    cdm: -15,
    lb: -15,
    cb: -15,
    rb: -15,
    lwb: -15,
    rwb: -15,
    gk: -18
  })
});

const RANK_SPRITES = Object.freeze({
  1: '/assets/images/ranks/green_rank_enhanced_main.webp',
  2: '/assets/images/ranks/blue_rank_enhanced_main.webp',
  3: '/assets/images/ranks/purple_rank_enhanced_main.webp',
  4: '/assets/images/ranks/red_rank_enhanced_main.webp',
  5: '/assets/images/ranks/gold_rank_enhanced_main.webp'
});

function normalizeTool(value) {
  const normalized = String(value || '').toLowerCase().trim();
  return TOOL_ALIASES[normalized] || 'none';
}

function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parsePriceValue(value) {
  if (value === undefined || value === null || value === '') return 0;
  if (typeof value === 'number') {
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0;
  }
  const normalized = String(value)
    .trim()
    .replace(/,/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();
  if (!normalized) return 0;

  const compactMatch = normalized.match(/^(-?\d+(?:\.\d+)?)([KMB])$/);
  if (compactMatch) {
    const amount = Number(compactMatch[1]);
    const suffix = compactMatch[2];
    if (!Number.isFinite(amount)) return 0;
    const multiplier = suffix === 'B' ? 1000000000 : suffix === 'M' ? 1000000 : 1000;
    const compactPrice = amount * multiplier;
    return compactPrice > 0 ? Math.round(compactPrice) : 0;
  }

  const numeric = Number(normalized.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numeric) && numeric > 0 ? Math.round(numeric) : 0;
}

function resolvePlayerPrice(player) {
  const candidates = [
    player?.price,
    player?.latestPrice,
    player?.latest_price,
    player?.marketPrice,
    player?.market_price,
    player?.currentPrice,
    player?.current_price,
    player?.buyNowPrice,
    player?.buy_now_price
  ];
  for (const candidate of candidates) {
    const parsed = parsePriceValue(candidate);
    if (parsed > 0) return parsed;
  }
  return 0;
}

function normalizeBenchIndex(value) {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (!Number.isInteger(parsed) || parsed < 0 || parsed >= 7) return -1;
  return parsed;
}

function getSquadPriceCacheKey(playerId) {
  const normalizedPlayerId = String(playerId || '').trim();
  if (!normalizedPlayerId) return '';
  return normalizedPlayerId;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSelectedSkills(value) {
  if (!Array.isArray(value)) return [];
  const seen = new Set();
  return value
    .map((entry) => String(entry || '').trim())
    .filter((entry) => {
      if (!entry) return false;
      if (seen.has(entry)) return false;
      seen.add(entry);
      return true;
    });
}

function normalizeSkillAllocations(value) {
  if (!value || typeof value !== 'object') return {};
  const normalized = {};
  Object.entries(value).forEach(([skillId, level]) => {
    const normalizedSkillId = String(skillId || '').trim();
    const normalizedLevel = Math.max(0, toNumber(level, 0));
    if (!normalizedSkillId || normalizedLevel <= 0) return;
    normalized[normalizedSkillId] = normalizedLevel;
  });
  return normalized;
}

function toText(value) {
  return normalizeSearchText(value);
}

function getPlayerId(player) {
  return String(player?.playerId || player?.player_id || player?.playerid || player?.id || '').trim();
}

function getPlayerType(player) {
  return player?.leagueImage ? 'normal' : 'hero';
}

function formatCoins(value) {
  const safe = parsePriceValue(value);
  if (!safe) return '0';
  if (safe >= 1000000000) return `${(safe / 1000000000).toFixed(2)}B`;
  if (safe >= 1000000) return `${(safe / 1000000).toFixed(1)}M`;
  if (safe >= 1000) return `${(safe / 1000).toFixed(0)}K`;
  return String(Math.round(safe));
}

function normalizePlayer(player, index) {
  const playerId = getPlayerId(player);
  const rank = clamp(
    toNumber(player?.rank ?? player?.selectedRank ?? player?.rank_level ?? player?.rankLevel, 0),
    0,
    5
  );
  const trainingLevel = clamp(toNumber(player?.trainingLevel ?? player?.training_level, 0), 0, 30);
  const ovr = toNumber(player?.ovr, 0);
  const baseOvr = Math.max(0, toNumber(player?.baseOvr ?? player?.base_ovr, ovr));
  const trainingBonus = Math.max(0, toNumber(player?.trainingBonus ?? player?.training_bonus, Math.floor(trainingLevel / 5)));
  const selectedSkills = normalizeSelectedSkills(player?.selectedSkills ?? player?.selected_skills);
  const skillAllocations = normalizeSkillAllocations(player?.skillAllocations ?? player?.skill_allocations);
  const alternatePositionRaw = player?.alternatePosition ?? player?.alternate_position ?? player?.alternateposition ?? '';
  return {
    playerId: playerId || `player-${index}`,
    name: String(player?.name || 'Unknown'),
    ovr,
    baseOvr,
    boostedOvr: Math.max(0, toNumber(player?.boostedOvr ?? player?.boosted_ovr, ovr)),
    rank,
    trainingLevel,
    trainingBonus,
    selectedSkills,
    skillAllocations,
    position: String(player?.position || ''),
    alternatePosition: String(alternatePositionRaw),
    nation: String(player?.nation || ''),
    club: String(player?.club || ''),
    league: String(player?.league || ''),
    cardBackground: String(player?.cardBackground || ''),
    playerImage: String(player?.playerImage || ''),
    nationFlag: String(player?.nationFlag || ''),
    clubFlag: String(player?.clubFlag || ''),
    leagueImage: String(player?.leagueImage || ''),
    colorRating: String(player?.colorRating || '#FFB86B'),
    colorPosition: String(player?.colorPosition || '#FFFFFF'),
    colorName: String(player?.colorName || '#FFFFFF'),
    skillMoves: toNumber(
      player?.skillMoves ??
      player?.skill_moves ??
      player?.skillmoves ??
      player?.attributes?.skillMoves ??
      player?.attributes?.skill_moves ??
      player?.attributes?.skillmoves,
      0
    ),
    price: resolvePlayerPrice(player),
    isUntradable: !!player?.isUntradable,
    attributes: player?.attributes && typeof player.attributes === 'object' ? player.attributes : {}
  };
}

function normalizeSupplementalPlayers(value) {
  if (!value || typeof value !== 'object') return {};
  const normalized = {};
  Object.values(value).forEach((player) => {
    const playerId = getPlayerId(player);
    if (!playerId) return;
    const normalizedPlayer = normalizePlayer({ ...player, playerId });
    if (normalizedPlayer?.playerId) {
      normalized[playerId] = normalizedPlayer;
    }
  });
  return normalized;
}

function normalizeBench(value) {
  if (!Array.isArray(value)) return Array.from({ length: 7 }, () => '');
  return value.slice(0, 7).concat(Array.from({ length: Math.max(0, 7 - value.length) }, () => ''));
}

function parseAlternatePositions(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || '').toUpperCase().trim()).filter(Boolean);
  }
  return String(value || '')
    .split(/[|,/]/)
    .map((entry) => entry.toUpperCase().trim())
    .filter(Boolean);
}

function matchesSelectedPosition(player, selectedPosition) {
  const normalizedSelected = String(selectedPosition || '').toUpperCase().trim();
  if (!normalizedSelected) return true;
  const playerPosition = String(player?.position || '').toUpperCase().trim();
  if (playerPosition === normalizedSelected) return true;
  const alternatePositions = parseAlternatePositions(
    player?.alternatePosition ?? player?.alternate_position ?? player?.alternateposition
  );
  return alternatePositions.includes(normalizedSelected);
}

function getPositionAdjustedOvr(player, slotLabel) {
  const baseOvr = toNumber(player?.ovr, 0);
  const playerPos = String(player?.position || '').toUpperCase().trim();
  const slotPosLabel = String(slotLabel || '').toUpperCase().trim();
  const slotPosKey = slotPosLabel.toLowerCase();
  if (!playerPos || !slotPosKey) return baseOvr;
  const alternatePositions = parseAlternatePositions(player?.alternatePosition);
  if (alternatePositions.includes(slotPosLabel)) return baseOvr;
  const penalty = POSITION_PENALTIES[playerPos]?.[slotPosKey] ?? -18;
  return Math.max(0, baseOvr + penalty);
}

function isGoalkeeperPosition(position) {
  return String(position || '').toUpperCase().trim() === 'GK';
}

function isGoalkeeperSlot(slot) {
  if (!slot) return false;
  const slotLabel = String(slot?.label || slot?.id || '').toUpperCase().trim();
  return slotLabel === 'GK';
}

function canAssignPlayerToSlot(player, slot) {
  if (!player || !slot) return false;
  const playerIsGoalkeeper = isGoalkeeperPosition(player.position);
  const slotIsGoalkeeper = isGoalkeeperSlot(slot);
  if (playerIsGoalkeeper && !slotIsGoalkeeper) return false;
  if (!playerIsGoalkeeper && slotIsGoalkeeper) return false;
  return true;
}

function resolvePendingPickTargetSlotId({ availableSlots, starters, preferredSlotId, preferredPosition, fallbackSlotId }) {
  if (!Array.isArray(availableSlots) || !availableSlots.length) return '';
  const startersBySlot = starters && typeof starters === 'object' ? starters : {};
  const normalizedPreferredSlotId = String(preferredSlotId || '').trim();
  const normalizedPreferredPosition = String(preferredPosition || '').toUpperCase().trim();
  const normalizedFallbackSlotId = String(fallbackSlotId || '').trim();
  const candidates = [];
  const seen = new Set();
  const pushCandidate = (slot) => {
    if (!slot?.id || seen.has(slot.id)) return;
    seen.add(slot.id);
    candidates.push(slot);
  };

  if (normalizedPreferredSlotId) {
    pushCandidate(availableSlots.find((slot) => slot.id === normalizedPreferredSlotId));
  }
  if (normalizedPreferredPosition) {
    availableSlots
      .filter((slot) => slot.id === normalizedPreferredPosition || String(slot.label || '').toUpperCase().trim() === normalizedPreferredPosition)
      .forEach(pushCandidate);
  }
  if (normalizedFallbackSlotId) {
    pushCandidate(availableSlots.find((slot) => slot.id === normalizedFallbackSlotId));
  }
  availableSlots.forEach(pushCandidate);

  const emptyCandidate = candidates.find((slot) => !startersBySlot[slot.id]);
  return emptyCandidate?.id || '';
}

function normalizeBadges(value) {
  return {
    badge1: !!value?.badge1,
    badge2: !!value?.badge2,
    badge3: !!value?.badge3
  };
}

export default function ToolsInteractions({ players = [], initialTool = '', filterOptions = null }) {
  const router = useRouter();
  const normalizedPlayers = useMemo(() => players.map(normalizePlayer), [players]);
  const [supplementalPlayers, setSupplementalPlayers] = useState({});
  const playersById = useMemo(() => {
    const map = new Map();
    normalizedPlayers.forEach((player) => {
      map.set(player.playerId, player);
    });
    Object.values(supplementalPlayers).forEach((player) => {
      if (player?.playerId) {
        map.set(player.playerId, player);
      }
    });
    return map;
  }, [normalizedPlayers, supplementalPlayers]);

  const [activeTool, setActiveTool] = useState(() => normalizeTool(initialTool));

  const [squadName, setSquadName] = useState('My Squad');
  const [formationId, setFormationId] = useState('4-3-3');
  const [selectedSlotId, setSelectedSlotId] = useState('ST');
  const [squadStateHydrated, setSquadStateHydrated] = useState(false);
  const [squadSearchQuery, setSquadSearchQuery] = useState('');
  const [squadFilterOpen, setSquadFilterOpen] = useState(false);
  const [squadFilters, setSquadFilters] = useState(() => ({ ...DEFAULT_SQUAD_FILTERS }));
  const [squadFilterDraft, setSquadFilterDraft] = useState(() => ({ ...DEFAULT_SQUAD_FILTERS }));
  const [squadFilterPanelPosition, setSquadFilterPanelPosition] = useState({ top: 100, left: 16 });
  const [fieldThemeId, setFieldThemeId] = useState('camp-nou');
  const [fieldThemeDraft, setFieldThemeDraft] = useState('camp-nou');
  const [themeSelectorOpen, setThemeSelectorOpen] = useState(false);
  const [badges, setBadges] = useState(() => normalizeBadges({}));
  const [badgesModalOpen, setBadgesModalOpen] = useState(false);
  const [starters, setStarters] = useState({});
  const [bench, setBench] = useState(Array.from({ length: 7 }, () => ''));
  const [squadLivePrices, setSquadLivePrices] = useState({});
  const [isSquadFullscreen, setIsSquadFullscreen] = useState(false);
  const [selectedPlayerForCustomization, setSelectedPlayerForCustomization] = useState(null);
  const dragPayloadRef = useRef(null);
  const dragPreviewNodeRef = useRef(null);
  const touchDragStateRef = useRef({
    active: false,
    moved: false,
    payload: null,
    startX: 0,
    startY: 0
  });
  const squadFilterTriggerRef = useRef(null);
  const squadBuilderContainerRef = useRef(null);
  const [draggingKey, setDraggingKey] = useState('');
  const [dragOverSlotId, setDragOverSlotId] = useState('');
  const [dragOverBenchIndex, setDragOverBenchIndex] = useState(-1);

  const formationSlots = SQUAD_FORMATIONS[formationId] || SQUAD_FORMATIONS['4-3-3'];

  useEffect(() => {
    const normalizedInitialTool = normalizeTool(initialTool);
    setActiveTool((currentTool) => (currentTool === normalizedInitialTool ? currentTool : normalizedInitialTool));
  }, [initialTool]);

  useEffect(() => {
    let restoredFromRoundtrip = false;
    let restoredThemeFromRoundtrip = false;
    let roundtripSupplementalPlayers = {};
    try {
      const rawRoundtripState = window.sessionStorage.getItem(SQUAD_BUILDER_ROUNDTRIP_STATE_KEY);
      if (rawRoundtripState) {
        const parsedRoundtrip = JSON.parse(rawRoundtripState);
        if (parsedRoundtrip?.squadName) setSquadName(String(parsedRoundtrip.squadName));
        if (parsedRoundtrip?.formationId && SQUAD_FORMATIONS[parsedRoundtrip.formationId]) {
          setFormationId(parsedRoundtrip.formationId);
        }
        if (parsedRoundtrip?.selectedSlotId) {
          setSelectedSlotId(String(parsedRoundtrip.selectedSlotId));
        }
        if (parsedRoundtrip?.starters && typeof parsedRoundtrip.starters === 'object') {
          setStarters(parsedRoundtrip.starters);
        }
        setBench(normalizeBench(parsedRoundtrip?.bench));
        if (parsedRoundtrip?.badges && typeof parsedRoundtrip.badges === 'object') {
          setBadges(normalizeBadges(parsedRoundtrip.badges));
        }
        const nextThemeId = String(parsedRoundtrip?.fieldThemeId || '');
        if (FIELD_THEMES[nextThemeId]) {
          setFieldThemeId(nextThemeId);
          setFieldThemeDraft(nextThemeId);
          restoredThemeFromRoundtrip = true;
        }
        roundtripSupplementalPlayers = normalizeSupplementalPlayers(parsedRoundtrip?.supplementalPlayers);
        restoredFromRoundtrip = true;
        console.info('[tools] Restored squad roundtrip state', {
          starterSlots: Object.keys(parsedRoundtrip?.starters || {}).length
        });
      }
    } catch (error) {
      console.error('[tools] Failed to load squad roundtrip state:', error);
    } finally {
      window.sessionStorage.removeItem(SQUAD_BUILDER_ROUNDTRIP_STATE_KEY);
    }

    if (!restoredFromRoundtrip) {
      try {
        const savedSquad = window.localStorage.getItem('toolsSquadState');
        if (savedSquad) {
          const parsed = JSON.parse(savedSquad);
          if (parsed?.squadName) setSquadName(String(parsed.squadName));
          if (parsed?.formationId && SQUAD_FORMATIONS[parsed.formationId]) setFormationId(parsed.formationId);
          if (parsed?.starters && typeof parsed.starters === 'object') setStarters(parsed.starters);
          setBench(normalizeBench(parsed?.bench));
          if (parsed?.badges && typeof parsed.badges === 'object') {
            setBadges(normalizeBadges(parsed.badges));
          }
        }
      } catch (error) {
        console.error('[tools] Failed to load saved squad state:', error);
      }
    }

    if (!restoredThemeFromRoundtrip) {
      try {
        const savedTheme = window.localStorage.getItem('selectedFieldTheme') || 'camp-nou';
        if (FIELD_THEMES[savedTheme]) {
          setFieldThemeId(savedTheme);
          setFieldThemeDraft(savedTheme);
        }
      } catch (error) {
        console.error('[tools] Failed to load saved field theme:', error);
      }
    }

    try {
      const rawSupplementalPlayers = window.localStorage.getItem(TOOLS_SUPPLEMENTAL_PLAYERS_KEY);
      const storedSupplementalPlayers = rawSupplementalPlayers
        ? normalizeSupplementalPlayers(JSON.parse(rawSupplementalPlayers))
        : {};
      setSupplementalPlayers({
        ...storedSupplementalPlayers,
        ...roundtripSupplementalPlayers
      });
    } catch (error) {
      console.error('[tools] Failed to load supplemental player cache:', error);
      if (Object.keys(roundtripSupplementalPlayers).length) {
        setSupplementalPlayers(roundtripSupplementalPlayers);
      }
    }

    setSquadStateHydrated(true);
  }, []);

  useEffect(() => {
    if (!squadStateHydrated) return;
    try {
      window.localStorage.setItem(
        'toolsSquadState',
        JSON.stringify({
          squadName,
          formationId,
          starters,
          bench,
          badges
        })
      );
    } catch (error) {
      console.error('[tools] Failed to persist squad state:', error);
    }
  }, [badges, squadName, formationId, starters, bench, squadStateHydrated]);

  useEffect(() => {
    if (!squadStateHydrated) return;
    try {
      window.localStorage.setItem(TOOLS_SUPPLEMENTAL_PLAYERS_KEY, JSON.stringify(supplementalPlayers));
    } catch (error) {
      console.error('[tools] Failed to persist supplemental player cache:', error);
    }
  }, [squadStateHydrated, supplementalPlayers]);

  useEffect(() => {
    if (!squadStateHydrated) return;
    try {
      window.localStorage.setItem('selectedFieldTheme', fieldThemeId);
    } catch (error) {
      console.error('[tools] Failed to persist selected field theme:', error);
    }
  }, [fieldThemeId, squadStateHydrated]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsSquadFullscreen(document.fullscreenElement === squadBuilderContainerRef.current);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  useEffect(() => {
    if (activeTool !== 'squadbuilder') {
      setSquadFilterOpen(false);
      setThemeSelectorOpen(false);
      setBadgesModalOpen(false);
      setSelectedPlayerForCustomization(null);
      if (document.fullscreenElement === squadBuilderContainerRef.current) {
        document.exitFullscreen().catch((error) => {
          console.error('[tools] Failed to exit squad fullscreen:', error);
        });
      }
      setIsSquadFullscreen(false);
    }
  }, [activeTool]);

  useEffect(() => {
    const lockBody = activeTool === 'squadbuilder' || !!selectedPlayerForCustomization;
    if (lockBody) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeTool, selectedPlayerForCustomization]);

  useEffect(() => {
    const mainContent = document.querySelector('main.main-content');
    if (!mainContent) return;
    const syncSquadViewportHeight = () => {
      const topOffset = mainContent.getBoundingClientRect().top;
      const viewportHeight = Math.max(0, window.innerHeight - topOffset);
      mainContent.style.setProperty('--squadbuilder-viewport-height', `${viewportHeight}px`);
    };
    if (activeTool === 'squadbuilder') {
      mainContent.classList.add('main-content--squadbuilder');
      syncSquadViewportHeight();
      window.addEventListener('resize', syncSquadViewportHeight);
    } else {
      mainContent.classList.remove('main-content--squadbuilder');
      mainContent.style.removeProperty('--squadbuilder-viewport-height');
    }
    if (activeTool === 'compare') {
      mainContent.classList.add('main-content--compare');
    } else {
      mainContent.classList.remove('main-content--compare');
    }
    return () => {
      mainContent.classList.remove('main-content--squadbuilder');
      mainContent.classList.remove('main-content--compare');
      mainContent.style.removeProperty('--squadbuilder-viewport-height');
      window.removeEventListener('resize', syncSquadViewportHeight);
    };
  }, [activeTool]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    if (activeTool === 'none') {
      url.searchParams.delete('tool');
    } else {
      url.searchParams.set('tool', activeTool);
    }
    const nextPath = `${url.pathname}${url.search}`;
    const currentPath = `${window.location.pathname}${window.location.search}`;
    if (nextPath !== currentPath) {
      window.history.replaceState(null, '', nextPath);
    }
  }, [activeTool]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      if (selectedPlayerForCustomization) {
        event.preventDefault();
        setSelectedPlayerForCustomization(null);
        return;
      }
      if (document.fullscreenElement === squadBuilderContainerRef.current) {
        document.exitFullscreen().catch((error) => {
          console.error('[tools] Failed to exit squad fullscreen:', error);
        });
        return;
      }
      if (badgesModalOpen) {
        setBadgesModalOpen(false);
        return;
      }
      if (themeSelectorOpen) {
        setThemeSelectorOpen(false);
        return;
      }
      if (squadFilterOpen) {
        setSquadFilterOpen(false);
        return;
      }
      if (activeTool !== 'none') {
        setActiveTool('none');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    activeTool,
    badgesModalOpen,
    selectedPlayerForCustomization,
    squadFilterOpen,
    themeSelectorOpen
  ]);

  useEffect(() => {
    if (!squadStateHydrated) return;
    const availableSlots = new Set((SQUAD_FORMATIONS[formationId] || []).map((slot) => slot.id));
    setStarters((current) => {
      const next = {};
      let changed = false;
      Object.entries(current).forEach(([slotId, playerId]) => {
        if (availableSlots.has(slotId)) {
          next[slotId] = playerId;
        } else {
          changed = true;
        }
      });
      return changed ? next : current;
    });

    if (!availableSlots.has(selectedSlotId)) {
      setSelectedSlotId((SQUAD_FORMATIONS[formationId] || [])[0]?.id || 'GK');
    }
  }, [formationId, selectedSlotId, squadStateHydrated]);

  const assignedPlayerIds = useMemo(() => {
    const set = new Set();
    Object.values(starters).forEach((playerId) => {
      if (playerId) set.add(playerId);
    });
    bench.forEach((playerId) => {
      if (playerId) set.add(playerId);
    });
    return set;
  }, [starters, bench]);

  useEffect(() => {
    if (!selectedPlayerForCustomization?.playerId) return;
    if (!assignedPlayerIds.has(selectedPlayerForCustomization.playerId)) {
      setSelectedPlayerForCustomization(null);
    }
  }, [assignedPlayerIds, selectedPlayerForCustomization]);

  useEffect(() => {
    if (typeof window === 'undefined' || !squadStateHydrated) return;
    const rawPendingPick = window.sessionStorage.getItem(SQUAD_BUILDER_PENDING_PICK_KEY);
    if (!rawPendingPick) return;
    let pendingPick = null;
    try {
      pendingPick = JSON.parse(rawPendingPick);
    } catch (error) {
      console.error('[tools] Failed to parse pending squad player pick:', error);
      window.sessionStorage.removeItem(SQUAD_BUILDER_PENDING_PICK_KEY);
      return;
    }
    try {
      const playerId = String(pendingPick?.playerId || '').trim();
      const preferredSlotId = String(pendingPick?.slotId || '').trim();
      const preferredPosition = String(pendingPick?.position || '').toUpperCase().trim();
      const preferredBenchIndex = normalizeBenchIndex(pendingPick?.benchIndex);
      const preferredFormationId = String(pendingPick?.formationId || '').trim();
      if (!playerId) {
        window.sessionStorage.removeItem(SQUAD_BUILDER_PENDING_PICK_KEY);
        return;
      }
      if (preferredFormationId && preferredFormationId !== formationId && SQUAD_FORMATIONS[preferredFormationId]) {
        setFormationId(preferredFormationId);
        return;
      }
      if (assignedPlayerIds.has(playerId)) {
        window.sessionStorage.removeItem(SQUAD_BUILDER_PENDING_PICK_KEY);
        return;
      }
      const rawPendingPlayer = pendingPick?.player && typeof pendingPick.player === 'object' ? pendingPick.player : null;
      const basePendingPlayer = playersById.get(playerId) || null;
      const mergedPendingPlayer = rawPendingPlayer
        ? {
            ...(basePendingPlayer || {}),
            ...rawPendingPlayer,
            playerId
          }
        : null;
      if (mergedPendingPlayer && resolvePlayerPrice(rawPendingPlayer) <= 0 && resolvePlayerPrice(basePendingPlayer) > 0) {
        mergedPendingPlayer.price = basePendingPlayer.price;
      }
      const normalizedPendingPlayer = mergedPendingPlayer ? normalizePlayer(mergedPendingPlayer) : null;
      if (rawPendingPlayer) {
        if (normalizedPendingPlayer?.playerId === playerId) {
          setSupplementalPlayers((current) => ({
            ...current,
            [playerId]: normalizedPendingPlayer
          }));
        }
      }
      if (!playersById.has(playerId) && !normalizedPendingPlayer) {
        return;
      }
      if (preferredBenchIndex >= 0) {
        const preferredBenchEmpty = !bench[preferredBenchIndex];
        const fallbackBenchIndex = bench.findIndex((entry) => !entry);
        const targetBenchIndex = preferredBenchEmpty ? preferredBenchIndex : fallbackBenchIndex;
        if (targetBenchIndex >= 0) {
          console.info('[tools] Applying pending squad pick to bench', {
            playerId,
            preferredBenchIndex,
            targetBenchIndex
          });
          setActiveTool('squadbuilder');
          setBench((current) => {
            const preferredCurrentEmpty = !current[targetBenchIndex];
            if (preferredCurrentEmpty) {
              const next = [...current];
              next[targetBenchIndex] = playerId;
              return next;
            }
            const nextEmpty = current.findIndex((entry) => !entry);
            if (nextEmpty < 0) return current;
            const next = [...current];
            next[nextEmpty] = playerId;
            return next;
          });
          window.sessionStorage.removeItem(SQUAD_BUILDER_PENDING_PICK_KEY);
          return;
        }
      }
      const availableSlots = SQUAD_FORMATIONS[formationId] || [];
      const fallbackSlotId = selectedSlotId || availableSlots[0]?.id || '';
      const targetSlotId = resolvePendingPickTargetSlotId({
        availableSlots,
        starters,
        preferredSlotId,
        preferredPosition,
        fallbackSlotId
      });
      if (!targetSlotId) {
        console.info('[tools] Skipped pending squad pick because no empty target slot was available', {
          playerId,
          preferredSlotId,
          preferredPosition,
          formationId
        });
        window.sessionStorage.removeItem(SQUAD_BUILDER_PENDING_PICK_KEY);
        return;
      }
      const targetSlot = availableSlots.find((slot) => slot.id === targetSlotId) || null;
      const pendingPlayerRecord = playersById.get(playerId) || normalizedPendingPlayer;
      if (!canAssignPlayerToSlot(pendingPlayerRecord, targetSlot)) {
        console.info('[tools] Rejected pending squad pick due goalkeeper slot rules', {
          playerId,
          playerPosition: pendingPlayerRecord?.position || '',
          targetSlotId,
          targetSlotLabel: targetSlot?.label || ''
        });
        window.sessionStorage.removeItem(SQUAD_BUILDER_PENDING_PICK_KEY);
        return;
      }
      console.info('[tools] Applying pending squad pick', {
        playerId,
        preferredSlotId,
        targetSlotId,
        formationId
      });
      setSelectedSlotId(targetSlotId);
      setActiveTool('squadbuilder');
      setStarters((current) => ({
        ...current,
        [targetSlotId]: playerId
      }));
      window.sessionStorage.removeItem(SQUAD_BUILDER_PENDING_PICK_KEY);
    } catch (error) {
      console.error('[tools] Failed to apply pending squad player pick:', error);
    }
  }, [assignedPlayerIds, bench, formationId, playersById, selectedSlotId, squadStateHydrated, starters]);

  const squadPlayers = useMemo(() => {
    const seenPlayerIds = new Set();
    return [...Object.values(starters), ...bench]
      .filter((playerId) => {
        const normalizedPlayerId = String(playerId || '').trim();
        if (!normalizedPlayerId || seenPlayerIds.has(normalizedPlayerId)) return false;
        seenPlayerIds.add(normalizedPlayerId);
        return true;
      })
      .map((playerId) => playersById.get(playerId))
      .filter(Boolean);
  }, [bench, playersById, starters]);

  const squadPriceLookupTargets = useMemo(() => {
    const targets = [];
    const seen = new Set();
    squadPlayers.forEach((player) => {
      if (!player?.playerId || player?.isUntradable) return;
      const cacheKey = getSquadPriceCacheKey(player.playerId);
      if (!cacheKey || seen.has(cacheKey)) return;
      seen.add(cacheKey);
      targets.push({ cacheKey, playerId: player.playerId });
    });
    return targets;
  }, [squadPlayers]);

  useEffect(() => {
    if (!squadPriceLookupTargets.length) return;
    const pendingTargets = squadPriceLookupTargets.filter((target) => parsePriceValue(squadLivePrices[target.cacheKey]) <= 0);
    if (!pendingTargets.length) return;

    let cancelled = false;
    const abortController = new AbortController();

    async function hydrateSquadLivePrices() {
      const priceEntries = await Promise.all(
        pendingTargets.map(async (target) => {
          try {
            const response = await fetch(
              `/api/player-price?id=${encodeURIComponent(target.playerId)}&rank=0`,
              {
                cache: 'no-store',
                signal: abortController.signal
              }
            );
            if (!response.ok) {
              console.info('[tools] Squad live price request returned non-ok response', {
                playerId: target.playerId,
                status: response.status
              });
              return [target.cacheKey, 0];
            }
            const payload = await response.json();
            return [target.cacheKey, parsePriceValue(payload?.price)];
          } catch (error) {
            if (error?.name !== 'AbortError') {
              console.error('[tools] Failed to fetch live squad price', {
                playerId: target.playerId,
                error
              });
            }
            return [target.cacheKey, 0];
          }
        })
      );

      if (cancelled) return;
      const updates = {};
      priceEntries.forEach(([cacheKey, price]) => {
        if (!cacheKey || parsePriceValue(price) <= 0) return;
        updates[cacheKey] = parsePriceValue(price);
      });
      if (Object.keys(updates).length) {
        setSquadLivePrices((current) => ({
          ...current,
          ...updates
        }));
      }
    }

    hydrateSquadLivePrices();
    return () => {
      cancelled = true;
      abortController.abort();
    };
  }, [squadLivePrices, squadPriceLookupTargets]);

  const starterAdjustedOvrBySlot = useMemo(() => {
    const adjustedBySlot = {};
    formationSlots.forEach((slot) => {
      const playerId = starters[slot.id];
      if (!playerId) return;
      const player = playersById.get(playerId);
      if (!player) return;
      adjustedBySlot[slot.id] = getPositionAdjustedOvr(player, slot.label);
    });
    return adjustedBySlot;
  }, [formationSlots, playersById, starters]);

  const activeBadgesCount = useMemo(() => Object.values(badges).filter(Boolean).length, [badges]);

  const squadOvr = useMemo(() => {
    const starterTotal = formationSlots.reduce((sum, slot) => {
      const adjustedOvr = toNumber(starterAdjustedOvrBySlot[slot.id], 0);
      return sum + adjustedOvr;
    }, 0);
    const benchPlayers = bench
      .map((playerId) => playersById.get(playerId))
      .filter(Boolean);
    const benchTotal = benchPlayers.reduce((sum, player) => sum + toNumber(player.ovr, 0), 0);
    const denominator = formationSlots.length + benchPlayers.length;
    if (!denominator || starterTotal + benchTotal <= 0) return 0;
    const baseOvr = Math.ceil((starterTotal + benchTotal) / denominator);
    return baseOvr + activeBadgesCount;
  }, [activeBadgesCount, bench, formationSlots, playersById, starterAdjustedOvrBySlot]);

  const squadValue = useMemo(() => {
    if (!squadPlayers.length) return 0;
    return squadPlayers.reduce((sum, player) => {
      const livePriceCacheKey = getSquadPriceCacheKey(player?.playerId);
      const livePrice = parsePriceValue(squadLivePrices[livePriceCacheKey]);
      if (livePrice > 0) return sum + livePrice;
      const marketPrice = resolvePlayerPrice(player);
      if (marketPrice > 0) return sum + marketPrice;
      return sum + Math.max(0, toNumber(player.ovr, 0) * 1000000);
    }, 0);
  }, [squadLivePrices, squadPlayers]);

  const squadFilterOptions = useMemo(() => {
    const uniqueSorted = (values) => [...new Set(values.map((value) => String(value || '').trim()).filter(Boolean))].sort((a, b) => a.localeCompare(b));
    const normalizeSkillMoveOptions = (values) =>
      [...new Set((values || []).map((value) => toNumber(value, 0)).filter((value) => value > 0))].sort((a, b) => b - a);

    const normalizedFilterOptions = filterOptions && typeof filterOptions === 'object' ? filterOptions : null;
    const providedPositions = uniqueSorted(normalizedFilterOptions?.positions || []);
    const providedLeagues = uniqueSorted(normalizedFilterOptions?.leagues || []);
    const providedClubs = uniqueSorted(normalizedFilterOptions?.clubs || []);
    const providedNations = uniqueSorted(normalizedFilterOptions?.nations || []);
    const providedSkillMoves = normalizeSkillMoveOptions(normalizedFilterOptions?.skillMoves || []);

    const skillMoveOptions = [...new Set(normalizedPlayers.map((player) => toNumber(player.skillMoves, 0)).filter((value) => value > 0))]
      .sort((a, b) => b - a);
    return {
      positions: providedPositions.length ? providedPositions : uniqueSorted(normalizedPlayers.map((player) => player.position)),
      leagues: providedLeagues.length ? providedLeagues : uniqueSorted(normalizedPlayers.map((player) => player.league)),
      clubs: providedClubs.length ? providedClubs : uniqueSorted(normalizedPlayers.map((player) => player.club)),
      nations: providedNations.length ? providedNations : uniqueSorted(normalizedPlayers.map((player) => player.nation)),
      skillMoves: providedSkillMoves.length ? providedSkillMoves : skillMoveOptions
    };
  }, [filterOptions, normalizedPlayers]);

  const squadPickerPlayers = useMemo(() => {
    const query = toText(squadSearchQuery);
    return normalizedPlayers
      .filter((player) => {
        if (assignedPlayerIds.has(player.playerId)) return false;
        if (squadFilters.position && !matchesSelectedPosition(player, squadFilters.position)) return false;
        if (squadFilters.league && toText(player.league) !== toText(squadFilters.league)) return false;
        if (squadFilters.club && toText(player.club) !== toText(squadFilters.club)) return false;
        if (squadFilters.nation && toText(player.nation) !== toText(squadFilters.nation)) return false;
        if (squadFilters.skill && String(player.skillMoves) !== String(squadFilters.skill)) return false;
        if (squadFilters.auctionable && player.isUntradable) return false;
        const playerOvr = toNumber(player.ovr, 0);
        if (playerOvr < toNumber(squadFilters.ratingMin, 40) || playerOvr > toNumber(squadFilters.ratingMax, 150)) return false;
        if (!query) return true;
        const searchable = toText(`${player.name} ${player.position} ${player.club} ${player.league} ${player.nation}`);
        return searchable.includes(query);
      })
      .slice(0, 140);
  }, [assignedPlayerIds, normalizedPlayers, squadFilters, squadSearchQuery]);

  const assignPlayerToSelectedSlot = (playerId) => {
    if (!playerId) return;
    const slotId = selectedSlotId || formationSlots[0]?.id;
    if (!slotId) return;
    if (assignedPlayerIds.has(playerId)) return;
    const targetSlot = formationSlots.find((slot) => slot.id === slotId) || null;
    const playerRecord = playersById.get(playerId) || null;
    if (!canAssignPlayerToSlot(playerRecord, targetSlot)) {
      console.info('[tools] Rejected squad picker assignment due goalkeeper slot rules', {
        playerId,
        playerPosition: playerRecord?.position || '',
        targetSlotId: slotId,
        targetSlotLabel: targetSlot?.label || ''
      });
      return;
    }
    setStarters((current) => ({
      ...current,
      [slotId]: playerId
    }));
  };

  const persistRoundtripSquadState = (nextSelectedSlotId = selectedSlotId) => {
    if (typeof window === 'undefined') return;
    try {
      window.sessionStorage.setItem(
        SQUAD_BUILDER_ROUNDTRIP_STATE_KEY,
        JSON.stringify({
          squadName,
          formationId,
          selectedSlotId: nextSelectedSlotId,
          starters,
          bench,
          badges,
          fieldThemeId,
          supplementalPlayers
        })
      );
      window.localStorage.setItem(
        'toolsSquadState',
        JSON.stringify({
          squadName,
          formationId,
          starters,
          bench,
          badges
        })
      );
      window.localStorage.setItem(TOOLS_SUPPLEMENTAL_PLAYERS_KEY, JSON.stringify(supplementalPlayers));
    } catch (error) {
      console.error('[tools] Failed to persist squad roundtrip state:', error);
    }
  };

  const handleSquadSlotSelect = (slot, hasPlayer = false) => {
    const slotId = String(slot?.id || '').trim();
    const slotPosition = String(slot?.label || '').trim();
    if (!slotId) return;
    setSelectedSlotId(slotId);
    if (hasPlayer) return;
    const pickerElement = squadBuilderContainerRef.current?.querySelector('.squad-picker');
    const canUseInlinePicker = (() => {
      if (!pickerElement || typeof window === 'undefined') return false;
      const pickerStyle = window.getComputedStyle(pickerElement);
      const pickerHidden =
        pickerStyle.display === 'none' ||
        pickerStyle.visibility === 'hidden' ||
        pickerStyle.pointerEvents === 'none' ||
        pickerElement.clientHeight === 0;
      return !pickerHidden;
    })();

    if (canUseInlinePicker) {
      const pickerSearchInput = squadBuilderContainerRef.current?.querySelector('#squad-picker-search');
      if (pickerSearchInput instanceof HTMLInputElement) {
        pickerSearchInput.focus();
      }
      return;
    }

    persistRoundtripSquadState(slotId);
    const searchParams = new URLSearchParams();
    searchParams.set('squadPick', '1');
    searchParams.set('slotId', slotId);
    if (slotPosition) {
      searchParams.set('position', slotPosition);
    }
    searchParams.set('formationId', formationId);
    searchParams.set('returnTo', '/tools?tool=squadbuilder');
    router.push(`/players?${searchParams.toString()}`);
  };

  const handleBenchSlotSelect = (benchIndex, hasPlayer = false) => {
    const normalizedBenchIndex = normalizeBenchIndex(benchIndex);
    if (normalizedBenchIndex < 0) return;
    if (hasPlayer) return;
    persistRoundtripSquadState();
    const searchParams = new URLSearchParams();
    searchParams.set('squadPick', '1');
    searchParams.set('benchIndex', String(normalizedBenchIndex));
    searchParams.set('formationId', formationId);
    searchParams.set('returnTo', '/tools?tool=squadbuilder');
    router.push(`/players?${searchParams.toString()}`);
  };

  const openSquadPlayerCustomizationModal = (playerId, context = {}) => {
    const normalizedPlayerId = String(playerId || '').trim();
    if (!normalizedPlayerId) return;
    if (!playersById.has(normalizedPlayerId)) return;
    setSelectedPlayerForCustomization({
      playerId: normalizedPlayerId,
      slotId: context.slotId || '',
      benchIndex: Number.isInteger(context.benchIndex) ? context.benchIndex : null
    });
  };

  const closeSquadPlayerCustomizationModal = () => {
    setSelectedPlayerForCustomization(null);
  };

  const upsertCustomizedPlayer = (payload = {}) => {
    const playerId = String(payload?.playerId || '').trim();
    if (!playerId) return;

    const currentPlayer = playersById.get(playerId);
    if (!currentPlayer) return;

    const rank = clamp(toNumber(payload?.rank ?? currentPlayer.rank, 0), 0, 5);
    const trainingLevel = clamp(toNumber(payload?.trainingLevel ?? currentPlayer.trainingLevel, 0), 0, 30);
    const trainingBonus = Math.floor(trainingLevel / 5);
    const selectedSkills = normalizeSelectedSkills(payload?.selectedSkills ?? currentPlayer.selectedSkills).slice(0, rank);
    const skillAllocations = normalizeSkillAllocations(payload?.skillAllocations ?? currentPlayer.skillAllocations ?? currentPlayer.skill_allocations);
    const baseOvr = Math.max(0, toNumber(payload?.baseOvr ?? currentPlayer.baseOvr ?? currentPlayer.ovr, 0));
    const boostedOvr = baseOvr > 0 ? baseOvr + rank + trainingBonus : baseOvr;

    setSupplementalPlayers((current) => ({
      ...current,
      [playerId]: {
        ...currentPlayer,
        ...payload,
        playerId,
        rank,
        trainingLevel,
        selectedSkills,
        skillAllocations,
        skill_allocations: skillAllocations,
        baseOvr,
        boostedOvr,
        trainingBonus,
        ovr: toNumber(payload?.ovr, boostedOvr)
      }
    }));
  };

  const updateSquadPlayerCustomization = (payload = {}) => {
    const playerId = String(payload?.playerId || selectedPlayerForCustomization?.playerId || '').trim();
    if (!playerId) return;

    if (payload?.removePlayer) {
      const selectedSlot = String(selectedPlayerForCustomization?.slotId || '').trim();
      const selectedBenchIndex = Number.isInteger(selectedPlayerForCustomization?.benchIndex)
        ? selectedPlayerForCustomization.benchIndex
        : -1;
      if (selectedSlot) {
        removeStarter(selectedSlot);
      } else if (selectedBenchIndex >= 0) {
        removeBenchPlayer(selectedBenchIndex);
      } else {
        const fallbackSlot = Object.entries(starters).find(([, id]) => id === playerId)?.[0];
        if (fallbackSlot) removeStarter(fallbackSlot);
        const fallbackBenchIndex = bench.findIndex((id) => id === playerId);
        if (fallbackBenchIndex >= 0) removeBenchPlayer(fallbackBenchIndex);
      }
      setSelectedPlayerForCustomization(null);
      return;
    }
    upsertCustomizedPlayer({ ...payload, playerId });
  };

  const removeStarter = (slotId) => {
    setStarters((current) => {
      const next = { ...current };
      delete next[slotId];
      return next;
    });
  };

  const removeBenchPlayer = (benchIndex) => {
    setBench((current) => {
      const next = [...current];
      next[benchIndex] = '';
      return next;
    });
  };

  const clearSquad = () => {
    setStarters({});
    setBench(Array.from({ length: 7 }, () => ''));
    setSelectedSlotId((SQUAD_FORMATIONS[formationId] || [])[0]?.id || 'GK');
  };

  const clearDragPreviewNode = () => {
    const previewNode = dragPreviewNodeRef.current;
    if (previewNode && previewNode.parentNode) {
      previewNode.parentNode.removeChild(previewNode);
    }
    dragPreviewNodeRef.current = null;
  };

  const clearDragState = () => {
    clearDragPreviewNode();
    dragPayloadRef.current = null;
    touchDragStateRef.current = {
      active: false,
      moved: false,
      payload: null,
      startX: 0,
      startY: 0
    };
    setDraggingKey('');
    setDragOverSlotId('');
    setDragOverBenchIndex(-1);
  };

  const resolveTouchDestinationAtPoint = (clientX, clientY, payload) => {
    if (typeof document === 'undefined' || !payload?.playerId) return null;
    const target = document.elementFromPoint(clientX, clientY);
    if (!target) return null;

    const slotTarget = target.closest?.('[data-slot-id]');
    if (slotTarget) {
      const slotId = String(slotTarget.getAttribute('data-slot-id') || '').trim();
      if (!slotId) return null;
      const movingPlayer = playersById.get(payload.playerId) || null;
      const targetSlot = formationSlots.find((slot) => slot.id === slotId) || null;
      if (!canAssignPlayerToSlot(movingPlayer, targetSlot)) return null;
      return { type: 'slot', slotId };
    }

    const benchTarget = target.closest?.('[data-bench-index]');
    if (benchTarget) {
      const benchIndex = normalizeBenchIndex(benchTarget.getAttribute('data-bench-index'));
      if (benchIndex < 0) return null;
      return { type: 'bench', benchIndex };
    }

    return null;
  };

  const updateTouchDragHighlights = (destination) => {
    if (destination?.type === 'slot') {
      setDragOverSlotId(destination.slotId);
      setDragOverBenchIndex(-1);
      return;
    }
    if (destination?.type === 'bench') {
      setDragOverBenchIndex(destination.benchIndex);
      setDragOverSlotId('');
      return;
    }
    setDragOverSlotId('');
    setDragOverBenchIndex(-1);
  };

  const handleTouchDragStart = (event, payload, sourceKey) => {
    const touch = event.touches?.[0];
    if (!touch || !payload?.playerId) return;
    dragPayloadRef.current = payload;
    touchDragStateRef.current = {
      active: true,
      moved: false,
      payload,
      startX: touch.clientX,
      startY: touch.clientY
    };
    setDraggingKey(sourceKey || '');
    updateTouchDragHighlights(null);
  };

  const handleTouchDragMove = (event) => {
    const dragState = touchDragStateRef.current;
    if (!dragState?.active || !dragState.payload) return;
    const touch = event.touches?.[0];
    if (!touch) return;

    const deltaX = touch.clientX - dragState.startX;
    const deltaY = touch.clientY - dragState.startY;
    if (!dragState.moved && Math.hypot(deltaX, deltaY) < 8) return;
    dragState.moved = true;

    event.preventDefault();
    const destination = resolveTouchDestinationAtPoint(touch.clientX, touch.clientY, dragState.payload);
    updateTouchDragHighlights(destination);
  };

  const handleTouchDragEnd = (event) => {
    const dragState = touchDragStateRef.current;
    if (!dragState?.active || !dragState.payload) {
      clearDragState();
      return;
    }
    const touch = event.changedTouches?.[0] || event.touches?.[0];
    let destination = null;
    if (dragState.moved && touch) {
      destination = resolveTouchDestinationAtPoint(touch.clientX, touch.clientY, dragState.payload);
    }
    if (dragState.moved) {
      event.preventDefault();
      if (destination) {
        movePlayer(dragState.payload, destination);
      }
    }
    clearDragState();
  };

  const movePlayer = (payload, destination) => {
    const movingPlayerId = payload?.playerId;
    if (!movingPlayerId || !destination) return;

    if (payload.source === 'slot' && destination.type === 'slot' && payload.slotId === destination.slotId) return;
    if (payload.source === 'bench' && destination.type === 'bench' && payload.benchIndex === destination.benchIndex) return;
    if (payload.source === 'picker' && assignedPlayerIds.has(movingPlayerId)) return;
    if (destination.type === 'slot') {
      const targetSlot = formationSlots.find((slot) => slot.id === destination.slotId) || null;
      const movingPlayer = playersById.get(movingPlayerId) || null;
      if (!canAssignPlayerToSlot(movingPlayer, targetSlot)) {
        console.info('[tools] Rejected slot drop due goalkeeper slot rules', {
          movingPlayerId,
          playerPosition: movingPlayer?.position || '',
          targetSlotId: destination.slotId,
          targetSlotLabel: targetSlot?.label || ''
        });
        return;
      }
    }

    const nextStarters = { ...starters };
    const nextBench = [...bench];

    if (payload.source === 'slot' && payload.slotId) {
      if (nextStarters[payload.slotId] !== movingPlayerId) return;
      delete nextStarters[payload.slotId];
    }
    if (payload.source === 'bench' && Number.isInteger(payload.benchIndex)) {
      if (nextBench[payload.benchIndex] !== movingPlayerId) return;
      nextBench[payload.benchIndex] = '';
    }

    if (destination.type === 'slot') {
      const displaced = nextStarters[destination.slotId] || '';
      nextStarters[destination.slotId] = movingPlayerId;

      if (displaced && displaced !== movingPlayerId) {
        if (payload.source === 'slot' && payload.slotId) {
          nextStarters[payload.slotId] = displaced;
        } else if (payload.source === 'bench' && Number.isInteger(payload.benchIndex)) {
          nextBench[payload.benchIndex] = displaced;
        } else {
          const firstEmptyBench = nextBench.findIndex((entry) => !entry);
          if (firstEmptyBench >= 0) nextBench[firstEmptyBench] = displaced;
        }
      }
    }

    if (destination.type === 'bench') {
      const displaced = nextBench[destination.benchIndex] || '';
      nextBench[destination.benchIndex] = movingPlayerId;

      if (displaced && displaced !== movingPlayerId) {
        if (payload.source === 'slot' && payload.slotId) {
          nextStarters[payload.slotId] = displaced;
        } else if (payload.source === 'bench' && Number.isInteger(payload.benchIndex)) {
          nextBench[payload.benchIndex] = displaced;
        } else {
          const preferredSlot = selectedSlotId && !nextStarters[selectedSlotId] ? selectedSlotId : formationSlots.find((slot) => !nextStarters[slot.id])?.id;
          if (preferredSlot) {
            nextStarters[preferredSlot] = displaced;
          }
        }
      }
    }

    setStarters(nextStarters);
    setBench(nextBench);
  };

  const handleDragStart = (event, payload, sourceKey, dragPreviewElement = null) => {
    if (event?.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', payload?.playerId || '');
      clearDragPreviewNode();
      if (
        payload?.source === 'picker' &&
        typeof HTMLElement !== 'undefined' &&
        dragPreviewElement instanceof HTMLElement
      ) {
        const rect = dragPreviewElement.getBoundingClientRect();
        const previewClone = dragPreviewElement.cloneNode(true);
        previewClone.style.position = 'fixed';
        previewClone.style.top = '-1000px';
        previewClone.style.left = '-1000px';
        previewClone.style.pointerEvents = 'none';
        previewClone.style.margin = '0';
        previewClone.style.transform = 'none';
        previewClone.style.width = `${rect.width || dragPreviewElement.offsetWidth}px`;
        previewClone.style.height = `${rect.height || dragPreviewElement.offsetHeight}px`;
        previewClone.style.zIndex = '99999';
        document.body.appendChild(previewClone);
        dragPreviewNodeRef.current = previewClone;
        event.dataTransfer.setDragImage(
          previewClone,
          (rect.width || dragPreviewElement.offsetWidth || 40) / 2,
          (rect.height || dragPreviewElement.offsetHeight || 50) / 2
        );
      }
    }
    dragPayloadRef.current = payload;
    setDraggingKey(sourceKey || '');
  };

  const handleDragEnd = () => {
    clearDragState();
  };

  const handleSlotDragOver = (event, slotId) => {
    if (!dragPayloadRef.current || !slotId) return;
    const payload = dragPayloadRef.current;
    const movingPlayer = playersById.get(payload?.playerId) || null;
    const targetSlot = formationSlots.find((slot) => slot.id === slotId) || null;
    if (!canAssignPlayerToSlot(movingPlayer, targetSlot)) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    setDragOverSlotId(slotId);
    setDragOverBenchIndex(-1);
  };

  const handleBenchDragOver = (event, benchIndex) => {
    if (!dragPayloadRef.current || !Number.isInteger(benchIndex)) return;
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
    setDragOverBenchIndex(benchIndex);
    setDragOverSlotId('');
  };

  const handleSlotDragLeave = (slotId) => {
    setDragOverSlotId((current) => (current === slotId ? '' : current));
  };

  const handleBenchDragLeave = (benchIndex) => {
    setDragOverBenchIndex((current) => (current === benchIndex ? -1 : current));
  };

  const handleDropOnSlot = (event, slotId) => {
    event.preventDefault();
    const payload = dragPayloadRef.current;
    if (!slotId || !payload) {
      clearDragState();
      return;
    }
    movePlayer(payload, { type: 'slot', slotId });
    clearDragState();
  };

  const handleDropOnBench = (event, benchIndex) => {
    event.preventDefault();
    const payload = dragPayloadRef.current;
    if (!Number.isInteger(benchIndex) || !payload) {
      clearDragState();
      return;
    }
    movePlayer(payload, { type: 'bench', benchIndex });
    clearDragState();
  };

  const normalizeSquadFilterDraftRatings = (draft) => {
    const normalizedDraft = {
      ...draft,
      ratingMin: clamp(toNumber(draft.ratingMin, 40), 40, 150),
      ratingMax: clamp(toNumber(draft.ratingMax, 150), 40, 150)
    };
    if (normalizedDraft.ratingMin > normalizedDraft.ratingMax) {
      normalizedDraft.ratingMax = normalizedDraft.ratingMin;
    }
    return normalizedDraft;
  };

  const updateSquadFilterDraftRating = (field, rawValue) => {
    const digitsOnly = String(rawValue ?? '')
      .replace(/[^0-9]/g, '')
      .slice(0, 3);
    setSquadFilterDraft((prev) => ({
      ...prev,
      [field]: digitsOnly
    }));
  };

  const commitSquadFilterDraftRatings = () => {
    setSquadFilterDraft((prev) => normalizeSquadFilterDraftRatings(prev));
  };

  const openSquadFilterPanel = () => {
    setSquadFilterDraft(squadFilters);
    const triggerRect = squadFilterTriggerRef.current?.getBoundingClientRect?.();
    if (triggerRect && typeof window !== 'undefined') {
      const viewportPadding = 12;
      const panelWidth = 320;
      const estimatedPanelHeight = 560;
      let left = clamp(triggerRect.left, viewportPadding, Math.max(viewportPadding, window.innerWidth - panelWidth - viewportPadding));
      let top = triggerRect.bottom + 8;
      if (top + estimatedPanelHeight > window.innerHeight - viewportPadding) {
        top = Math.max(viewportPadding, triggerRect.top - estimatedPanelHeight - 8);
      }
      setSquadFilterPanelPosition({ top, left });
    }
    setSquadFilterOpen(true);
  };

  const applySquadFilterPanel = () => {
    const normalizedDraft = normalizeSquadFilterDraftRatings(squadFilterDraft);
    setSquadFilters(normalizedDraft);
    setSquadFilterDraft(normalizedDraft);
    setSquadFilterOpen(false);
  };

  const resetSquadFilterPanel = () => {
    const resetFilters = { ...DEFAULT_SQUAD_FILTERS };
    setSquadFilterDraft(resetFilters);
    setSquadFilters(resetFilters);
    setSquadFilterOpen(false);
  };

  const openThemeSelector = () => {
    setFieldThemeDraft(fieldThemeId);
    setThemeSelectorOpen(true);
  };

  const applyThemeSelection = () => {
    if (FIELD_THEMES[fieldThemeDraft]) {
      setFieldThemeId(fieldThemeDraft);
    }
    setThemeSelectorOpen(false);
  };

  const toggleBadge = (badgeNumber) => {
    const badgeKey = `badge${badgeNumber}`;
    setBadges((current) => ({
      ...current,
      [badgeKey]: !current[badgeKey]
    }));
  };

  const buildSquadSnapshot = () => ({
    version: '1.0',
    timestamp: new Date().toISOString(),
    name: String(squadName || 'My Squad').trim() || 'My Squad',
    formationId,
    starters: { ...starters },
    bench: [...bench],
    badges: normalizeBadges(badges),
    fieldTheme: fieldThemeId,
    teamOvr: squadOvr,
    teamValue: squadValue
  });

  const saveSquad = () => {
    try {
      window.localStorage.setItem(SQUAD_SAVE_KEY, JSON.stringify(buildSquadSnapshot()));
    } catch (error) {
      console.error('[tools] Failed to save squad snapshot:', error);
    }
  };

  const loadSquad = () => {
    try {
      const raw = window.localStorage.getItem(SQUAD_SAVE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      const nextFormation = String(parsed?.formationId || '');
      if (SQUAD_FORMATIONS[nextFormation]) {
        setFormationId(nextFormation);
      }
      setSquadName(String(parsed?.name || 'My Squad'));
      setStarters(parsed?.starters && typeof parsed.starters === 'object' ? parsed.starters : {});
      if (Array.isArray(parsed?.bench)) {
        setBench(parsed.bench.slice(0, 7).concat(Array.from({ length: Math.max(0, 7 - parsed.bench.length) }, () => '')));
      } else {
        setBench(Array.from({ length: 7 }, () => ''));
      }
      setBadges(normalizeBadges(parsed?.badges));
      const nextThemeId = String(parsed?.fieldTheme || '');
      if (FIELD_THEMES[nextThemeId]) {
        setFieldThemeId(nextThemeId);
        setFieldThemeDraft(nextThemeId);
      }
      setSelectedSlotId((SQUAD_FORMATIONS[nextFormation] || SQUAD_FORMATIONS[formationId] || [])[0]?.id || 'GK');
    } catch (error) {
      console.error('[tools] Failed to load squad snapshot:', error);
    }
  };

  const exportSquad = () => {
    try {
      const snapshot = buildSquadSnapshot();
      const content = JSON.stringify(snapshot, null, 2);
      const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = (snapshot.name || 'My Squad').replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
      const timestamp = snapshot.timestamp.replace(/[:.]/g, '-');
      link.href = url;
      link.download = `${safeName || 'My_Squad'}_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('[tools] Failed to export squad snapshot:', error);
    }
  };

  const openTool = (toolName) => setActiveTool(normalizeTool(toolName));
  const closeOpenTool = () => setActiveTool('none');
  const toggleSquadFullscreen = () => {
    const squadContainer = squadBuilderContainerRef.current;
    if (!squadContainer) return;
    if (document.fullscreenElement === squadContainer) {
      document.exitFullscreen().catch((error) => {
        console.error('[tools] Failed to exit squad fullscreen:', error);
      });
      return;
    }
    squadContainer.requestFullscreen().catch((error) => {
      console.error('[tools] Failed to enter squad fullscreen:', error);
    });
  };

  const selectedCustomizationPlayer = selectedPlayerForCustomization?.playerId
    ? playersById.get(selectedPlayerForCustomization.playerId) || null
    : null;
  const activeFieldTheme = FIELD_THEMES[fieldThemeId] || FIELD_THEMES['camp-nou'];
  const fieldThemeClassName = `theme-${activeFieldTheme.id}`;
  const isSquadBuilderActive = activeTool === 'squadbuilder';
  const isCompareActive = activeTool === 'compare';
  const isFullPageToolActive = isSquadBuilderActive || isCompareActive;

  return (
    <>
      <div id="tools-view" className={`view ${isFullPageToolActive ? '' : 'active'}`}>
        <div className="tools-modal-content" style={{ width: 'min(1200px, 96vw)', margin: '18px auto', maxHeight: 'none' }}>
          <div className="tools-modal-header">
            <h2>Tools & Features</h2>
            <button className="tools-modal-close" onClick={() => setActiveTool('none')} type="button" aria-label="Clear active tool">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="tools-grid">
            <button className="tool-card" onClick={() => openTool('squadbuilder')} type="button">
              <div className="tool-card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="7" r="4" />
                  <path d="M3 20c0-1.5 3-2.5 6-2.5s6 1 6 2.5" />
                  <circle cx="17" cy="7" r="4" />
                  <path d="M15 20c0-1.5 2-2.5 4-2.5s4 1 4 2.5" />
                </svg>
              </div>
              <h3>Squad Builder</h3>
              <p>Create and organize your dream squad</p>
              <span className="tool-badge pro">New</span>
            </button>

            <button className="tool-card" onClick={() => openTool('compare')} type="button">
              <div className="tool-card-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3" />
                  <line x1="12" y1="12" x2="20" y2="7.5" />
                  <line x1="12" y1="12" x2="12" y2="21" />
                  <line x1="12" y1="12" x2="4" y2="7.5" />
                </svg>
              </div>
              <h3>Compare Players</h3>
              <p>Head-to-head stat comparison</p>
            </button>
          </div>
        </div>
      </div>

      <div
        id="squad-builder-modal"
        ref={squadBuilderContainerRef}
        className={`squad-page-view${isSquadBuilderActive ? ' is-open' : ''}${isSquadFullscreen ? ' squad-fullscreen' : ''}`}
      >
        <div className="squad-page-shell">
          {/* Squad Builder region: top bar controls */}
          <div className="squad-header" data-squad-section="top-bar">
            <div className="squad-header-left">
              <h2>Squad Builder</h2>
              <input
                id="squad-name-input"
                className="squad-input"
                placeholder="Squad Name"
                value={squadName}
                onChange={(event) => setSquadName(event.target.value)}
              />
              <button id="squad-theme-btn" className="squad-theme-btn" title="Change Field Theme" onClick={openThemeSelector} type="button">
                🎨
              </button>
            </div>

            <div className="squad-header-center">
              <div className="squad-header-actions">
                <button className="squad-action-btn export-btn" onClick={exportSquad} type="button">
                  📸 Export
                </button>
                <button className="badges-btn" onClick={() => setBadgesModalOpen(true)} title="Manage Team Badges" type="button">
                  <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M10 2L11.5 6.5L16 6.5L12.5 9.5L14 14L10 11.5L6 14L7.5 9.5L4 6.5L8.5 6.5L10 2Z" fill="currentColor" />
                  </svg>
                  Badges
                </button>
              </div>
              <div className="squad-header-status">
                <div className="squad-stat">
                  <span className="squad-stat-label">OVR</span>
                  <span id="squad-ovr" className="squad-stat-value">
                    {squadOvr}
                  </span>
                </div>
                <div className="squad-stat">
                  <span className="squad-stat-label">VALUE</span>
                  <span id="squad-value" className="squad-stat-value">
                    {formatCoins(squadValue)}
                  </span>
                </div>
              </div>
            </div>

            <div className="squad-header-right">
              <div className="squad-header-formation">
                <select
                  id="formation-select"
                  className="squad-select"
                  value={formationId}
                  onChange={(event) => setFormationId(event.target.value)}
                >
                  {Object.keys(SQUAD_FORMATIONS).map((formation) => (
                    <option key={formation} value={formation}>
                      {formation}
                    </option>
                  ))}
                </select>
              </div>
              <div className="squad-header-persistence">
                <button className="squad-action-btn save-btn" onClick={saveSquad} type="button">
                  <span aria-hidden="true">💾</span>
                  <span className="squad-action-label squad-action-label--desktop">Save Squad</span>
                  <span className="squad-action-label squad-action-label--mobile">Save</span>
                </button>
                <button className="squad-action-btn load-btn" onClick={loadSquad} type="button">
                  <span aria-hidden="true">📥</span>
                  <span className="squad-action-label squad-action-label--desktop">Load Squad</span>
                  <span className="squad-action-label squad-action-label--mobile">Load</span>
                </button>
                <button className="squad-btn" onClick={clearSquad} type="button" title="Reset Squad" aria-label="Reset Squad">
                  ↻
                </button>
              </div>
              <div className="squad-header-utilities">
                <button
                  className={`squad-fullscreen-toggle${isSquadFullscreen ? ' active' : ''}`}
                  title={isSquadFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  aria-label={isSquadFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
                  aria-pressed={isSquadFullscreen}
                  onClick={toggleSquadFullscreen}
                  type="button"
                >
                  ⛶
                </button>
                <button className="squad-close" onClick={closeOpenTool} type="button" aria-label="Close Squad Builder">
                  ✕
                </button>
              </div>
            </div>
          </div>

          {/* Squad Builder region: main content shell */}
          <div className="squad-body" data-squad-section="main-content">
            <div
              id="squad-filter-panel"
              className={`squad-filter-panel ${squadFilterOpen ? 'active' : ''}`}
              data-squad-section="filter-panel"
              style={{
                display: squadFilterOpen ? 'block' : 'none',
                position: 'fixed',
                top: `${squadFilterPanelPosition.top}px`,
                left: `${squadFilterPanelPosition.left}px`
              }}
            >
              <div className="squad-filter-panel-content">
                <div className="squad-filter-panel-header">
                  <h4>Filter Players</h4>
                </div>
                <div className="squad-filter-panel-body">
                  <div className="filter-group">
                    <label className="filter-label" htmlFor="squad-auctionable-toggle">Auction Status</label>
                    <div className="range-inputs">
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          id="squad-auctionable-toggle"
                          checked={!!squadFilterDraft.auctionable}
                          onChange={(event) =>
                            setSquadFilterDraft((prev) => ({ ...prev, auctionable: event.target.checked }))
                          }
                        />
                        <span className="toggle-slider" />
                      </label>
                      <span id="squad-auction-status-text">{squadFilterDraft.auctionable ? 'Auctionable Only' : 'All Players'}</span>
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label" htmlFor="squad-filter-position">Position</label>
                    <select
                      id="squad-filter-position"
                      className="filter-select"
                      value={squadFilterDraft.position}
                      onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, position: event.target.value }))}
                    >
                      <option value="">All Positions</option>
                      {squadFilterOptions.positions.map((position) => (
                        <option key={position} value={position}>
                          {position}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label">
                      Overall Rating{' '}
                      <span id="squad-rating-value">
                        {`${clamp(toNumber(squadFilterDraft.ratingMin, 40), 40, 150)}-${clamp(
                          toNumber(squadFilterDraft.ratingMax, 150),
                          40,
                          150
                        )}`}
                      </span>
                    </label>
                    <div className="range-inputs">
                      <input
                        id="squad-rating-min"
                        className="range-input"
                        type="number"
                        min="40"
                        max="150"
                        value={squadFilterDraft.ratingMin}
                        onChange={(event) => updateSquadFilterDraftRating('ratingMin', event.target.value)}
                        onBlur={commitSquadFilterDraftRatings}
                      />
                      <span>-</span>
                      <input
                        id="squad-rating-max"
                        className="range-input"
                        type="number"
                        min="40"
                        max="150"
                        value={squadFilterDraft.ratingMax}
                        onChange={(event) => updateSquadFilterDraftRating('ratingMax', event.target.value)}
                        onBlur={commitSquadFilterDraftRatings}
                      />
                    </div>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label" htmlFor="squad-filter-league">League</label>
                    <select
                      id="squad-filter-league"
                      className="filter-select"
                      value={squadFilterDraft.league}
                      onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, league: event.target.value }))}
                    >
                      <option value="">All Leagues</option>
                      {squadFilterOptions.leagues.map((league) => (
                        <option key={league} value={league}>
                          {league}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label" htmlFor="squad-filter-club">Club</label>
                    <select
                      id="squad-filter-club"
                      className="filter-select"
                      value={squadFilterDraft.club}
                      onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, club: event.target.value }))}
                    >
                      <option value="">All Clubs</option>
                      {squadFilterOptions.clubs.map((club) => (
                        <option key={club} value={club}>
                          {club}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label" htmlFor="squad-filter-nation">Nation</label>
                    <select
                      id="squad-filter-nation"
                      className="filter-select"
                      value={squadFilterDraft.nation}
                      onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, nation: event.target.value }))}
                    >
                      <option value="">All Nations</option>
                      {squadFilterOptions.nations.map((nation) => (
                        <option key={nation} value={nation}>
                          {nation}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="filter-group">
                    <label className="filter-label" htmlFor="squad-filter-skill">Skill Moves</label>
                    <select
                      id="squad-filter-skill"
                      className="filter-select"
                      value={squadFilterDraft.skill}
                      onChange={(event) => setSquadFilterDraft((prev) => ({ ...prev, skill: event.target.value }))}
                    >
                      <option value="">Any</option>
                      {squadFilterOptions.skillMoves.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="squad-filter-panel-footer">
                  <button className="btn-secondary" onClick={resetSquadFilterPanel} type="button">
                    Clear All
                  </button>
                  <button className="btn-primary" onClick={applySquadFilterPanel} type="button">
                    Apply
                  </button>
                </div>
              </div>
            </div>

            <div className="squad-main-grid" data-squad-section="main-grid">
              {/* Squad Builder region: pitch canvas */}
              <div
                className={`squad-field-container ${fieldThemeClassName}`}
                data-squad-section="pitch-region"
                style={{ background: activeFieldTheme.background }}
              >
                <div id="squad-field" className="squad-field">
                  {formationSlots.map((slot) => {
                    const playerId = starters[slot.id] || '';
                    const player = playerId ? playersById.get(playerId) : null;
                    const variant = player ? getPlayerType(player) : 'hero';
                    const adjustedOvr = player ? toNumber(starterAdjustedOvrBySlot[slot.id], 0) : 0;
                    const dragKey = player ? `slot-${slot.id}` : '';
                    return (
                      <div
                        key={`${formationId}-${slot.id}`}
                        className={`squad-slot ${player ? 'filled' : ''} ${selectedSlotId === slot.id ? 'selected' : ''} ${dragOverSlotId === slot.id ? 'drag-over' : ''}`}
                        style={{ left: `${slot.x}%`, top: `${slot.y}%` }}
                        data-slot-id={slot.id}
                        onClick={() => handleSquadSlotSelect(slot, !!player)}
                        onDragOver={(event) => handleSlotDragOver(event, slot.id)}
                        onDragLeave={() => handleSlotDragLeave(slot.id)}
                        onDrop={(event) => handleDropOnSlot(event, slot.id)}
                      >
                        <div className="position-dot">
                          <span className="position-label">{slot.label}</span>
                        </div>

                        {!!player && (
                          <div
                            className={`player-preview-card ${draggingKey === dragKey ? 'dragging' : ''}`}
                            data-player-id={player.playerId}
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedSlotId(slot.id);
                              openSquadPlayerCustomizationModal(player.playerId, { slotId: slot.id });
                            }}
                            draggable
                            style={{ touchAction: 'none' }}
                            onDragStart={(event) => handleDragStart(event, { source: 'slot', playerId: player.playerId, slotId: slot.id }, dragKey)}
                            onDragEnd={handleDragEnd}
                            onTouchStart={(event) => handleTouchDragStart(event, { source: 'slot', playerId: player.playerId, slotId: slot.id }, dragKey)}
                            onTouchMove={handleTouchDragMove}
                            onTouchEnd={handleTouchDragEnd}
                            onTouchCancel={handleTouchDragEnd}
                          >
                            <div className="preview-card-inner">
                              <img src={player.cardBackground || 'https://via.placeholder.com/300x400'} alt="Card" className="preview-card-bg" />
                              {!!player.playerImage && (
                                <img src={player.playerImage} alt={player.name} className="preview-card-player-img" />
                              )}
                              <div className="preview-card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
                                {adjustedOvr > 0 ? adjustedOvr : 'NA'}
                              </div>
                              <div className="preview-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
                                {player.position || 'NA'}
                              </div>
                              <div className="preview-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
                                {player.name}
                              </div>
                              {!!player.nationFlag && (
                                <img
                                  src={player.nationFlag}
                                  alt="Nation"
                                  className={`card-nation-flag ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                                />
                              )}
                              {!!player.clubFlag && (
                                <img
                                  src={player.clubFlag}
                                  alt="Club"
                                  className={`card-club-flag ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                                />
                              )}
                              {variant === 'normal' && !!player.leagueImage && (
                                <img src={player.leagueImage} alt="League" className="card-league-flag normal-league-flag" />
                              )}
                              {player.isUntradable && (
                                <div className="card-untradable-badge with-remove card-untradable-badge--squad-pitch">
                                  <img src="/assets/images/untradable_img.png" alt="Untradable" />
                                </div>
                              )}
                              <button
                                className="preview-card-remove"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  removeStarter(slot.id);
                                }}
                                type="button"
                              >
                                ×
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Squad Builder region: right-side player browser */}
              <div className="squad-picker" data-squad-section="right-panel">
                <div className="squad-picker-toolbar" data-squad-section="right-panel-toolbar">
                  <button
                    id="squad-filter-trigger"
                    ref={squadFilterTriggerRef}
                    className="squad-filter-btn"
                    onClick={openSquadFilterPanel}
                    type="button"
                    aria-label="Open filters"
                    title="Open filters"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M3 5h18l-7 8v5l-4 2v-7L3 5Z" />
                    </svg>
                  </button>
                  <input
                    type="text"
                    id="squad-picker-search"
                    className="squad-picker-search"
                    value={squadSearchQuery}
                    onChange={(event) => setSquadSearchQuery(event.target.value)}
                    placeholder="Search players..."
                  />
                  <button className="icon-btn" onClick={() => setSquadSearchQuery('')} type="button" aria-label="Clear search">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                <div className="squad-player-list" data-squad-section="right-panel-player-list">
                  {squadPickerPlayers.map((player) => {
                    const variant = getPlayerType(player);
                    const dragKey = `picker-${player.playerId}`;
                    return (
                      <div
                        key={player.playerId}
                        className={`picker-row ${draggingKey === dragKey ? 'dragging' : ''}`}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(event, { source: 'picker', playerId: player.playerId }, dragKey, event.currentTarget.firstElementChild)
                        }
                        onDragEnd={handleDragEnd}
                        onClick={() => assignPlayerToSelectedSlot(player.playerId)}
                      >
                        <div className="picker-card-mini">
                          <img src={player.cardBackground || 'https://via.placeholder.com/120x160'} alt="Card" className="picker-card-bg" />
                          {!!player.playerImage && <img src={player.playerImage} alt={player.name} className="picker-card-player-img" />}
                          <div className="picker-card-ovr" style={{ color: player.colorRating || '#FFB86B' }}>
                            {player.ovr > 0 ? player.ovr : 'N/A'}
                          </div>
                          <div className="picker-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
                            {player.position || 'N/A'}
                          </div>
                          <div className="picker-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
                            {player.name}
                          </div>
                          {!!player.nationFlag && (
                            <img
                              src={player.nationFlag}
                              alt="Nation"
                              className={`picker-squad-card-flag-nation ${variant === 'normal' ? 'normal-squad-nation-flag' : 'hero-icon-squad-nation-flag'}`}
                            />
                          )}
                          {!!player.clubFlag && (
                            <img
                              src={player.clubFlag}
                              alt="Club"
                              className={`picker-squad-card-flag-club ${variant === 'normal' ? 'normal-squad-club-flag' : 'hero-icon-squad-club-flag'}`}
                            />
                          )}
                          {variant === 'normal' && !!player.leagueImage && (
                            <img src={player.leagueImage} alt="League" className="picker-squad-card-flag-league normal-squad-league-flag" />
                          )}
                          {player.isUntradable && (
                            <div className="card-untradable-badge card-untradable-badge--squad-picker" style={{ pointerEvents: 'none' }}>
                              <img src="/assets/images/untradable_img.png" alt="Untradable" />
                            </div>
                          )}
                        </div>

                        <div className="picker-main">
                          <div className="picker-name">{player.name}</div>
                          <div className="picker-meta">
                            {player.position || 'N/A'} • {player.club || 'Unknown'}
                          </div>
                        </div>

                        <div className="picker-ovr-right">{player.ovr > 0 ? player.ovr : 'N/A'}</div>
                      </div>
                    );
                  })}
                  {!squadPickerPlayers.length && <p style={{ color: '#98A0A6', textAlign: 'center' }}>No available players match the current search.</p>}
                </div>
              </div>
            </div>

            {/* Squad Builder region: bench strip */}
            <div id="squad-bench" className="squad-bench" data-squad-section="bench-region">
              {bench.map((playerId, index) => {
                const player = playerId ? playersById.get(playerId) : null;
                const variant = player ? getPlayerType(player) : 'hero';
                const dragKey = player ? `bench-${index}` : '';
                return (
                  <div
                    key={`bench-${index}`}
                    className={`bench-cell ${player ? 'filled' : ''} ${dragOverBenchIndex === index ? 'drag-over' : ''}`}
                    data-bench-index={index}
                    onClick={() => handleBenchSlotSelect(index, !!player)}
                    onDragOver={(event) => handleBenchDragOver(event, index)}
                    onDragLeave={() => handleBenchDragLeave(index)}
                    onDrop={(event) => handleDropOnBench(event, index)}
                  >
                    <div className="bench-empty-slot">
                      <span className="bench-slot-label">BENCH {index + 1}</span>
                    </div>
                    {!!player && (
                      <div
                        className={`bench-preview-card ${draggingKey === dragKey ? 'dragging' : ''}`}
                        data-player-id={player.playerId}
                        onClick={(event) => {
                          event.stopPropagation();
                          openSquadPlayerCustomizationModal(player.playerId, { benchIndex: index });
                        }}
                        draggable
                        style={{ touchAction: 'none' }}
                        onDragStart={(event) => handleDragStart(event, { source: 'bench', playerId: player.playerId, benchIndex: index }, dragKey)}
                        onDragEnd={handleDragEnd}
                        onTouchStart={(event) => handleTouchDragStart(event, { source: 'bench', playerId: player.playerId, benchIndex: index }, dragKey)}
                        onTouchMove={handleTouchDragMove}
                        onTouchEnd={handleTouchDragEnd}
                        onTouchCancel={handleTouchDragEnd}
                      >
                        <div className="bench-card-inner">
                          <img src={player.cardBackground || 'https://via.placeholder.com/300x400'} alt="Card" className="bench-card-bg" />
                          {!!player.playerImage && (
                            <img src={player.playerImage} alt={player.name} className="bench-card-player-img" />
                          )}
                          <div className="bench-card-ovr" style={{ color: player.colorRating || '#FFFFFF' }}>
                            {player.ovr > 0 ? player.ovr : 'NA'}
                          </div>
                          <div className="bench-card-position" style={{ color: player.colorPosition || '#FFFFFF' }}>
                            {player.position || 'NA'}
                          </div>
                          <div className="bench-card-name" style={{ color: player.colorName || '#FFFFFF' }}>
                            {player.name}
                          </div>
                          {!!player.nationFlag && (
                            <img
                              src={player.nationFlag}
                              alt="Nation"
                              className={`bench-card-flag-nation ${variant === 'normal' ? 'normal-nation-flag' : 'hero-icon-nation-flag'}`}
                            />
                          )}
                          {!!player.clubFlag && (
                            <img
                              src={player.clubFlag}
                              alt="Club"
                              className={`bench-card-flag-club ${variant === 'normal' ? 'normal-club-flag' : 'hero-icon-club-flag'}`}
                            />
                          )}
                          {player.isUntradable && (
                            <div className="card-untradable-badge" style={{ right: '18px', pointerEvents: 'none' }}>
                              <img src="/assets/images/untradable_img.png" alt="Untradable" />
                            </div>
                          )}
                          <button
                            className="bench-card-remove"
                            onClick={(event) => {
                              event.stopPropagation();
                              removeBenchPlayer(index);
                            }}
                            type="button"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div id="badges-modal" className="modal" style={{ display: badgesModalOpen ? 'flex' : 'none' }}>
          <div className="modal-backdrop" onClick={() => setBadgesModalOpen(false)} />
          <div className="badges-modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="badges-modal-header">
              <h2>Select Team Badges</h2>
              <button className="modal-close-btn" onClick={() => setBadgesModalOpen(false)} type="button">
                ×
              </button>
            </div>

            <div className="badges-grid">
              {[1, 2, 3].map((badgeNumber) => {
                const badgeKey = `badge${badgeNumber}`;
                const isActive = !!badges[badgeKey];
                return (
                  <div
                    key={badgeKey}
                    className={`badge-card ${isActive ? 'active' : ''}`}
                    id={`badge-card-${badgeNumber}`}
                    onClick={() => toggleBadge(badgeNumber)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        toggleBadge(badgeNumber);
                      }
                    }}
                  >
                    <div className="badge-icon">
                      <svg width="60" height="60" viewBox="0 0 60 60" fill="none" aria-hidden="true">
                        <path
                          d="M30 5L35 20L50 20L38 30L43 45L30 37L17 45L22 30L10 20L25 20L30 5Z"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                    </div>
                    <h3>Badge {badgeNumber}</h3>
                    <div className="badge-boost">+1 OVR</div>
                    <div className="badge-checkbox">
                      <span className="checkmark">✓</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="badges-modal-footer">
              <button className="btn-primary" onClick={() => setBadgesModalOpen(false)} type="button">
                Done
              </button>
            </div>
          </div>
        </div>

        <div
          id="theme-selector-overlay"
          className="theme-selector-overlay"
          style={{ display: themeSelectorOpen ? 'flex' : 'none' }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setThemeSelectorOpen(false);
            }
          }}
        >
          <div className="theme-selector-content" onClick={(event) => event.stopPropagation()}>
            <div className="theme-selector-header">
              <h3>Select Field Theme</h3>
              <button id="close-theme-selector" className="theme-close-btn" onClick={() => setThemeSelectorOpen(false)} type="button">
                ✕
              </button>
            </div>
            <div id="theme-gallery" className="theme-gallery">
              {Object.values(FIELD_THEMES).map((theme) => (
                <div
                  key={theme.id}
                  className={`theme-option ${fieldThemeDraft === theme.id ? 'active' : ''}`}
                  data-theme-id={theme.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setFieldThemeDraft(theme.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setFieldThemeDraft(theme.id);
                    }
                  }}
                >
                  <div className="theme-option-preview" style={{ background: theme.background, backgroundAttachment: 'fixed' }}>
                    <div className="theme-option-name">{theme.name}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="theme-selector-footer">
              <button id="apply-theme-btn" className="apply-theme-btn" onClick={applyThemeSelection} type="button">
                Apply Theme
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedCustomizationPlayer && (
        <SquadPlayerCustomizationModal
          player={{
            ...selectedCustomizationPlayer,
            slotId: selectedPlayerForCustomization?.slotId || '',
            benchIndex: Number.isInteger(selectedPlayerForCustomization?.benchIndex)
              ? selectedPlayerForCustomization.benchIndex
              : null
          }}
          onClose={closeSquadPlayerCustomizationModal}
          onUpdatePlayer={updateSquadPlayerCustomization}
        />
      )}

      <ComparePlayersTool
        isActive={isCompareActive}
        normalizedPlayers={normalizedPlayers}
        playersById={playersById}
        onClose={closeOpenTool}
        onUpdatePlayer={upsertCustomizedPlayer}
      />
    </>
  );
}
