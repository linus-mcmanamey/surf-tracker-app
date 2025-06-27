railway:
	@railway whoami

connect_db:
	@railway connect Postgres

load_schema:
	@cat .vscode/docs/database-schema.sql | railway connect Postgres

db_status:
	@railway status

get_db_info:
	@railway variables --service Postgres

check_tables:
	@echo "\\dt" | railway connect Postgres

add_surf_spot:
	@echo "INSERT INTO surf_spots (user_id, name, latitude, longitude, break_type, skill_requirement, optimal_wind_directions, min_wave_size, max_wave_size, notes) VALUES (1, 'Huntington Beach', 33.6584, -117.9988, 'beach', 'intermediate', ARRAY['W', 'SW'], 2, 10, 'Famous surf city USA with consistent waves and sandy bottom');" | railway connect Postgres

add_custom_spot:
	@echo "Enter surf spot details when prompted..."
	@read -p "Spot name: " name; \
	read -p "Latitude: " lat; \
	read -p "Longitude: " lng; \
	read -p "Break type (beach/point/reef/river_mouth/jetty/shore/sandbar): " break_type; \
	read -p "Skill level (beginner/intermediate/advanced/expert): " skill; \
	read -p "Notes: " notes; \
	echo "INSERT INTO surf_spots (user_id, name, latitude, longitude, break_type, skill_requirement, notes) VALUES (1, '$$name', $$lat, $$lng, '$$break_type', '$$skill', '$$notes');" | railway connect Postgres

list_surf_spots:
	@echo "SELECT id, name, latitude, longitude, break_type, skill_requirement, notes FROM surf_spots ORDER BY id;" | railway connect Postgres

delete_spot:
	@read -p "Enter spot ID to delete: " id; \
	echo "DELETE FROM surf_spots WHERE id = $$id;" | railway connect Postgres

list_users:
	@echo "SELECT id, username, email, skill_level, created_at FROM users ORDER BY id;" | railway connect Postgres

count_records:
	@echo "SELECT 'Users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'Surf Spots', COUNT(*) FROM surf_spots UNION ALL SELECT 'Sessions', COUNT(*) FROM surf_sessions;" | railway connect Postgres