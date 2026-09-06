-- Seed data for CampusGenome Database
-- Password for all default accounts is 'password123' (bcrypt hash)

-- 1. Insert Users
INSERT INTO users (id, handle, name, email, password_hash, graduation_year, department, reputation_score, rank, role)
VALUES 
(1, '@StudentJohn', 'John Doe', 'john.doe@campus.edu', '$2b$10$fthrhnYe0zH53fBEQnp4Fe346WJR/Ce7rKdsc/RtrE8uT1JezZ1eq', 2026, 'Computer Science', 142, 'Helix', 'student'),
(2, '@CampusExplorer', 'Jane Smith', 'jane.smith@campus.edu', '$2b$10$fthrhnYe0zH53fBEQnp4Fe346WJR/Ce7rKdsc/RtrE8uT1JezZ1eq', 2025, 'Information Technology', 287, 'Nucleus', 'student'),
(3, '@TechGuru', 'Alex Rivera', 'alex.tech@campus.edu', '$2b$10$fthrhnYe0zH53fBEQnp4Fe346WJR/Ce7rKdsc/RtrE8uT1JezZ1eq', 2027, 'EnTC', 85, 'Chromosome', 'student'),
(4, '@SwastikaSinha', 'Swastika Sinha', 'swastika.sinha@campus.edu', '$2b$10$fthrhnYe0zH53fBEQnp4Fe346WJR/Ce7rKdsc/RtrE8uT1JezZ1eq', 2028, 'Information Technology', 320, 'Nucleus', 'moderator')
ON CONFLICT (id) DO UPDATE SET password_hash = EXCLUDED.password_hash;

SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 1) FROM users));

-- 2. Insert Events
INSERT INTO knowledge_nodes (id, user_id, category, title, description, status, verification_count, comment_count)
VALUES
(1, 4, 'Events', 'Nobel Laureate to Deliver Keynote on Future of AI', 'Join us for an exclusive keynote speech by Nobel Laureate on the evolution and future implications of Artificial Intelligence and Cognitive Computing.', 'Trending', 142, 56),
(2, 1, 'Events', 'Annual Tech Fest 2026 Dates Announced', 'The flagship technical symposium of the campus returns with 40+ hackathons, robotics challenges, and coding marathons.', 'Published', 89, 45),
(3, 3, 'Events', 'New Robotics Lab Opening Next Month', 'The department is inaugurating a state-of-the-art Autonomous Systems and Robotics Lab equipped with GPU clusters.', 'Published', 89, 22),
(4, 2, 'Events', 'Campus Sustainability Summit 2026', 'A cross-departmental summit on net-zero campus initiatives, solar grid integration, and sustainable engineering.', 'Published', 201, 45),
(5, 1, 'Events', 'Student Council Elections: Meet the Candidates', 'Debates, manifestos, and Q&A sessions ahead of next week''s annual Student Council democratic elections.', 'Published', 412, 89)
ON CONFLICT (id) DO NOTHING;

INSERT INTO event_nodes (node_id, event_date, event_time, venue, publisher, publisher_logo, event_type, image_url)
VALUES
(1, 'August 28, 2026', '10:00 AM', 'Grand Auditorium', 'Genome Official', 'GO', 'A', 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
(2, 'September 20, 2026', '09:00 AM', 'Main Campus Grounds', 'Tech Council', 'TC', 'B', 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'),
(3, 'September 15, 2026', '11:30 AM', 'Academic Block C, Ground Floor', 'Robotics Club', 'RC', 'C', 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
(4, 'October 5, 2026', '02:00 PM', 'Green Quad Amphitheatre', 'Eco Club', 'EC', 'C', 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80'),
(5, 'October 12, 2026', '04:00 PM', 'Central Square', 'Election Commission', 'EC', 'C', 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')
ON CONFLICT (node_id) DO NOTHING;

-- 3. Insert Lifestyle Nodes
INSERT INTO knowledge_nodes (id, user_id, category, title, description, status, verification_count, comment_count)
VALUES
(6, 1, 'Lifestyle', 'Midnight Maggi & Cutting Chai', 'Famous late-night food spot beloved by engineers during exams and hackathons.', 'Published', 450, 24),
(7, 2, 'Lifestyle', 'The Midnight Canteen', 'Chill dining hall in the hostel block offering extended late night hours and budget bites.', 'Published', 320, 15),
(8, 3, 'Lifestyle', 'Sunken Library Lawn', 'Secluded grassy area right outside the central library with shady oak trees and quiet benches.', 'Published', 180, 8),
(9, 4, 'Lifestyle', 'The Botanical Quad', 'Courtyard surrounded by lush greenery, flowers, and peaceful stone walkways.', 'Published', 85, 3),
(10, 1, 'Lifestyle', 'Sunrise PGs & Stay', 'Reliable off-campus student accommodation with home-cooked meals and fast Wi-Fi.', 'Published', 112, 12)
ON CONFLICT (id) DO NOTHING;

INSERT INTO lifestyle_nodes (node_id, spot_name, location, lifestyle_category, pulse_status, pulse_percentage, pulse_color, secret_tip, tags, image_url, quote)
VALUES
(6, 'Midnight Maggi & Cutting Chai', 'Student Union, Ground Floor', 'canteens', 'Packed', 90, 'bg-red-500', 'Ask Bhaiya for the "Exam Special" Maggi (not on the menu). It has extra cheese and secret spices.', ARRAY['Price: ₹₹', 'Vibe: Loud', 'Crowd: High'], 'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'The only thing keeping me awake during finals.'),
(7, 'The Midnight Canteen', 'Hostel Block C', 'canteens', 'Moderately Crowded', 60, 'bg-yellow-500', 'If you order after 1 AM, the portions are magically 20% larger.', ARRAY['Price: ₹', 'Vibe: Chill', 'Wi-Fi: None'], 'https://images.unsplash.com/photo-1544148103-0773bf10d330?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Perfect place to unwind after a long day of classes.'),
(8, 'Sunken Library Lawn', 'Outside Library', 'green-spots', 'Quiet', 20, 'bg-green-500', 'There is a hidden plug point under the third bench on the right.', ARRAY['Price: Free', 'Vibe: Relaxed', 'Crowd: Low'], 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'Best place for a winter afternoon nap between lectures.'),
(9, 'The Botanical Quad', 'Academic Block B Courtyard', 'green-spots', 'Serene', 10, 'bg-teal-500', 'The wifi actually reaches the stone benches if you sit facing the physics lab.', ARRAY['Price: Free', 'Vibe: Academic', 'Shade: High'], 'https://images.unsplash.com/photo-1577896851231-70ef18881754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'A quiet green oasis when the library is full.'),
(10, 'Sunrise PGs & Stay', 'North Gate, 200m away', 'housing', 'Available', 10, 'bg-green-500', 'Negotiate the rent if you pay 6 months upfront; they usually drop it by 15%.', ARRAY['Price: ₹₹₹', 'Curfew: 10 PM', 'Food: Included'], 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80', 'A bit pricey, but the food actually tastes like home.')
ON CONFLICT (node_id) DO NOTHING;

-- 4. Insert Career Opportunities
INSERT INTO knowledge_nodes (id, user_id, category, title, description, status, verification_count, comment_count)
VALUES
(11, 4, 'Career', 'Upcoming Tech Internships - Google', 'Join the world''s leading technology company for an immersive summer internship focusing on core infrastructure and AI research.', 'Trending', 342, 89),
(12, 2, 'Career', 'Resume Review Workshop by Alumni', 'Get your resume battle-tested by alumni currently working at top-tier firms like McKinsey, Goldman Sachs, and Meta.', 'Published', 156, 42),
(13, 3, 'Career', 'Quant Trading Firms Mock Interviews', 'Exclusive 1-on-1 mock interview sessions with recruiters from Jane Street, Optiver, and Tower Research. Limited slots available.', 'Published', 289, 112),
(14, 1, 'Career', 'Consulting Case Prep Cohort Launch', 'A rigorous 6-week program designed to master case interviews. Mentorship provided by recent MBB associates.', 'Published', 198, 67)
ON CONFLICT (id) DO NOTHING;

INSERT INTO career_nodes (node_id, domain, company, role, opportunity_type, stats_or_package, opportunity_status, apply_link)
VALUES
(11, 'Software Engineering', 'Google', 'Software Engineering Intern', 'Placement Drive', 'Average Package: 18 LPA', 'Upcoming', 'https://careers.google.com/students'),
(12, 'Career Development', 'Alumni Network', 'Mentee', 'Workshop', '150+ Resumes Reviewed', 'Registration Open', 'https://forms.campus.edu/resume-workshop'),
(13, 'Quantitative Finance', 'Quant Consortium', 'Quantitative Trader / Researcher', 'Preparation', 'High Selectivity', 'Upcoming', 'https://campus.edu/quant-mocks'),
(14, 'Management Consulting', 'Case Club', 'Consulting Analyst Cohort', 'Mentorship', 'Cohort Size: 40', 'Applications Open', 'https://campus.edu/case-cohort')
ON CONFLICT (node_id) DO NOTHING;

-- 5. Insert Academics Insights
INSERT INTO knowledge_nodes (id, user_id, category, title, description, status, verification_count, comment_count)
VALUES
(15, 1, 'Academics', 'CS - TY Insights: Exam Strategy', 'For CS TY, make sure you solve the last 5 years'' papers. Prof. X usually repeats 40% of the questions.', 'Published', 180, 14),
(16, 2, 'Academics', 'Internship Opportunities & Placements for CS', 'Top companies are looking for CS students with strong fundamentals. Prepare your portfolios focusing on core subjects and practical projects.', 'Published', 320, 28),
(17, 3, 'Academics', 'Practical Viva Guidelines - Core Labs', 'During vivas, focus on explaining the ''why'' behind your implementation, not just the ''how''. Especially critical for core lab sessions in this semester.', 'Published', 95, 9),
(18, 4, 'Academics', 'IT - SY Insights: Data Structures & Algorithms', 'Master Trees, Graphs, and Dynamic Programming early. Regular practice on LeetCode will give you an edge in second-year lab tests.', 'Published', 215, 34)
ON CONFLICT (id) DO NOTHING;

INSERT INTO academic_nodes (node_id, department, year, subject, insight_type)
VALUES
(15, 'CS', 'TY', 'Computer Networks & Operating Systems', 'Exam Strategy'),
(16, 'CS', 'TY', 'Placements & Industry Readiness', 'Career Guidance'),
(17, 'CS', 'TY', 'Lab Vivas', 'Practical Viva Guidelines'),
(18, 'IT', 'SY', 'Data Structures & Algorithms', 'Course Preparation')
ON CONFLICT (node_id) DO NOTHING;

-- 6. Insert Communities / Clubs
INSERT INTO knowledge_nodes (id, user_id, category, title, description, status, verification_count, comment_count)
VALUES
(19, 1, 'Communities', 'Quantum Computing Society', 'Exploring the frontiers of quantum algorithms and hardware. Open to all majors.', 'Published', 142, 18),
(20, 3, 'Communities', 'Campus Hackers', 'Building, breaking, and securing things. We host the annual CampusHack hackathon.', 'Published', 350, 42),
(21, 2, 'Communities', 'Debate & Literary Club', 'Fostering critical thinking through parliamentary debates and poetry slams.', 'Published', 85, 7),
(22, 4, 'Communities', 'Mountaineering Expedition Group', 'Planning weekend treks and annual Himalayan expeditions.', 'Published', 210, 25)
ON CONFLICT (id) DO NOTHING;

INSERT INTO community_nodes (node_id, club_name, update_type, members_count, next_meeting, club_status, category)
VALUES
(19, 'Quantum Computing Society', 'Weekly Study Circle', 142, 'Every Tuesday, 6 PM', 'Recruiting', 'Technology'),
(20, 'Campus Hackers', 'Annual Hackathon Registration', 350, 'Bi-weekly Friday, 5 PM', 'Open', 'Technology'),
(21, 'Debate & Literary Club', 'Inter-College Parliamentary Debate', 85, 'Wednesdays, 4 PM', 'Closed', 'Arts & Culture'),
(22, 'Mountaineering Expedition Group', 'Weekend Trek to Rajmachi', 210, 'First Monday of Month', 'Open', 'Sports & Outdoors')
ON CONFLICT (node_id) DO NOTHING;

-- 7. Insert Buildings
INSERT INTO buildings (id, name, description, category, wifi, quiet_spots, history)
VALUES
('b1', 'Main Administration', 'The central hub of the university housing the Registrar, Dean of Student Affairs, and finance counters.', 'Campus', 'Strong coverage in lobby', '3rd floor waiting area', 
 '[{"date": "2023-10-01", "change": "Added new waiting area seating", "author": "@Admin"}]'::jsonb),
('b2', 'Central Library', 'Four floors of books, air-conditioned study spaces, archival collections, and digital media rooms.', 'Academic', 'Excellent on floors 1-3, weak in basement', 'Basement silent reading room', 
 '[{"date": "2024-01-15", "change": "Updated wifi coverage details", "author": "@StudentJohn"}, {"date": "2024-02-20", "change": "Added basement silent zone", "author": "@CampusExplorer"}]'::jsonb),
('b3', 'Computer Science Lab', 'High performance computing cluster, AI workstations, and senior capstone project rooms.', 'Academic', 'Excellent (Dedicated high-speed network)', 'Project room 102 (booking required)', 
 '[{"date": "2023-11-05", "change": "Added booking requirement for project room", "author": "@TechGuru"}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    wifi = EXCLUDED.wifi,
    quiet_spots = EXCLUDED.quiet_spots,
    history = EXCLUDED.history;

-- 8. Insert Courses
INSERT INTO courses (id, code, name, description, category, professor, difficulty, practical_focus, history, reviews)
VALUES
('c1', 'CS101', 'Introduction to Computer Science', 'Fundamental concepts of programming, computational thinking, and algorithms using modern languages.', 'Academic', 'Dr. Alan Turing', 'Medium', 'High',
 '[{"date": "2023-09-01", "change": "Updated practical projects list", "author": "@TechGuru"}]'::jsonb,
 '[{"author": "@StudentJohn", "content": "Great introductory course, highly recommend paying attention to the lab sessions.", "verified": true}]'::jsonb)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    reviews = EXCLUDED.reviews;

-- 9. Insert Comments
INSERT INTO comments (id, node_id, user_id, author_name, text)
VALUES
(1, 1, 1, 'John Doe', 'Can undergraduates ask questions during the final Q&A panel?'),
(2, 1, 4, 'Swastika Sinha', 'Yes! The last 20 minutes are dedicated to open questions from the audience.'),
(3, 6, 2, 'Jane Smith', 'The Exam Special Maggi is unmatched at 2 AM! 100% recommended.')
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Verifications
INSERT INTO verifications (node_id, user_id)
VALUES
(1, 1),
(1, 2),
(1, 3),
(6, 2),
(6, 3),
(11, 1),
(11, 4)
ON CONFLICT (node_id, user_id) DO NOTHING;

-- Update sequences
SELECT setval('knowledge_nodes_id_seq', (SELECT COALESCE(MAX(id), 1) FROM knowledge_nodes));
SELECT setval('comments_id_seq', (SELECT COALESCE(MAX(id), 1) FROM comments));
SELECT setval('verifications_id_seq', (SELECT COALESCE(MAX(id), 1) FROM verifications));
