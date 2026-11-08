process.env.DATABASE_URL_OWNER = 'postgres://postgres:postgres@localhost:5434/postgres?sslmode=disable';
process.env.DATABASE_URL_APP = 'postgres://academic_app:app_pass_test@localhost:5434/postgres?sslmode=disable';
process.env.DATABASE_URL_GRADER = 'postgres://academic_grader:grader_pass_test@localhost:5434/postgres?sslmode=disable';
process.env.APP_SECRET = 'test_app_secret_at_least_32_characters_long_for_vitest';
process.env.CODE_PEPPER = 'test_code_pepper_at_least_32_characters_long_for_vitest';
process.env.CRON_SECRET = 'test_cron_secret_at_least_32_characters_long_for_vitest';
process.env.DB_SSL = 'disable';
process.env.DB_POOL_MAX = '5';
