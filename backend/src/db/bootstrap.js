import { readFile } from 'node:fs/promises';
import bcrypt from 'bcryptjs';
import pool, { isDemo } from '../config/db.js';

export async function bootstrap() {
  await pool.query(await readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
  if (!isDemo) return;
  const existing = await pool.query('SELECT COUNT(*)::int AS count FROM users');
  if (existing.rows[0].count) return;
  await pool.query(await readFile(new URL('./seed.sql', import.meta.url), 'utf8'));
  const password = await bcrypt.hash('password123', 12);
  await pool.query('UPDATE users SET password_hash=$1', [password]);
  // All visible counters reflect real rows, including the supplied sample data.
  await pool.query(`UPDATE knowledge_nodes k SET
    verification_count=(SELECT COUNT(*) FROM verifications v WHERE v.node_id=k.id),
    comment_count=(SELECT COUNT(*) FROM comments c WHERE c.node_id=k.id)`);
  await pool.query(
    `UPDATE users SET rank=CASE WHEN reputation_score>=250 THEN 'Nucleus' WHEN reputation_score>=100 THEN 'Chromosome' ELSE 'Helix' END`,
  );
  const events = [
    [
      'CampusHack: build something that matters',
      'A weekend of ideas, late-night builds, and good company. Bring a team or meet one here. All departments and experience levels welcome.',
      3,
      '09:00 AM',
      'Innovation Hub',
    ],
    [
      'The art of finding your first internship',
      'An honest conversation with alumni about portfolios, applications, and getting started. Bring your questions and a notebook.',
      6,
      '04:00 PM',
      'Central Auditorium',
    ],
    [
      'Robotics open lab: meet the makers',
      'Step inside the robotics lab for demos, hands-on projects, and a chance to join this semester build team.',
      8,
      '02:00 PM',
      'Computer Science Lab',
    ],
    [
      'A greener campus starts with us',
      'Join the community garden afternoon. We will plant, swap ideas, and plan small improvements to our shared campus spaces.',
      11,
      '03:30 PM',
      'Botanical Quad',
    ],
    [
      'Open mic under the stars',
      'Poetry, acoustic sets, and stories from around campus. Sign up at the venue or come along to listen.',
      14,
      '06:00 PM',
      'Student Center',
    ],
  ];
  for (let index = 0; index < events.length; index++) {
    const [title, description, days, time, venue] = events[index];
    const date = new Date();
    date.setUTCDate(date.getUTCDate() + days);
    await pool.query('UPDATE knowledge_nodes SET title=$1,description=$2 WHERE id=$3', [
      title,
      description,
      index + 1,
    ]);
    await pool.query(
      'UPDATE event_nodes SET event_date=$1,event_time=$2,venue=$3 WHERE node_id=$4',
      [date.toISOString().slice(0, 10), time, venue, index + 1],
    );
  }
  await pool.query(
    "INSERT INTO buildings (id,name,description,category,wifi,quiet_spots) VALUES ('b4','Student Center','The place for clubs, conversations, coffee and everything between classes.','Community','Campus Wi-Fi throughout','First-floor lounge') ON CONFLICT DO NOTHING",
  );
}
