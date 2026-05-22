We successfully migrated the FC Mobile market database from Supabase to the VPS PostgreSQL server.

What we did step-by-step:

1. Exported the full Supabase PostgreSQL database locally using pg_dump from PostgreSQL 17.

2. Initial restore failed because::

* Supabase dump was PG17 format
* VPS PostgreSQL version is 14
* custom dump format was incompatible

3. Re-created the backup as a plain SQL dump instead of custom binary format.

4. Compressed and transferred the SQL dump to VPS using SCP.

5. Created a dedicated PostgreSQL database on VPS:

* database: zenith_market

6. Restored schema/tables/views/functions into zenith_market.

7. Fixed ownership + permissions:

* changed table owners to zenith_bot
* granted privileges correctly

8. Imported all important market data tables:

* all_cards
* player_refresh_data
* price_snapshots
* card_scraper_progress

9. Fixed PostgreSQL extension issues:

* installed unaccent extension
* recreated broken trigger functions

10. Re-imported failed COPY sections for:

* player_refresh_data
* price_snapshots

11. Refreshed materialized views:

* refresh_table
* unique_players_cache

12. Verified final row counts:

* all_cards → 44,923
* player_refresh_data → 16,351
* price_snapshots → 1,191,900
* refresh_table → 10,277
* unique_players_cache → 9,910

13. Verified latest_prices view works correctly.

14. Created final VPS production backup:

* /home/blank/zenith_market_final_working_backup.sql

Current architecture:

* zenith_data → app/business DB
* zenith_market → FC market DB

Next step:
Replace Supabase market queries in the app with direct PostgreSQL queries using pg + MARKET_DATABASE_URL.
