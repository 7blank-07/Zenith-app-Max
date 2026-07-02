import re

with open('vision_api.py', 'r', encoding='utf-8') as f:
    code = f.read()

# The helper function and the new endpoints
new_code_block = """
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
        'jumping': stats.get('Jumping', 0)
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
        SELECT p.*, a.stats 
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
    
    if include_price:
        prices = fetch_prices_batch([player_id], rank)
        mapped['price'] = prices.get(player_id, 0)
        
    cur.close()
    conn.close()
    return mapped
"""

# I need to replace from @app.get("/api/players/search") down to the end of @app.get("/api/players/{player_id}")
start_idx = code.find('@app.get("/api/players/search")')
end_idx = code.find('@app.get("/api/skills")', start_idx)

if start_idx != -1 and end_idx != -1:
    new_code = code[:start_idx] + new_code_block + '\n\n' + code[end_idx:]
    
    # Also inject the map_vision_player_to_legacy function before @app.get("/api/players") if it doesn't exist
    # Actually, the block above includes it! So it will be placed right before /search
    
    with open('vision_api.py', 'w', encoding='utf-8') as f:
        f.write(new_code)
    print("Successfully patched remaining player endpoints!")
else:
    print(f"Failed to find boundaries! start_idx: {start_idx}, end_idx: {end_idx}")
