'use client';

import { useState } from 'react';
import { updatePlayerAction, createPlayerAction, deletePlayerAction } from '../../../actions/panel-actions';

export default function PlayerDetailEditor({ player }) {
  const isNew = !player.player_id;
  
  // Format initial traits and playstyles
  const initialTraits = player.traits 
    ? (Array.isArray(player.traits) ? player.traits.map(t => typeof t === 'string' ? t : (t.name || t.trait_name || '')).filter(Boolean).join(', ') : '') 
    : '';
    
  const initialPlaystyles = player.playstyles
    ? (Array.isArray(player.playstyles) ? player.playstyles.map(p => `${p.name || p.playstyle_name || ''} - ${p.level || p.playstyle_level || ''}`).filter(s => !s.startsWith(' -')).join('\n') : '')
    : '';

  const [formData, setFormData] = useState({
    // Core fields
    full_name: player.name || '',
    card_name: player.name || '',
    ovr: player.ovr || 0,
    position: player.position || '',
    event_name: player.event || '',
    portrait_url: player.player_image || '',
    height: player.height_cm || '',
    weight: player.weight_kg || '',
    skill_moves_stars: player.skill_moves_stars || 0,
    preferred_foot: player.strong_foot_stars || '',
    work_rate_att: player.work_rate_attack || '',
    work_rate_def: player.work_rate_defense || '',
    nation_name: player.nation_region || '',
    league_name: player.league || '',
    
    // Key Stats
    pace: player.pace || 0,
    shooting: player.shooting || 0,
    passing: player.passing || 0,
    dribbling: player.dribbling || 0,
    defending: player.defending || 0,
    physical: player.physical || 0,
    
    // Pace sub-stats
    acceleration: player.acceleration || 0,
    sprint_speed: player.sprint_speed || 0,
    
    // Shooting sub-stats
    finishing: player.finishing || 0,
    long_shot: player.long_shot || 0,
    shot_power: player.shot_power || 0,
    positioning: player.positioning || 0,
    volley: player.volley || 0,
    penalties: player.penalties || 0,
    
    // Passing sub-stats
    short_passing: player.short_passing || 0,
    long_passing: player.long_passing || 0,
    vision: player.vision || 0,
    crossing: player.crossing || 0,
    curve: player.curve || 0,
    free_kick: player.free_kick || 0,
    
    // Dribbling sub-stats
    dribbling_sub: player.dribbling || 0,
    balance: player.balance || 0,
    agility: player.agility || 0,
    reactions: player.reactions || 0,
    ball_control: player.ball_control || 0,
    
    // Defending sub-stats
    marking: player.marking || 0,
    standing_tackle: player.standing_tackle || 0,
    sliding_tackle: player.sliding_tackle || 0,
    awareness: player.awareness || 0,
    heading: player.heading || 0,
    
    // Physical sub-stats
    strength: player.strength || 0,
    aggression: player.aggression || 0,
    jumping: player.jumping || 0,
    
    // GK main stats
    gk_main_diving: player.diving || 0,
    gk_main_positioning: player.positioning || 0,
    gk_main_handling: player.handling || 0,
    gk_main_kicking: player.kicking || 0,
    gk_main_reflexes: player.reflexes || 0,
    
    // GK sub-stats
    gk_diving: player.gk_diving || 0,
    gk_positioning: player.gk_positioning || 0,
    gk_handling: player.gk_handling || 0,
    gk_reflexes: player.gk_reflexes || 0,
    gk_kicking: player.gk_kicking || 0,
    
    // Extras
    traits_text: initialTraits,
    playstyles_text: initialPlaystyles,
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      // Parse traits
      const traitsArray = formData.traits_text
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);
        
      // Parse playstyles
      const playstylesArray = formData.playstyles_text
        .split('\n')
        .map(line => {
          const parts = line.split('-');
          return parts.length >= 2 ? { name: parts[0].trim(), level: parts[1].trim() } : null;
        })
        .filter(Boolean);
        
      const payload = {
        full_name: formData.full_name,
        card_name: formData.card_name,
        ovr: parseInt(formData.ovr, 10) || 0,
        position: formData.position,
        height: formData.height,
        weight: formData.weight,
        event_name: formData.event_name,
        portrait_url: formData.portrait_url,
        skill_moves_stars: parseInt(formData.skill_moves_stars, 10) || 0,
        preferred_foot: formData.preferred_foot,
        work_rate_att: formData.work_rate_att,
        work_rate_def: formData.work_rate_def,
        nation_name: formData.nation_name,
        league_name: formData.league_name,
        traits: traitsArray,
        playstyles: playstylesArray,
        stats: {
          'Pace': parseInt(formData.pace, 10) || 0,
          'Shooting': parseInt(formData.shooting, 10) || 0,
          'Passing': parseInt(formData.passing, 10) || 0,
          'Dribbling': parseInt(formData.dribbling, 10) || 0,
          'Defending': parseInt(formData.defending, 10) || 0,
          'Physical': parseInt(formData.physical, 10) || 0,
          'Acceleration': parseInt(formData.acceleration, 10) || 0,
          'Sprint Speed': parseInt(formData.sprint_speed, 10) || 0,
          'Finishing': parseInt(formData.finishing, 10) || 0,
          'Long Shot': parseInt(formData.long_shot, 10) || 0,
          'Shot Power': parseInt(formData.shot_power, 10) || 0,
          'Positioning': parseInt(formData.positioning, 10) || 0,
          'Volley': parseInt(formData.volley, 10) || 0,
          'Penalties': parseInt(formData.penalties, 10) || 0,
          'Short Passing': parseInt(formData.short_passing, 10) || 0,
          'Long Passing': parseInt(formData.long_passing, 10) || 0,
          'Vision': parseInt(formData.vision, 10) || 0,
          'Crossing': parseInt(formData.crossing, 10) || 0,
          'Curve': parseInt(formData.curve, 10) || 0,
          'Free Kick': parseInt(formData.free_kick, 10) || 0,
          'Balance': parseInt(formData.balance, 10) || 0,
          'Agility': parseInt(formData.agility, 10) || 0,
          'Reactions': parseInt(formData.reactions, 10) || 0,
          'Ball Control': parseInt(formData.ball_control, 10) || 0,
          'Marking': parseInt(formData.marking, 10) || 0,
          'Standing Tackle': parseInt(formData.standing_tackle, 10) || 0,
          'Sliding Tackle': parseInt(formData.sliding_tackle, 10) || 0,
          'Awareness': parseInt(formData.awareness, 10) || 0,
          'Heading': parseInt(formData.heading, 10) || 0,
          'Strength': parseInt(formData.strength, 10) || 0,
          'Aggression': parseInt(formData.aggression, 10) || 0,
          'Jumping': parseInt(formData.jumping, 10) || 0,
          'Diving': parseInt(formData.gk_main_diving, 10) || 0,
          'Handling': parseInt(formData.gk_main_handling, 10) || 0,
          'Kicking': parseInt(formData.gk_main_kicking, 10) || 0,
          'Reflexes': parseInt(formData.gk_main_reflexes, 10) || 0,
          'Diving_Stat': parseInt(formData.gk_diving, 10) || 0,
          'Positioning_Stat': parseInt(formData.gk_positioning, 10) || 0,
          'Handling_Stat': parseInt(formData.gk_handling, 10) || 0,
          'Reflexes_Stat': parseInt(formData.gk_reflexes, 10) || 0,
          'Kicking_Stat': parseInt(formData.gk_kicking, 10) || 0,
        }
      };
      
      if (isNew) {
        await createPlayerAction(payload);
        setMessage('Successfully created new player!');
        window.location.href = '/panel/players'; // Redirect back to list
      } else {
        await updatePlayerAction(player.player_id, payload);
        setMessage('Successfully updated player data.');
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to permanently delete this player? This action cannot be undone.")) {
      return;
    }
    setLoading(true);
    try {
      await deletePlayerAction(player.player_id);
      window.location.href = '/panel/players';
    } catch (err) {
      setMessage(`Error deleting player: ${err.message}`);
      setLoading(false);
    }
  };

  const InputRow = ({ label, name, type = 'text' }) => (
    <div>
      <label style={{ display: 'block', fontSize: '12px', color: '#98A0A6', marginBottom: '4px' }}>{label}</label>
      <input type={type} name={name} value={formData[name]} onChange={handleChange} style={{ width: '100%', padding: '6px', backgroundColor: '#0A0A0A', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '14px' }} />
    </div>
  );

  return (
    <div style={{ backgroundColor: '#1A1D21', border: '1px solid #2A2D31', padding: '32px', borderRadius: '12px' }}>
      {message && <div style={{ padding: '12px', backgroundColor: message.startsWith('Error') ? '#991B1B' : '#065F46', color: 'white', marginBottom: '24px', borderRadius: '6px' }}>{message}</div>}
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '32px' }}>
        
        {/* Core Info */}
        <div>
          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '16px' }}>Profile Overview</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            <InputRow label="Full Name" name="full_name" />
            <InputRow label="Card Name" name="card_name" />
            <InputRow label="OVR" name="ovr" type="number" />
            <InputRow label="Position" name="position" />
            <InputRow label="Event Name" name="event_name" />
            <InputRow label="Nation" name="nation_name" />
            <InputRow label="League" name="league_name" />
            <InputRow label="Height (cm)" name="height" />
            <InputRow label="Weight (kg)" name="weight" />
            <InputRow label="Skill Moves (Stars)" name="skill_moves_stars" type="number" />
            <InputRow label="Strong Foot" name="preferred_foot" />
            <InputRow label="Work Rate Attack" name="work_rate_att" />
            <InputRow label="Work Rate Defense" name="work_rate_def" />
            <InputRow label="Portrait Image URL" name="portrait_url" />
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          {formData.position === 'GK' ? (
            <>
              <div>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '16px' }}>Diving <input type="number" name="gk_main_diving" value={formData.gk_main_diving} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <InputRow label="GK Diving" name="gk_diving" type="number" />
                </div>

                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginTop: '24px', marginBottom: '16px' }}>Positioning <input type="number" name="positioning" value={formData.positioning} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <InputRow label="GK Positioning" name="gk_positioning" type="number" />
                </div>

                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginTop: '24px', marginBottom: '16px' }}>Handling <input type="number" name="gk_main_handling" value={formData.gk_main_handling} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <InputRow label="GK Handling" name="gk_handling" type="number" />
                </div>
              </div>
              
              <div>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '16px' }}>Reflexes <input type="number" name="gk_main_reflexes" value={formData.gk_main_reflexes} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <InputRow label="GK Reflexes" name="gk_reflexes" type="number" />
                </div>

                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginTop: '24px', marginBottom: '16px' }}>Kicking <input type="number" name="gk_main_kicking" value={formData.gk_main_kicking} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                  <InputRow label="GK Kicking" name="gk_kicking" type="number" />
                </div>

                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginTop: '24px', marginBottom: '16px' }}>Physical <input type="number" name="physical" value={formData.physical} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <InputRow label="Reactions" name="reactions" type="number" />
                  <InputRow label="Agility" name="agility" type="number" />
                  <InputRow label="Sprint Speed" name="sprint_speed" type="number" />
                  <InputRow label="Strength" name="strength" type="number" />
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '16px' }}>Pace <input type="number" name="pace" value={formData.pace} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <InputRow label="Acceleration" name="acceleration" type="number" />
                  <InputRow label="Sprint Speed" name="sprint_speed" type="number" />
                </div>

                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginTop: '24px', marginBottom: '16px' }}>Shooting <input type="number" name="shooting" value={formData.shooting} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <InputRow label="Finishing" name="finishing" type="number" />
                  <InputRow label="Long Shot" name="long_shot" type="number" />
                  <InputRow label="Shot Power" name="shot_power" type="number" />
                  <InputRow label="Positioning" name="positioning" type="number" />
                  <InputRow label="Volley" name="volley" type="number" />
                  <InputRow label="Penalties" name="penalties" type="number" />
                </div>

                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginTop: '24px', marginBottom: '16px' }}>Passing <input type="number" name="passing" value={formData.passing} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <InputRow label="Short Passing" name="short_passing" type="number" />
                  <InputRow label="Long Passing" name="long_passing" type="number" />
                  <InputRow label="Vision" name="vision" type="number" />
                  <InputRow label="Crossing" name="crossing" type="number" />
                  <InputRow label="Curve" name="curve" type="number" />
                  <InputRow label="Free Kick" name="free_kick" type="number" />
                </div>
              </div>
              
              <div>
                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '16px' }}>Dribbling <input type="number" name="dribbling" value={formData.dribbling} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <InputRow label="Dribbling" name="dribbling_sub" type="number" />
                  <InputRow label="Balance" name="balance" type="number" />
                  <InputRow label="Agility" name="agility" type="number" />
                  <InputRow label="Reactions" name="reactions" type="number" />
                  <InputRow label="Ball Control" name="ball_control" type="number" />
                </div>

                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginTop: '24px', marginBottom: '16px' }}>Defending <input type="number" name="defending" value={formData.defending} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <InputRow label="Marking" name="marking" type="number" />
                  <InputRow label="Standing Tackle" name="standing_tackle" type="number" />
                  <InputRow label="Sliding Tackle" name="sliding_tackle" type="number" />
                  <InputRow label="Awareness" name="awareness" type="number" />
                  <InputRow label="Heading" name="heading" type="number" />
                </div>

                <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginTop: '24px', marginBottom: '16px' }}>Physical <input type="number" name="physical" value={formData.physical} onChange={handleChange} style={{ width: '60px', marginLeft: '8px', backgroundColor: '#000', color: '#fff', border: '1px solid #555' }} /></h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <InputRow label="Strength" name="strength" type="number" />
                  <InputRow label="Aggression" name="aggression" type="number" />
                  <InputRow label="Jumping" name="jumping" type="number" />
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Traits and Playstyles */}
        <div>
          <h3 style={{ borderBottom: '1px solid #333', paddingBottom: '8px', marginBottom: '16px' }}>Traits & Playstyles</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#98A0A6', marginBottom: '4px' }}>Traits (Comma separated)</label>
              <textarea 
                name="traits_text" 
                value={formData.traits_text} 
                onChange={handleChange} 
                rows={4}
                placeholder="e.g., Finesse Shot, Power Header, Speed Dribbler"
                style={{ width: '100%', padding: '8px', backgroundColor: '#0A0A0A', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#98A0A6', marginBottom: '4px' }}>Playstyles (One per line, Format: Name - Level)</label>
              <textarea 
                name="playstyles_text" 
                value={formData.playstyles_text} 
                onChange={handleChange} 
                rows={4}
                placeholder="e.g.,&#10;Bruiser - Lvl 1&#10;Finesse - Lvl 2"
                style={{ width: '100%', padding: '8px', backgroundColor: '#0A0A0A', border: '1px solid #333', color: 'white', borderRadius: '4px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
          </div>
        </div>
          
        <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
          <button onClick={handleSave} disabled={loading} style={{ flex: 1, backgroundColor: '#3B82F6', color: 'white', border: 'none', padding: '16px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '18px' }}>
            {loading ? 'Saving...' : (isNew ? 'Create Player' : 'Save All Player Data Overrides')}
          </button>
          
          {!isNew && (
            <button onClick={handleDelete} disabled={loading} style={{ backgroundColor: '#EF4444', color: 'white', border: 'none', padding: '16px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
              Delete Player
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
