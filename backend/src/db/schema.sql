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
