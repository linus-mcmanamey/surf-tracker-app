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