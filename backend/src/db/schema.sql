-- CampusGenome Database Schema
-- Compatible with PostgreSQL 12+

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    handle VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    graduation_year INT,
    department VARCHAR(100),
    reputation_score INT DEFAULT 0,
    rank VARCHAR(50) DEFAULT 'Helix',
    role VARCHAR(20) DEFAULT 'student',
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Core Polymorphic Knowledge Nodes Table
CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(30) DEFAULT 'Published',
    verification_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Academic Nodes Table
CREATE TABLE IF NOT EXISTS academic_nodes (
    node_id INT PRIMARY KEY REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    department VARCHAR(100) NOT NULL,
    year VARCHAR(50) NOT NULL,
    subject VARCHAR(150),
    insight_type VARCHAR(100)
);

-- 4. Event Nodes Table
CREATE TABLE IF NOT EXISTS event_nodes (
    node_id INT PRIMARY KEY REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    event_date VARCHAR(100),
    event_time VARCHAR(50),
    venue VARCHAR(200),
    publisher VARCHAR(100) DEFAULT 'Genome Official',
    publisher_logo VARCHAR(10) DEFAULT 'GO',
    event_type VARCHAR(10) DEFAULT 'C',
    image_url TEXT
);

-- 5. Lifestyle Nodes Table
CREATE TABLE IF NOT EXISTS lifestyle_nodes (
    node_id INT PRIMARY KEY REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    spot_name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    lifestyle_category VARCHAR(50) NOT NULL,
    pulse_status VARCHAR(50) DEFAULT 'Moderate',
    pulse_percentage INT DEFAULT 50,
    pulse_color VARCHAR(50) DEFAULT 'bg-yellow-500',
    secret_tip TEXT,
    tags TEXT[] DEFAULT '{}',
    image_url TEXT,
    quote TEXT
);

-- 6. Career Nodes Table
CREATE TABLE IF NOT EXISTS career_nodes (
    node_id INT PRIMARY KEY REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    domain VARCHAR(100),
    company VARCHAR(100),
    role VARCHAR(100),
    opportunity_type VARCHAR(100),
    stats_or_package VARCHAR(150),
    opportunity_status VARCHAR(50) DEFAULT 'Upcoming',
    apply_link TEXT,
    image_url TEXT
);

-- 7. Community Nodes Table
CREATE TABLE IF NOT EXISTS community_nodes (
    node_id INT PRIMARY KEY REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    club_name VARCHAR(150) NOT NULL,
    update_type VARCHAR(100),
    members_count INT DEFAULT 0,
    next_meeting VARCHAR(150),
    club_status VARCHAR(50) DEFAULT 'Open',
    category VARCHAR(100),
    image_url TEXT
);

-- 8. Campus Map Buildings Table
CREATE TABLE IF NOT EXISTS buildings (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'Academic',
    wifi VARCHAR(255),
    quiet_spots VARCHAR(255),
    svg_shape_data TEXT,
    history JSONB DEFAULT '[]'::jsonb
);

-- Supplied campus-plan geometry is additive. Existing notes and legacy places stay intact.
ALTER TABLE buildings ADD COLUMN IF NOT EXISTS map_data JSONB;

CREATE TABLE IF NOT EXISTS campus_poll_votes (
    poll_date DATE NOT NULL,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    option_id SMALLINT NOT NULL CHECK (option_id BETWEEN 0 AND 3),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (poll_date, user_id)
);

-- 9. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(20) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'Academic',
    professor VARCHAR(150),
    difficulty VARCHAR(50),
    practical_focus VARCHAR(50),
    history JSONB DEFAULT '[]'::jsonb,
    reviews JSONB DEFAULT '[]'::jsonb
);

-- 10. Comments Table
CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    node_id INT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE SET NULL,
    author_name VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Verifications / Upvotes Table
CREATE TABLE IF NOT EXISTS verifications (
    id SERIAL PRIMARY KEY,
    node_id INT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_node_verification UNIQUE (node_id, user_id)
);

-- Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_nodes_category ON knowledge_nodes(category);
CREATE INDEX IF NOT EXISTS idx_nodes_status ON knowledge_nodes(status);
CREATE INDEX IF NOT EXISTS idx_nodes_created ON knowledge_nodes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_academic_dept_year ON academic_nodes(department, year);
CREATE INDEX IF NOT EXISTS idx_lifestyle_cat ON lifestyle_nodes(lifestyle_category);
CREATE INDEX IF NOT EXISTS idx_comments_node ON comments(node_id);
CREATE INDEX IF NOT EXISTS idx_verifications_node ON verifications(node_id);

-- Personal collections and event registrations are owned by the signed-in user.
CREATE TABLE IF NOT EXISTS bookmarks (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    node_id INT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, node_id)
);
CREATE TABLE IF NOT EXISTS event_attendees (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    node_id INT NOT NULL REFERENCES event_nodes(node_id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, node_id)
);
CREATE INDEX IF NOT EXISTS idx_nodes_author ON knowledge_nodes(user_id);
CREATE INDEX IF NOT EXISTS idx_nodes_feed ON knowledge_nodes(category, created_at DESC, id DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(LOWER(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle_lower ON users(LOWER(handle));

-- Public student-run forums. The category mapping keeps existing posts and routes intact.
CREATE TABLE IF NOT EXISTS forum_communities (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(40) NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    name VARCHAR(60) NOT NULL,
    campus VARCHAR(100) NOT NULL,
    description VARCHAR(500) NOT NULL,
    default_category VARCHAR(50) UNIQUE,
    owner_id INT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO forum_communities (slug,name,campus,description,default_category) VALUES
    ('campus','The Common Room','PCCOE','Questions, stories, and the things you wish someone told you on day one.','Discussion'),
    ('exam-survival','Exam Survival','PCCOE','Notes, practical advice, last-minute revision, and small academic victories.','Academics'),
    ('after-class','After Class','PCCOE','The good chai, quiet corners, and everything that happens after the bell.','Lifestyle'),
    ('whats-happening','What’s Happening','PCCOE','Workshops, meetups, campus news, and good reasons to leave the hostel.','Events'),
    ('future-you','Future You','PCCOE','Internships, portfolio advice, placements, and honest next-step questions.','Career'),
    ('find-your-people','Find Your People','PCCOE','Clubs, projects, hobby groups, and finding someone to go with.','Communities')
ON CONFLICT (slug) DO NOTHING;

ALTER TABLE knowledge_nodes ADD COLUMN IF NOT EXISTS forum_community_id INT REFERENCES forum_communities(id) ON DELETE SET NULL;
ALTER TABLE knowledge_nodes ADD COLUMN IF NOT EXISTS post_kind VARCHAR(20);
ALTER TABLE knowledge_nodes ADD COLUMN IF NOT EXISTS link_url TEXT;
ALTER TABLE knowledge_nodes ADD COLUMN IF NOT EXISTS forum_image_url TEXT;
ALTER TABLE knowledge_nodes ADD COLUMN IF NOT EXISTS downvote_count INT NOT NULL DEFAULT 0 CHECK (downvote_count >= 0);
CREATE INDEX IF NOT EXISTS idx_nodes_forum ON knowledge_nodes(forum_community_id,created_at DESC,id DESC);
CREATE INDEX IF NOT EXISTS idx_forum_owner ON forum_communities(owner_id);

CREATE TABLE IF NOT EXISTS forum_memberships (
    community_id INT NOT NULL REFERENCES forum_communities(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id,user_id)
);
CREATE INDEX IF NOT EXISTS idx_forum_memberships_user ON forum_memberships(user_id,community_id);

CREATE TABLE IF NOT EXISTS forum_downvotes (
    node_id INT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (node_id,user_id)
);

ALTER TABLE comments ADD COLUMN IF NOT EXISTS parent_id INT;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS depth SMALLINT NOT NULL DEFAULT 0 CHECK (depth BETWEEN 0 AND 6);
CREATE UNIQUE INDEX IF NOT EXISTS idx_comments_node_id ON comments(node_id,id);
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname='comments_parent_same_node' AND conrelid='comments'::regclass) THEN
        ALTER TABLE comments ADD CONSTRAINT comments_parent_same_node
            FOREIGN KEY (node_id,parent_id) REFERENCES comments(node_id,id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS forum_reports (
    node_id INT NOT NULL REFERENCES knowledge_nodes(id) ON DELETE CASCADE,
    reporter_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reason VARCHAR(30) NOT NULL CHECK (reason IN ('spam','harassment','personal-information','misleading','other')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMPTZ,
    PRIMARY KEY (node_id,reporter_id)
);
CREATE INDEX IF NOT EXISTS idx_forum_pending_reports ON forum_reports(node_id,created_at) WHERE resolved_at IS NULL;
