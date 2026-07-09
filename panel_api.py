from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from pydantic import BaseModel
from typing import Optional, List
import psycopg2
from psycopg2.extras import RealDictCursor
import uuid
import os
import shutil

router = APIRouter(prefix="/api/panel", tags=["Panel"])

DB_CONFIG = {
    'host': '157.230.249.27',
    'database': 'zenith_data',
    'user': 'zenith_bot',
    'password': 'zenith6Z@',
    'port': 5432
}

def get_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG, cursor_factory=RealDictCursor)
        return conn
    except Exception as e:
        raise HTTPException(status_code=500, detail="Database connection failed")

# ==================== PLAYSTYLES ====================

@router.get("/playstyles")
def get_playstyles():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT INITCAP(TRIM(playstyle_name)) as name, playstyle_level as level, 
               MAX(playstyle_description) as description, 
               MAX(image_url) as icon_url
        FROM vision_player_playstyles
        WHERE playstyle_name IS NOT NULL
        GROUP BY INITCAP(TRIM(playstyle_name)), playstyle_level
        ORDER BY INITCAP(TRIM(playstyle_name)) ASC, playstyle_level ASC
    """)
    playstyles = cur.fetchall()
    cur.close()
    conn.close()
    # Create a unique ID for the frontend to use as key
    for idx, p in enumerate(playstyles):
        p['id'] = f"{p['name']}_{p['level']}"
    return {"playstyles": [dict(p) for p in playstyles]}

class PlaystyleUpdate(BaseModel):
    old_name: str
    old_level: str
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None

@router.put("/playstyles/update")
def update_playstyle(data: PlaystyleUpdate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE vision_player_playstyles
            SET playstyle_name = %s, playstyle_description = %s, image_url = %s
            WHERE INITCAP(TRIM(playstyle_name)) = %s AND playstyle_level = %s
        """, (data.name, data.description, data.icon_url, data.old_name, data.old_level))
            
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
    
    return {"success": True, "message": "Playstyle updated and cascaded successfully"}

# ==================== TRAITS ====================

@router.get("/traits")
def get_traits():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("""
        SELECT INITCAP(TRIM(trait_name)) as name, MAX(image_url) as icon_url
        FROM vision_player_traits
        WHERE trait_name IS NOT NULL
        GROUP BY INITCAP(TRIM(trait_name))
        ORDER BY INITCAP(TRIM(trait_name)) ASC
    """)
    traits = cur.fetchall()
    cur.close()
    conn.close()
    for t in traits:
        t['id'] = t['name']
    return {"traits": [dict(t) for t in traits]}

class TraitUpdate(BaseModel):
    old_name: str
    name: str
    icon_url: Optional[str] = None

@router.put("/traits/update")
def update_trait(data: TraitUpdate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("""
            UPDATE vision_player_traits
            SET trait_name = %s, image_url = %s
            WHERE INITCAP(TRIM(trait_name)) = %s
        """, (data.name, data.icon_url, data.old_name))
            
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
    
    return {"success": True, "message": "Trait updated and cascaded successfully"}

# ==================== PLAYERS ====================

class PlayerUpdate(BaseModel):
    full_name: Optional[str] = None
    card_name: Optional[str] = None
    ovr: Optional[int] = None
    position: Optional[str] = None
    height: Optional[str] = None
    weight: Optional[str] = None
    event_name: Optional[str] = None
    is_untradable: Optional[bool] = None
    portrait_url: Optional[str] = None
    
    # Extra fields
    skill_moves_stars: Optional[int] = None
    preferred_foot: Optional[str] = None
    work_rate_att: Optional[str] = None
    work_rate_def: Optional[str] = None
    nation_name: Optional[str] = None
    league_name: Optional[str] = None
    
    stats: Optional[dict] = None
    traits: Optional[list] = None
    playstyles: Optional[list] = None

@router.post("/players")
def create_player(data: PlayerUpdate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        player_id = uuid.uuid4().hex
        
        # Insert into vision_players
        core_fields = [
            'full_name', 'card_name', 'ovr', 'position', 'height', 'weight', 'event_name', 
            'is_untradable', 'portrait_url', 'skill_moves_stars', 'preferred_foot', 
            'work_rate_att', 'work_rate_def', 'nation_name', 'league_name'
        ]
        
        insert_cols = ['player_id']
        insert_vals = [player_id]
        placeholders = ['%s']
        
        for key in core_fields:
            val = getattr(data, key)
            if val is not None:
                insert_cols.append(key)
                insert_vals.append(val)
                placeholders.append('%s')
                
        cur.execute(f"INSERT INTO vision_players ({', '.join(insert_cols)}) VALUES ({', '.join(placeholders)})", insert_vals)

        if data.stats:
            import json
            stats_json = json.dumps(data.stats)
            cur.execute("""
                INSERT INTO vision_player_attributes (player_id, stats)
                VALUES (%s, %s)
            """, (player_id, stats_json))
            
        if data.traits:
            for t_idx, trait_name in enumerate(data.traits):
                # We do not have image_url here, but it can be left null or joined later
                cur.execute("""
                    INSERT INTO vision_player_traits (player_id, trait_number, trait_name)
                    VALUES (%s, %s, %s)
                """, (player_id, t_idx + 1, trait_name))
                
        if data.playstyles:
            for p in data.playstyles:
                cur.execute("""
                    INSERT INTO vision_player_playstyles (player_id, playstyle_name, playstyle_level)
                    VALUES (%s, %s, %s)
                """, (player_id, p.get('name'), p.get('level')))
                
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
    
    return {"success": True, "message": "Player created successfully", "player_id": player_id}

@router.delete("/players/{player_id}")
def delete_player(player_id: str):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("DELETE FROM vision_players WHERE player_id = %s", (player_id,))
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="Player not found")
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
    
    return {"success": True, "message": "Player deleted successfully"}

@router.put("/players/{player_id}")
def update_player(player_id: str, data: PlayerUpdate):
    conn = get_db_connection()
    cur = conn.cursor()
    try:
        cur.execute("SELECT 1 FROM vision_players WHERE player_id = %s", (player_id,))
        if not cur.fetchone():
            raise HTTPException(status_code=404, detail="Player not found")

        updates = []
        params = []
        
        core_fields = [
            'full_name', 'card_name', 'ovr', 'position', 'height', 'weight', 'event_name', 
            'is_untradable', 'portrait_url', 'skill_moves_stars', 'preferred_foot', 
            'work_rate_att', 'work_rate_def', 'nation_name', 'league_name'
        ]
        
        for key in core_fields:
            val = getattr(data, key)
            if val is not None:
                updates.append(f"{key} = %s")
                params.append(val)
                
        if updates:
            params.append(player_id)
            cur.execute(f"UPDATE vision_players SET {', '.join(updates)}, updated_at = NOW() WHERE player_id = %s", params)

        if data.stats:
            import json
            stats_json = json.dumps(data.stats)
            cur.execute("""
                INSERT INTO vision_player_attributes (player_id, stats)
                VALUES (%s, %s)
                ON CONFLICT (player_id)
                DO UPDATE SET stats = %s
            """, (player_id, stats_json, stats_json))
            
        if data.traits is not None:
            cur.execute("DELETE FROM vision_player_traits WHERE player_id = %s", (player_id,))
            for t_idx, trait_name in enumerate(data.traits):
                cur.execute("""
                    INSERT INTO vision_player_traits (player_id, trait_number, trait_name)
                    VALUES (%s, %s, %s)
                """, (player_id, t_idx + 1, trait_name))
                
        if data.playstyles is not None:
            cur.execute("DELETE FROM vision_player_playstyles WHERE player_id = %s", (player_id,))
            for p in data.playstyles:
                cur.execute("""
                    INSERT INTO vision_player_playstyles (player_id, playstyle_name, playstyle_level)
                    VALUES (%s, %s, %s)
                """, (player_id, p.get('name'), p.get('level')))
            
        conn.commit()
    except Exception as e:
        conn.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        cur.close()
        conn.close()
    
    return {"success": True, "message": "Player updated successfully"}

# ==================== UPLOAD ====================

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    upload_dir = "/var/www/images.zenithfcm.com/uploads"
    if not os.path.exists(upload_dir):
        upload_dir = "public/uploads"
        
    os.makedirs(upload_dir, exist_ok=True)
    
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    final_url = f"https://images.zenithfcm.com/uploads/{unique_filename}"
    return {"url": final_url}
