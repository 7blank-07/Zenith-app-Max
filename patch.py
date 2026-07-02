import re

with open('vision_api.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace get_players logic
new_func = """@app.get("/api/players")
def get_players(
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
    name_starts_with: Optional[str] = Query(None, min_length=1, description="Search"),
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

    if name_starts_with:
        query += " AND p.card_name ILIKE %s"
        params.append(f"{name_starts_with}%")
    if position:
        query += " AND p.position = %s"
        params.append(position.upper())
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
        count_query = "SELECT COUNT(*) as total FROM vision_players WHERE 1=1"
        count_params = []
        if name_starts_with: count_query += " AND card_name ILIKE %s"; count_params.append(f"{name_starts_with}%")
        if position: count_query += " AND position = %s"; count_params.append(position.upper())
        if min_ovr: count_query += " AND ovr >= %s"; count_params.append(min_ovr)
        if max_ovr: count_query += " AND ovr <= %s"; count_params.append(max_ovr)
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
            'jumping': stats.get('Jumping', 0)
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
"""

start_idx = code.find('@app.get("/api/players")')
end_idx = code.find('@app.get("/api/players/search")', start_idx)

if start_idx != -1 and end_idx != -1:
    new_code = code[:start_idx] + new_func + '\n\n' + code[end_idx:]
    with open('vision_api.py', 'w', encoding='utf-8') as f:
        f.write(new_code)
    print('Successfully patched get_players')
else:
    print('Failed to find get_players boundaries')
