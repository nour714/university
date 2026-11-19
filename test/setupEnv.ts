process.env.DATABASE_URL_OWNER = 'postgres://postgres:postgres@localhost:5434/postgres?sslmode=disable';
process.env.DATABASE_URL_APP = 'postgres://academic_app:test_app_pass_32_chars_minimum@localhost:5434/postgres?sslmode=disable';
process.env.DATABASE_URL_GRADER = 'postgres://academic_grader:test_grader_pass_32_chars_minimum@localhost:5434/postgres?sslmode=disable';
process.env.APP_SECRET = 'test_app_secret_32_characters_minimum_length';
process.env.CODE_PEPPER = 'test_code_pepper_32_characters_minimum_length';
process.env.CRON_SECRET = 'test_cron_secret_16_min';
process.env.DB_SSL = 'disable';
process.env.DB_POOL_MAX = '5';
