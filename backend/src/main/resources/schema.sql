DROP TABLE IF EXISTS ratings;

CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY,
    profile_id BIGINT NOT NULL,
    rater_user_id BIGINT NOT NULL,
    score INTEGER NOT NULL,
    comment VARCHAR(500),
    created_date DATETIME NOT NULL,
    FOREIGN KEY (profile_id) REFERENCES profiles(id),
    FOREIGN KEY (rater_user_id) REFERENCES users(id)
);
