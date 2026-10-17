import pool from '../config/db.js';

const questions = [
  [
    'The perfect gap between lectures?',
    ['Chai with friends', 'A quiet walk', 'A heroic power nap', 'One more library chapter'],
  ],
  [
    'Pick the next campus hangout.',
    ['Open mic night', 'Board-game evening', 'Movie under the stars', 'A tiny build-a-thon'],
  ],
  [
    'Where does your best studying happen?',
    [
      'The library corner',
      'My room, my rules',
      'A table full of friends',
      'Anywhere a plug point exists',
    ],
  ],
  [
    'Choose your unofficial campus superpower.',
    [
      'Finding a free socket',
      'Explaining the hard chapter',
      'Making strangers feel welcome',
      'Always knowing the chai spot',
    ],
  ],
  [
    'What deserves a little more campus love?',
    ['Quiet corners', 'Student art', 'Club projects', 'Budget-friendly snacks'],
  ],
  [
    "Today's tiny campus side quest?",
    ['Help a junior', 'Try a different route', 'Show up to a club', 'Take a real study break'],
  ],
  [
    'Your best low-budget study break?',
    [
      'A favourite playlist',
      'A lap around campus',
      'Chai and a good conversation',
      'Ten minutes of doing nothing',
    ],
  ],
];

export function campusPollDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type) => parts.find((part) => part.type === type).value;
  return value('year') + '-' + value('month') + '-' + value('day');
}

async function snapshot(userId, date = campusPollDate()) {
  const day = Math.floor(Date.parse(date + 'T00:00:00Z') / 86400000);
  const [question, labels] = questions[day % questions.length];
  const { rows } = await pool.query(
    'SELECT option_id,COUNT(*)::int AS votes,BOOL_OR(user_id=$2) AS mine FROM campus_poll_votes WHERE poll_date=$1::date GROUP BY option_id',
    [date, userId || null],
  );
  const totalVotes = rows.reduce((sum, row) => sum + row.votes, 0);
  return {
    date,
    question,
    timeZone: 'Asia/Kolkata',
    totalVotes,
    myVote: rows.find((row) => row.mine)?.option_id ?? null,
    options: labels.map((label, id) => ({
      id,
      label,
      votes: rows.find((row) => row.option_id === id)?.votes || 0,
    })),
  };
}

export async function getPulse(req, res, next) {
  try {
    res.json({ success: true, data: await snapshot(req.user?.id) });
  } catch (error) {
    next(error);
  }
}

export async function votePulse(req, res, next) {
  try {
    const date = campusPollDate();
    if (req.body.pollDate !== date)
      return res.status(409).json({
        success: false,
        message: 'A new campus dilemma just arrived. Refresh the poll and try again.',
      });
    if (req.method === 'DELETE') {
      await pool.query('DELETE FROM campus_poll_votes WHERE poll_date=$1::date AND user_id=$2', [
        date,
        req.user.id,
      ]);
    } else {
      await pool.query(
        'INSERT INTO campus_poll_votes (poll_date,user_id,option_id) VALUES ($1::date,$2,$3) ON CONFLICT (poll_date,user_id) DO UPDATE SET option_id=EXCLUDED.option_id',
        [date, req.user.id, req.body.optionId],
      );
    }
    res.json({ success: true, data: await snapshot(req.user.id, date) });
  } catch (error) {
    next(error);
  }
}
