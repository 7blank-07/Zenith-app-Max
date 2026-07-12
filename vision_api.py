from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import os
import unicodedata
import re

app = FastAPI(title="Zenith FC Mobile API", version="1.1.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database configurations
DB_CONFIG = {
    'host': '157.230.249.27',
    'database': 'zenith_data',
    'user': 'zenith_bot',
    'password': 'zenith6Z@',
    'port': 5432
}

MARKET_DB_CONFIG = {
    'host': '157.230.249.27',
    'database': 'zenith_market',
    'user': 'zenith_bot',
    'password': 'zenith6Z@',
    'port': 5432
}

# ==================== HELPER FUNCTIONS ====================

def remove_accents(text: str) -> str:
    """Remove accents/diacritics from text. Raúl -> Raul, Eusébio -> Eusebio"""
    if not text:
        return ""
    nfd = unicodedata.normalize('NFD', text)
    return ''.join(char for char in nfd if unicodedata.category(char) != 'Mn')

def clean_name(s: str) -> str:
    """Clean name for matching: lowercase, remove special chars"""
    if not s:
        return ""
    return re.sub(r"[^a-z0-9\s]", "", s.lower()).strip()

# ==================== DATABASE ====================

def get_db_connection():
    """Create database connection for business data with dict cursor"""
    try:
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Database connection error: {e}")
        raise HTTPException(status_code=500, detail="Database connection failed")

def get_market_db_connection():
    """Create database connection for market data with dict cursor"""
    try:
        conn = psycopg2.connect(**MARKET_DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        print(f"Market database connection error: {e}")
        raise HTTPException(status_code=500, detail="Market database connection failed")

def fetch_prices_batch(player_ids: List[str], rank: int = 0):
    """Fetch prices for a batch of players from zenith_market"""
    if not player_ids:
        return {}
    
    try:
        conn = get_market_db_connection()
        cur = conn.cursor()
        
        # Use the latest_prices view for efficiency
        price_col = f"price{rank}"
        # ✅ SQL AUDIT: Added list wrapper check for safety
        query = f"SELECT asset_id, {price_col} as price FROM latest_prices WHERE asset_id IN %s"
        cur.execute(query, (tuple(player_ids),))
        
        rows = cur.fetchall()
        cur.close()
        conn.close()
        
        return {str(row['asset_id']): row['price'] for row in rows}
    except Exception as e:
        print(f"[ERROR] Batch price fetch failed: {e}")
        return {}

# ==================== HEALTH CHECK ====================

@app.get("/")
def root():
    return {
        "status": "online",
        "app": "Zenith FC Mobile API",
        "version": "1.1.0"
    }

@app.get("/health")
def health_check():
    """Check API and database health"""
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) as count FROM vision_players")
        result = cur.fetchone()
        cur.close()
        conn.close()

        # Also check market DB
        try:
            market_conn = get_market_db_connection()
            market_cur = market_conn.cursor()
            market_cur.execute("SELECT COUNT(*) as count FROM price_snapshots")
            market_result = market_cur.fetchone()
            market_cur.close()
            market_conn.close()
            market_status = "connected"
            snapshot_count = market_result['count']
        except Exception as market_e:
            print(f"Market health check error: {market_e}")
            market_status = f"error: {str(market_e)}"
            snapshot_count = 0

        return {
            "status": "healthy",
            "database": "connected",
            "market_database": market_status,
            "total_players": result['count'],
            "total_price_snapshots": snapshot_count
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }

# ==================== PLAYER ENDPOINTS ====================

@app.get("/api/players")
def get_players(
    q: Optional[str] = Query(None, description="Search query anywhere in name"),
    limit: int = Query(100, le=1000, description="Max 1000 players per request"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    position: Optional[str] = Query(None, description="Filter by position"),
    min_ovr: Optional[int] = Query(None, ge=0, le=120, description="Min OVR"),
    max_ovr: Optional[int] = Query(None, ge=0, le=120, description="Max OVR"),
    team: Optional[str] = Query(None, description="Filter by team name"),
    league: Optional[str] = Query(None, description="Filter by league"),
    nation: Optional[str] = Query(None, description="Filter by nation"),
    event: Optional[str] = Query(None, description="Filter by event"),
    rank: Optional[int] = Query(None, ge=0, le=5, description="Filter by rank (0-5)"),
    name_starts_with: Optional[str] = Query(None, min_length=1, description="Search starts with"),
    skill_moves: Optional[int] = None,
    is_untradable: Optional[int] = None,
    sort_by: Optional[str] = Query(None, description="Sort field: ovr"),
    order: Optional[str] = Query(None, description="Sort direction: asc or desc"),
    include_price: bool = Query(True, description="Whether to include price in response")
):
    conn = get_db_connection()
    cur = conn.cursor()

    query = '''
        SELECT p.*, a.stats 
        FROM vision_players p 
        LEFT JOIN vision_player_attributes a ON p.player_id = a.player_id 
        WHERE 1=1
    '''
    params = []

    if q:
        q_cleaned = q.replace(' ', '%')
        query += " AND p.card_name ILIKE %s"
        params.append(f"%{q_cleaned}%")
    if name_starts_with:
        query += " AND p.card_name ILIKE %s"
        params.append(f"{name_starts_with}%")
    if position:
        query += " AND p.position = %s"
        params.append(position.upper())
    if team:
        query += " AND p.club ILIKE %s"
        params.append(team)
    if league:
        query += " AND p.league ILIKE %s"
        params.append(league)
    if nation:
        query += " AND p.nation ILIKE %s"
        params.append(nation)
    if min_ovr:
        query += " AND p.ovr >= %s"
        params.append(min_ovr)
    if max_ovr:
        query += " AND p.ovr <= %s"
        params.append(max_ovr)
    if event:
        query += " AND p.event_name ILIKE %s"
        params.append(f"%{event}%")
    if skill_moves:
        query += " AND p.skill_moves_stars = %s"
        params.append(skill_moves)
    if is_untradable is not None:
        query += " AND p.is_untradable = %s"
        params.append(bool(is_untradable))

    sort_direction = 'ASC' if order == 'asc' else 'DESC'
    
    # If they want latest players (sort_by=date_added)
    if sort_by == 'date_added':
        query += f" ORDER BY p.updated_at {sort_direction}, p.card_name ASC LIMIT %s OFFSET %s"
    else:
        query += f" ORDER BY p.ovr {sort_direction}, p.card_name ASC LIMIT %s OFFSET %s"
        
    params.extend([limit, offset])

    try:
        cur.execute(query, params)
        raw_players = [dict(row) for row in cur.fetchall()]
        
        # Get total count
        count_query = "SELECT COUNT(*) as total FROM vision_players p WHERE 1=1"
        count_params = []
        if q: count_query += " AND p.card_name ILIKE %s"; count_params.append(f"%{q.replace(' ', '%')}%")
        if name_starts_with: count_query += " AND p.card_name ILIKE %s"; count_params.append(f"{name_starts_with}%")
        if position and not q: count_query += " AND p.position = %s"; count_params.append(position.upper())
        elif position: count_query += " AND p.position = %s"; count_params.append(position.upper())
        if team: count_query += " AND p.club ILIKE %s"; count_params.append(team)
        if league: count_query += " AND p.league ILIKE %s"; count_params.append(league)
        if nation: count_query += " AND p.nation ILIKE %s"; count_params.append(nation)
        if min_ovr: count_query += " AND p.ovr >= %s"; count_params.append(min_ovr)
        if max_ovr: count_query += " AND p.ovr <= %s"; count_params.append(max_ovr)
        if event: count_query += " AND p.event_name ILIKE %s"; count_params.append(f"%{event}%")
        if skill_moves: count_query += " AND p.skill_moves_stars = %s"; count_params.append(skill_moves)
        if is_untradable is not None: count_query += " AND p.is_untradable = %s"; count_params.append(bool(is_untradable))
        
        cur.execute(count_query, count_params)
        total_count = cur.fetchone()['total']
    except Exception as e:
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=f"Database query failed: {str(e)}")

    mapped_players = []
    for p in raw_players:
        stats = p.get('stats') or {}
        mapped_players.append({
            'player_id': p['player_id'],
            'id': p['player_id'],
            'rank': rank or 0,
            'training_level': 0,
            'name': p.get('card_name') or p.get('full_name') or 'Unknown',
            'position': p.get('position', ''),
            'alternate_position': '',
            'team': '',
            'league': '',
            'nation_region': '',
            'skill_moves_stars': p.get('skill_moves_stars', 0),
            'strong_foot_side': '',
            'strong_foot_stars': p.get('preferred_foot', ''),
            'weak_foot_stars': 0,
            'height_ft_in': '',
            'height_cm': p.get('height', ''),
            'weight_kg': p.get('weight', ''),
            'work_rate_attack': p.get('work_rate_att', ''),
            'work_rate_defense': p.get('work_rate_def', ''),
            'date_added': str(p.get('updated_at', '')),
            'ovr': p.get('ovr', 0),
            'player_image': p.get('portrait_url', ''),
            'card_background': '',
            'nation_flag': '',
            'club_flag': '',
            'event': p.get('event_name', ''),
            'is_untradable': False,
            
            # Key Stats
            'pace': stats.get('Pace', 0),
            'shooting': stats.get('Shooting', 0),
            'passing': stats.get('Passing', 0),
            'dribbling': stats.get('Dribbling', 0),
            'defending': stats.get('Defending', 0),
            'physical': stats.get('Physical', 0),
            'acceleration': stats.get('Acceleration', 0),
            'sprint_speed': stats.get('Sprint Speed', 0),
            'finishing': stats.get('Finishing', 0),
            'long_shot': stats.get('Long Shot', 0),
            'shot_power': stats.get('Shot Power', 0),
            'positioning': stats.get('Positioning', 0),
            'volley': stats.get('Volley', 0),
            'penalties': stats.get('Penalties', 0),
            'short_passing': stats.get('Short Passing', 0),
            'long_passing': stats.get('Long Passing', 0),
            'vision': stats.get('Vision', 0),
            'crossing': stats.get('Crossing', 0),
            'curve': stats.get('Curve', 0),
            'free_kick': stats.get('Free Kick', 0),
            'balance': stats.get('Balance', 0),
            'agility': stats.get('Agility', 0),
            'reactions': stats.get('Reactions', 0),
            'ball_control': stats.get('Ball Control', 0),
            'marking': stats.get('Marking', 0),
            'standing_tackle': stats.get('Standing Tackle', 0),
            'sliding_tackle': stats.get('Sliding Tackle', 0),
            'awareness': stats.get('Awareness', 0),
            'heading': stats.get('Heading', 0),
            'strength': stats.get('Strength', 0),
            'aggression': stats.get('Aggression', 0),
            'jumping': stats.get('Jumping', 0),
            'diving': stats.get('Diving', 0),
            'handling': stats.get('Handling', 0),
            'kicking': stats.get('Kicking', 0),
            'reflexes': stats.get('Reflexes', 0),
            'gk_diving': stats.get('Diving_Stat', 0),
            'gk_positioning': stats.get('Positioning_Stat', 0),
            'gk_handling': stats.get('Handling_Stat', 0),
            'gk_reflexes': stats.get('Reflexes_Stat', 0),
            'gk_kicking': stats.get('Kicking_Stat', 0)
        })

    if include_price:
        resolved_rank = rank if rank is not None else 0
        player_ids = [str(p['player_id']) for p in mapped_players]
        prices = fetch_prices_batch(player_ids, resolved_rank)
        for p in mapped_players:
            p['price'] = prices.get(str(p['player_id']), 0)

    cur.close()
    conn.close()

    return {
        "players": mapped_players,
        "pagination": {
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total_count
        }
    }



def map_vision_player_to_legacy(p, rank=0):
    stats = p.get('stats') or {}
    return {
        'player_id': p['player_id'],
        'id': p['player_id'],
        'rank': rank or 0,
        'training_level': 0,
        'name': p.get('card_name') or p.get('full_name') or 'Unknown',
        'position': p.get('position', ''),
        'alternate_position': '',
        'team': '',
        'league': '',
        'nation_region': '',
        'skill_moves_stars': p.get('skill_moves_stars', 0),
        'strong_foot_side': '',
        'strong_foot_stars': p.get('preferred_foot', ''),
        'weak_foot_stars': 0,
        'height_ft_in': '',
        'height_cm': p.get('height', ''),
        'weight_kg': p.get('weight', ''),
        'work_rate_attack': p.get('work_rate_att', ''),
        'work_rate_defense': p.get('work_rate_def', ''),
        'date_added': str(p.get('updated_at', '')),
        'ovr': p.get('ovr', 0),
        'player_image': p.get('portrait_url', ''),
        'card_background': '',
        'nation_flag': '',
        'club_flag': '',
        'event': p.get('event_name', ''),
        'is_untradable': False,
        'traits_name': p.get('traits_name', ''),
        'traits': p.get('traits', ''),
        
        # Key Stats
        'pace': stats.get('Pace', 0),
        'shooting': stats.get('Shooting', 0),
        'passing': stats.get('Passing', 0),
        'dribbling': stats.get('Dribbling', 0),
        'defending': stats.get('Defending', 0),
        'physical': stats.get('Physical', 0),
        'acceleration': stats.get('Acceleration', 0),
        'sprint_speed': stats.get('Sprint Speed', 0),
        'finishing': stats.get('Finishing', 0),
        'long_shot': stats.get('Long Shot', 0),
        'shot_power': stats.get('Shot Power', 0),
        'positioning': stats.get('Positioning', 0),
        'volley': stats.get('Volley', 0),
        'penalties': stats.get('Penalties', 0),
        'short_passing': stats.get('Short Passing', 0),
        'long_passing': stats.get('Long Passing', 0),
        'vision': stats.get('Vision', 0),
        'crossing': stats.get('Crossing', 0),
        'curve': stats.get('Curve', 0),
        'free_kick': stats.get('Free Kick', 0),
        'balance': stats.get('Balance', 0),
        'agility': stats.get('Agility', 0),
        'reactions': stats.get('Reactions', 0),
        'ball_control': stats.get('Ball Control', 0),
        'marking': stats.get('Marking', 0),
        'standing_tackle': stats.get('Standing Tackle', 0),
        'sliding_tackle': stats.get('Sliding Tackle', 0),
        'awareness': stats.get('Awareness', 0),
        'heading': stats.get('Heading', 0),
        'strength': stats.get('Strength', 0),
        'aggression': stats.get('Aggression', 0),
        'jumping': stats.get('Jumping', 0),
        'diving': stats.get('Diving', 0),
        'handling': stats.get('Handling', 0),
        'kicking': stats.get('Kicking', 0),
        'reflexes': stats.get('Reflexes', 0),
        'gk_diving': stats.get('Diving_Stat', 0),
        'gk_positioning': stats.get('Positioning_Stat', 0),
        'gk_handling': stats.get('Handling_Stat', 0),
        'gk_reflexes': stats.get('Reflexes_Stat', 0),
        'gk_kicking': stats.get('Kicking_Stat', 0)
    }

@app.get("/api/players/search")
def search_players(
    q: Optional[str] = Query("", description="Search query"),
    limit: int = Query(20, le=100),
    offset: int = Query(0, ge=0),
    rank: int = Query(0),
    include_price: bool = Query(True)
):
    conn = get_db_connection()
    cur = conn.cursor()
    query = '''
        SELECT p.*, a.stats 
        FROM vision_players p 
        LEFT JOIN vision_player_attributes a ON p.player_id = a.player_id 
        WHERE p.card_name ILIKE %s OR p.full_name ILIKE %s
        ORDER BY p.ovr DESC LIMIT %s OFFSET %s
    '''
    try:
        cur.execute(query, (f"{q}%", f"%{q}%", limit, offset))
        raw_players = [dict(row) for row in cur.fetchall()]
    except Exception as e:
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
        
    mapped = [map_vision_player_to_legacy(p, rank) for p in raw_players]
    
    if include_price:
        player_ids = [str(p['player_id']) for p in mapped]
        prices = fetch_prices_batch(player_ids, rank)
        for p in mapped: p['price'] = prices.get(str(p['player_id']), 0)
        
    cur.close()
    conn.close()
    return {"players": mapped, "pagination": {"limit": limit, "offset": offset}}

@app.get("/api/players/by-ids")
def get_players_by_ids(
    ids: str = Query(..., description="Comma-separated IDs"),
    rank: int = Query(0),
    include_price: bool = Query(True)
):
    id_list = [i.strip() for i in ids.split(',') if i.strip()]
    if not id_list: return []
    
    conn = get_db_connection()
    cur = conn.cursor()
    query = '''
        SELECT p.*, a.stats 
        FROM vision_players p 
        LEFT JOIN vision_player_attributes a ON p.player_id = a.player_id 
        WHERE p.player_id = ANY(%s)
    '''
    try:
        cur.execute(query, (id_list,))
        raw_players = [dict(row) for row in cur.fetchall()]
    except Exception as e:
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
        
    mapped = [map_vision_player_to_legacy(p, rank) for p in raw_players]
    
    if include_price:
        player_ids = [str(p['player_id']) for p in mapped]
        prices = fetch_prices_batch(player_ids, rank)
        for p in mapped: p['price'] = prices.get(str(p['player_id']), 0)
        
    cur.close()
    conn.close()
    return mapped

@app.get("/api/players/{player_id}")
def get_player_by_id(
    player_id: str,
    rank: int = Query(0),
    include_price: bool = Query(True)
):
    conn = get_db_connection()
    cur = conn.cursor()
    query = '''
        SELECT p.*, a.stats,
            (SELECT STRING_AGG(t.trait_name, ',') FROM vision_player_traits t WHERE t.player_id = p.player_id) as traits_name,
            (SELECT STRING_AGG(t.image_url, ',') FROM vision_player_traits t WHERE t.player_id = p.player_id) as traits,
            (
                SELECT json_agg(
                    json_build_object(
                        'playstyle_name', ps.playstyle_name,
                        'level', CASE WHEN ps.playstyle_level ILIKE '%%2%%' THEN 2 ELSE 1 END,
                        'icon_level_1', ps.image_url,
                        'icon_level_2', ps.image_url,
                        'description', ps.playstyle_description
                    )
                )
                FROM vision_player_playstyles ps WHERE ps.player_id = p.player_id
            ) as playstyles
        FROM vision_players p 
        LEFT JOIN vision_player_attributes a ON p.player_id = a.player_id 
        WHERE p.player_id = %s
    '''
    try:
        cur.execute(query, (player_id,))
        row = cur.fetchone()
    except Exception as e:
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))
        
    if not row:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Player not found")
        
    mapped = map_vision_player_to_legacy(dict(row), rank)
    
    # Map playstyles explicitly
    if row.get('playstyles'):
        mapped['playstyles'] = row['playstyles']
    else:
        mapped['playstyles'] = []
    
    
    if include_price:
        prices = fetch_prices_batch([player_id], rank)
        mapped['price'] = prices.get(player_id, 0)
        
    cur.close()
    conn.close()
    return mapped


@app.get("/api/skills")
def get_all_skills():
    """Get all available skills in the game"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT * FROM skills_catalog ORDER BY skill_name")
    skills = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "skills": [dict(s) for s in skills],
        "count": len(skills)
    }

@app.get("/api/skill-boosts/{skill_id}")
def get_skill_boosts(skill_id: int):
    """Get stat boosts for a specific skill at all levels"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT ON (level_number)
            level_number,
            boost_pace, boost_shooting, boost_passing, boost_dribbling,
            boost_defending, boost_physical, boost_acceleration, boost_sprint_speed,
            boost_finishing, boost_shot_power, boost_long_shot, boost_positioning,
            boost_volley, boost_penalties, boost_short_passing, boost_long_passing,
            boost_crossing, boost_curve, boost_free_kick, boost_vision,
            boost_ball_control, boost_agility, boost_reactions, boost_balance,
            boost_composure, boost_interceptions, boost_heading, boost_marking,
            boost_standing_tackle, boost_sliding_tackle, boost_awareness,
            boost_jumping, boost_stamina, boost_strength, boost_aggression,
            boost_gk_diving, boost_gk_handling, boost_gk_kicking,
            boost_gk_positioning, boost_gk_reflexes, boost_long_shot_accuracy,
            boost_free_kick_accuracy
        FROM vision_player_skills
        WHERE skill_id = %s
        ORDER BY level_number ASC
    """, (skill_id,))

    boosts = cur.fetchall()

    if not boosts:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="Skill not found")

    cur.close()
    conn.close()

    return {
        "skill_id": skill_id,
        "boosts": [dict(b) for b in boosts]
    }


# ==================== FILTER OPTIONS ====================

@app.get("/api/filters/positions")
def get_positions():
    """Get all unique positions for filter dropdown"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT position
        FROM vision_players
        WHERE position IS NOT NULL
        ORDER BY position
    """)

    positions = [row['position'] for row in cur.fetchall()]
    cur.close()
    conn.close()

    return {"positions": positions}

@app.get("/api/filters/teams")
def get_teams():
    """Get all unique teams for filter dropdown WITH club flags"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT team, club_flag
        FROM vision_players
        WHERE team IS NOT NULL
        AND team != ''
        AND rank = 0
        ORDER BY team
    """)

    teams = [dict(row) for row in cur.fetchall()]

    cur.close()
    conn.close()

    return {"teams": teams}


@app.get("/api/filters/leagues")
def get_leagues():
    """Get all unique leagues for filter dropdown WITH league images"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT league, league_image
        FROM vision_players
        WHERE league IS NOT NULL
        AND league != ''
        AND rank = 0
        ORDER BY league
    """)

    leagues = [dict(row) for row in cur.fetchall()]

    cur.close()
    conn.close()

    return {"leagues": leagues}



@app.get("/api/filters/nations")
def get_nations():
    """Get all unique nations for filter dropdown"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT nation_region as nation
        FROM vision_players
        WHERE nation_region IS NOT NULL AND rank = 0
        ORDER BY nation_region
        LIMIT 200
    """)

    nations = [row['nation'] for row in cur.fetchall()]
    cur.close()
    conn.close()

    return {"nations": nations}

@app.get("/api/filters/events")
def get_events():
    """Get all unique events for filter dropdown"""
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT DISTINCT event
        FROM vision_players
        WHERE event IS NOT NULL AND event != '' AND rank = 0
        ORDER BY event
    """)

    events = [row['event'] for row in cur.fetchall()]
    cur.close()
    conn.close()

    return {"events": events}

# ==================== STATISTICS ====================

@app.get("/api/stats/summary")
def get_database_stats():
    """Get overall database statistics"""
    conn = get_db_connection()
    cur = conn.cursor()

    # Total unique players
    cur.execute("SELECT COUNT(DISTINCT player_id) as count FROM vision_players")
    total_players = cur.fetchone()['count']

    # Total skills
    cur.execute("SELECT COUNT(*) as count FROM skills_catalog")
    total_skills = cur.fetchone()['count']

    # Position distribution (rank 0 only)
    cur.execute("""
        SELECT position, COUNT(*) as count
        FROM vision_players
        WHERE rank = 0
        GROUP BY position
        ORDER BY count DESC
    """)
    position_dist = cur.fetchall()

    # Top OVR players (rank 0)
    cur.execute("""
        SELECT name, position, ovr, team, player_image
        FROM vision_players
        WHERE rank = 0
        ORDER BY ovr DESC
        LIMIT 10
    """)
    top_players = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "total_players": total_players,
        "total_skills": total_skills,
        "position_distribution": [dict(p) for p in position_dist],
        "top_players": [dict(p) for p in top_players]
    }

# ==================== TrainingBoosts====================
@app.get("/api/training/boosts")
def get_training_boosts(
    position: str = Query(..., description="Player position (ST, CM, CB, GK, etc.)"),
    level: int = Query(..., ge=1, le=30, description="Training level (1-30)")
):
    """
    Get training stat boosts for a position at a specific level.
    Returns the CUMULATIVE totals at that level (not summed increments).
    """
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT * FROM position_training_calc
            WHERE position = %s
            AND training_level = %s
        """, (position.upper(), level))

        row = cur.fetchone()

        if not row:
            cur.close()
            conn.close()
            return {
                "position": position.upper(),
                "level": level,
                "boosts": {},
                "message": "No training data found for this position"
            }

        boosts = {}
        for key, value in dict(row).items():
            if key in ['id', 'position', 'training_level']:
                continue

            if value is not None:
                try:
                    boosts[key] = int(value)
                except (ValueError, TypeError):
                    pass

        cur.close()
        conn.close()

        return {
            "position": position.upper(),
            "level": level,
            "boosts": boosts
        }

    except Exception as e:
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/skills/allocations/{user_id}/{player_id}")
def get_user_skill_allocations(
    user_id: int,
    player_id: int,
    rank: int = Query(0, ge=0, le=5, description="Player rank")
):
    """
    Get user's skill allocations for a specific player at a specific rank.
    Returns which skills the user has leveled up and to what level.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT skill_id, skill_level, updated_at
        FROM user_skill_allocations
        WHERE user_id = %s AND player_id = %s AND rank = %s
        ORDER BY skill_id
    """, (user_id, player_id, rank))

    allocations = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "user_id": user_id,
        "player_id": player_id,
        "rank": rank,
        "allocations": [dict(a) for a in allocations],
        "total_points_spent": sum(a['skill_level'] for a in allocations)
    }


@app.post("/api/skills/upgrade")
def upgrade_skill(
    user_id: int = Query(..., description="User ID"),
    player_id: int = Query(..., description="Player ID"),
    rank: int = Query(..., ge=0, le=5, description="Player rank"),
    skill_id: int = Query(..., description="Skill to upgrade"),
    new_level: int = Query(..., ge=1, description="New skill level")
):
    """
    Upgrade a skill to a new level for a user's player.
    Validates skill points budget and prerequisites.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    try:
        cur.execute("""
            SELECT available_points
            FROM vision_player_skills_meta
            WHERE player_id = %s AND rank = %s AND training_level = 0
        """, (player_id, rank))

        meta = cur.fetchone()
        available_points = meta['available_points'] if meta else rank

        cur.execute("""
            SELECT skill_id, skill_level
            FROM user_skill_allocations
            WHERE user_id = %s AND player_id = %s AND rank = %s
        """, (user_id, player_id, rank))

        current_allocations = cur.fetchall()
        total_spent = sum(a['skill_level'] for a in current_allocations)

        current_level = 0
        for a in current_allocations:
            if a['skill_id'] == skill_id:
                current_level = a['skill_level']
                break

        points_needed = new_level - current_level

        if points_needed <= 0:
            raise HTTPException(status_code=400, detail="New level must be higher than current level")

        if total_spent + points_needed > available_points:
            raise HTTPException(status_code=400, detail=f"Not enough skill points. Available: {available_points - total_spent}")

        cur.execute("""
            SELECT prerequisite_skill_id, prerequisite_level
            FROM vision_player_available_skills
            WHERE player_id = %s AND rank = %s AND skill_id = %s
        """, (player_id, rank, skill_id))

        skill_info = cur.fetchone()

        if skill_info and skill_info['prerequisite_skill_id'] and skill_info['prerequisite_skill_id'] != 0:
            prereq_id = skill_info['prerequisite_skill_id']
            prereq_level = skill_info['prerequisite_level']

            prereq_met = False
            for a in current_allocations:
                if a['skill_id'] == prereq_id and a['skill_level'] >= prereq_level:
                    prereq_met = True
                    break

            if not prereq_met:
                raise HTTPException(status_code=400, detail=f"Prerequisite not met. Need skill {prereq_id} at level {prereq_level}")

        cur.execute("""
            INSERT INTO user_skill_allocations (user_id, player_id, rank, skill_id, skill_level)
            VALUES (%s, %s, %s, %s, %s)
            ON CONFLICT (user_id, player_id, rank, skill_id)
            DO UPDATE SET skill_level = %s, updated_at = NOW()
        """, (user_id, player_id, rank, skill_id, new_level, new_level))

        conn.commit()
        cur.close()
        conn.close()

        return {
            "success": True,
            "message": f"Skill upgraded to level {new_level}",
            "skill_id": skill_id,
            "new_level": new_level,
            "points_remaining": available_points - (total_spent + points_needed)
        }

    except HTTPException:
        raise
    except Exception as e:
        conn.rollback()
        cur.close()
        conn.close()
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/skills/reset")
def reset_skills(
    user_id: int = Query(..., description="User ID"),
    player_id: int = Query(..., description="Player ID"),
    rank: int = Query(..., ge=0, le=5, description="Player rank")
):
    """
    Reset all skill allocations for a user's player at a specific rank.
    """
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        DELETE FROM user_skill_allocations
        WHERE user_id = %s AND player_id = %s AND rank = %s
    """, (user_id, player_id, rank))

    deleted_count = cur.rowcount
    conn.commit()
    cur.close()
    conn.close()

    return {
        "success": True,
        "message": f"Reset {deleted_count} skill allocations",
        "user_id": user_id,
        "player_id": player_id,
        "rank": rank
    }

from panel_api import router as panel_router
app.include_router(panel_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="info")

