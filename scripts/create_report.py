"""Generate the CampusGenome handover PDF. Run after the documented checks."""

from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph, Table, TableStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "output" / "pdf" / "CampusGenome-Upgrade-Report.pdf"
OUT.parent.mkdir(parents=True, exist_ok=True)
for name, filename in [("Body", "segoeui.ttf"), ("BodyBold", "segoeuib.ttf"), ("Editorial", "georgia.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(Path("C:/Windows/Fonts") / filename)))
pdfmetrics.registerFontFamily("Body", normal="Body", bold="BodyBold", italic="Body", boldItalic="BodyBold")
W, H = A4
M = 46
CW = W - M * 2
INK = colors.HexColor("#0f172a")
GREEN = colors.HexColor("#0b1120")
MUTED = colors.HexColor("#758095")
SOFT = colors.HexColor("#fdf4d8")
LINE = colors.HexColor("#e9dfc0")
CREAM = colors.HexColor("#fff9e8")
DATE = "16 OCTOBER 2026"
c = canvas.Canvas(str(OUT), pagesize=A4)
c.setTitle("CampusGenome | Product and Engineering Upgrade")
c.setAuthor("CampusGenome project handover")
c.setSubject("Frontend and backend improvements, technology choices, validation and setup")


def p(text, x, y, width=CW, size=10, font="Body", color=INK, leading=None):
    style = ParagraphStyle("text", fontName=font, fontSize=size, leading=leading or size * 1.55, textColor=color)
    para = Paragraph(text, style)
    _, height = para.wrap(width, H)
    para.drawOn(c, x, y - height)
    return y - height


def label(text, x, y, color=MUTED):
    c.setFillColor(color)
    c.setFont("BodyBold", 7.5)
    c.drawString(x, y, text)


def footer(page):
    c.setStrokeColor(LINE)
    c.line(M, 47, W - M, 47)
    label("CAMPUSGENOME  /  PRODUCT & ENGINEERING", M, 30)
    c.setFont("Body", 7.5)
    c.drawRightString(W - M, 30, f"{DATE}   /   {page:02d}")


def page(page_no, kicker, title, subtitle):
    c.setFillColor(colors.white)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    label(kicker, M, H - 50)
    p(title, M, H - 74, size=29, font="Editorial", leading=36)
    p(subtitle, M, H - 125, size=10, color=MUTED)
    footer(page_no)


def note(title, body, x, y, width=CW):
    p(title, x, y, width, 11, "BodyBold")
    return p(body, x, y - 21, width, 9, color=MUTED, leading=13) - 16


def table(rows, widths, x, top, font_size=9):
    cells = [[Paragraph(str(cell), ParagraphStyle("cell", fontName="BodyBold" if i == 0 else "Body", fontSize=font_size, leading=font_size * 1.5, textColor=INK)) for cell in row] for i, row in enumerate(rows)]
    t = Table(cells, colWidths=widths, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), SOFT),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("TOPPADDING", (0, 0), (-1, -1), 9),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 9),
        ("LEFTPADDING", (0, 0), (-1, -1), 11),
        ("RIGHTPADDING", (0, 0), (-1, -1), 11),
        ("LINEBELOW", (0, 0), (-1, -1), .5, LINE),
    ]))
    _, height = t.wrap(CW, H)
    if top - height < 65:
        raise ValueError(f"Table overflows page: bottom={top-height}")
    t.drawOn(c, x, top - height)
    return top - height


# 1 / Cover
c.setFillColor(GREEN)
c.rect(0, 0, W, H, fill=1, stroke=0)
label("CAMPUS GENOME", M, H - 55, CREAM)
label("THE STUDENT COLLECTIVE", M, H - 72, colors.HexColor("#c8b77f"))
c.setStrokeColor(colors.HexColor("#6b5925"))
c.line(M, H - 100, W - M, H - 100)
label("PRODUCT & ENGINEERING UPGRADE", M, H - 148, colors.HexColor("#e4c96b"))
p("A campus with character.<br/>A backend with backbone.", M, H - 180, CW, 40, "Editorial", CREAM, 51)
p("An unofficial campus common room, full of student lore.<br/>Gold, whimsy, and a more dependable backend.", M, 475, CW, 12, color=colors.HexColor("#d7dce7"), leading=21)
label("FRONTEND  +  BACKEND  +  DELIVERY NOTES", M, 359, colors.HexColor("#e4c96b"))
c.setFillColor(CREAM)
c.roundRect(M, 111, CW, 207, 12, fill=1, stroke=0)
for x, number, caption in [(M + 23, "42", "automated checks passed"), (M + 190, "2", "database engines verified"), (M + 352, "0", "known npm advisories*")]:
    p(number, x, 290, 135, 36, "Editorial")
    p(caption, x, 232, 135, 8.5, color=MUTED)
p("Built on the existing CampusGenome project. Existing campus data and UML models were preserved. This report explains the finished work, the choices behind it, and how to run it.", M + 23, 183, CW - 46, 9, color=MUTED)
label(DATE, M, 76, colors.HexColor("#e4c96b"))
p("* npm audit results at delivery; advisories can change over time.", M, 57, CW, 7, color=colors.HexColor("#c8b77f"))
c.showPage()

# 2 / Visual direction
page(2, "01  /  THE EXPERIENCE", "Off the prospectus. On campus.", "A student-led forum feel, with clearer hierarchy and the original gold-and-serif personality.")
shot = ROOT / "tmp" / "qa" / "dashboard-overview.png"
if not shot.exists():
    raise FileNotFoundError("Capture the reviewed dashboard screenshot before generating the report.")
c.setFillColor(SOFT)
c.roundRect(M - 1, 310, CW + 2, 355, 8, fill=1, stroke=0)
c.drawImage(str(shot), M, 312, width=CW, height=CW * 1000 / 1440, preserveAspectRatio=True, mask="auto")
y = 284
y = note("A campus common room, with character.", "Readable paper-like posts, useful voting rails, topic channels, student handles and flairs bring an unofficial forum rhythm. Gold accents, a serif hero, taped notes, hand-drawn details and a faint campus backdrop keep the whimsy.", M, y)
y = note("Less clutter. More room for the good stuff.", "The header is compact, search stays within reach, posts form one clear reading column, and the side rail holds community context. The illustrated map now has a dedicated place panel; mobile stacks it below the map.", M, y)
y = note("Little rituals, real student knowledge.", "The daily DNA capsule, optional side quests and private pocket remain. Students can now pin authenticated field notes to campus buildings. Votes, replies, saved finds and field notes use the API and survive reloads.", M, y)
c.showPage()

# 3 / Feature rationale
page(3, "02  /  WHAT WAS ADDED", "For the plot. And the people.", "A creative common room built around useful student-to-student knowledge.")
features = [
    ("01", "An unofficial campus feed", "The common room replaces the oversized overview panel with readable posts, author handles, flairs, image thumbnails and a compact composer. A pinned community note and contributor karma add a student-run feel."),
    ("02", "Helpful votes, replies and a private pocket", "The voting rail uses existing peer-verification records. Students can mark useful posts, open their replies, save finds and copy share links. Counts and saved state come from the server."),
    ("03", "Channels for every campus rabbit hole", "Exam survival, After class, Future you, What's happening and Find your people organize real posts. Buzzing, Fresh and Most helpful sorts query the API, and paginated results stay bounded."),
    ("04", "A field guide with breathing room", "The map keeps its original building shapes and adds paper-grid illustration, numbered places, persistent selection and a usable directory. A single details panel fits beside it on desktop and below it on mobile."),
    ("05", "Leave a little local lore", "Students can pin field notes to a building using its existing authenticated history endpoint. Notes show the server-selected author and date and remain after reload. Wi-Fi and quiet-spot details have readable accordions."),
    ("06", "Keep the tiny campus rituals", "The daily DNA capsule, gold confetti, optional side quests, saved pocket, mood forecast and shuffled event feed remain. Sticky notes, doodles and gold details carry the personality through the cleaner layout."),
    ("07", "Keep the conversations dependable", "Contribution forms, comments, RSVPs and protected removal remain connected to the backend. Search links open the selected place. Cancelled response parsing now propagates correctly, preventing a feed render failure."),
]
y = 658
for number, title, description in features:
    label(number, M, y - 2, GREEN)
    p(title, M + 32, y + 3, CW - 32, 12, "BodyBold")
    bottom = p(description, M + 32, y - 20, CW - 32, 9, color=MUTED, leading=13)
    c.setStrokeColor(LINE)
    c.line(M + 32, bottom - 14, W - M, bottom - 14)
    y = bottom - 26
c.showPage()

# 4 / Backend
page(4, "03  /  THE ENGINEERING", "A backend you can reason about.", "The existing Express/PostgreSQL architecture was strengthened rather than replaced.")
box_y = 593
for x, width, title, detail in [(M, 135, "REACT CLIENT", "Same-origin /api requests"), (M + 162, 150, "EXPRESS API", "Auth + validation + services"), (M + 339, 164, "POSTGRES / PGLITE", "Constraints + transactions")]:
    c.setFillColor(SOFT); c.roundRect(x, box_y, width, 61, 7, fill=1, stroke=0)
    label(title, x + 11, box_y + 40, GREEN)
    p(detail, x + 11, box_y + 26, width - 18, 8, color=MUTED)
c.setStrokeColor(colors.HexColor("#9eaf8a"))
for start in [M + 138, M + 315]:
    c.line(start, box_y + 31, start + 21, box_y + 31)
    c.line(start + 17, box_y + 34, start + 21, box_y + 31)
    c.line(start + 17, box_y + 28, start + 21, box_y + 31)
y = 562
for title, body in [
    ("Authenticated identity on every write", "Guest writes and fallback user IDs were removed. The server chooses the author identity. Ownership and moderator checks protect removal, and students cannot verify their own contributions."),
    ("Validated inputs and predictable queries", "Zod bounds text, IDs, page sizes, categories, dates and URLs. SQL values remain parameterized; sort expressions are allowlisted and search wildcard characters are treated literally."),
    ("Atomic writes and consistent reputation", "Contributions, comments, verification counts and reputation changes use transaction callbacks. Verification locks the contribution row to serialize competing toggles. Rank updates target the affected user."),
    ("A clearer security baseline", "JWTs pin HS256, issuer and audience; new passwords use bcrypt cost 12. Production rejects weak/missing secrets. Helmet, an origin allowlist, a 1 MB JSON limit, API limits and separate sign-in limits are configured."),
    ("Operational visibility and safer failures", "Request IDs connect client errors with server logs. Health checks return 503 when the database is unavailable. Unexpected database messages and stack traces are not returned to clients. Startup and shutdown are separate from the testable app."),
    ("A self-contained local environment", "PGlite runs PostgreSQL locally with persistent files for the demo. It is explicitly selected and disabled in production. Standard PostgreSQL remains available through the existing pg adapter and environment configuration."),
]:
    y = note(title, body, M, y)
c.showPage()

# 5 / Stack choices
page(5, "04  /  THE TECH STACK", "The right tools, for clear reasons.", "Versions below reflect the installed and tested dependency lockfiles at delivery.")
rows = [
    ["Layer", "Technology", "Why it is here"],
    ["Interface", "React 19.2.8 + React Router 7.18.2", "Retains the existing component model and route structure. Context coordinates account, shared data, theme and contribution state."],
    ["Design", "Tailwind CSS 4.3.3 + custom CSS + Lucide + React Joyride", "Keeps the existing theme and guided tour. Scoped common-room styles define readable post hierarchy, responsive map columns, warm paper surfaces and playful gold details."],
    ["Frontend tooling", "Vite 8.2.1 + Oxlint + Prettier", "Fast local iteration, a production build, repeatable lint checks, and consistently formatted source. The proxy removes hardcoded API hosts."],
    ["API runtime", "Node.js + Express 4.22.3", "Preserves the established JavaScript stack and existing route modules. App/server separation makes integration tests straightforward."],
    ["Persistence", "PostgreSQL via pg 8.23.0; PGlite 0.5.10 for demo", "The relational schema fits accounts, contributions, comments, bookmarks and RSVPs. The demo uses real SQL without requiring a separate database service."],
    ["Validation / security", "Zod 4.6.7; bcryptjs; jsonwebtoken; Helmet; cors; express-rate-limit", "Bounds untrusted inputs, hashes passwords, verifies signed sessions, sets security headers, limits origins and throttles repeated requests."],
    ["Verification", "Node test runner + Playwright", "API tests exercise the actual SQL and HTTP behavior. Browser tests check real student workflows and responsive layouts in Microsoft Edge."],
    ["Handover", "Python + ReportLab + Poppler", "Creates a reproducible PDF, then renders pages for visual inspection before delivery."],
]
bottom = table(rows, [80, 154, CW - 234], M, 659, font_size=8.7)
p("The frontend keeps the existing React stack and category pages. The common room and field guide reuse current API capabilities; they require no new service or dependency. Original gold, serif, campus and midnight elements carry through the cleaner forum layout.", M, bottom - 24, CW, 9.5, color=MUTED)
c.showPage()

# 6 / Validation
page(6, "05  /  VALIDATION", "Tested through the whole journey.", "Checks cover correctness, state persistence, authorization, and the actual browser experience.")
rows = [
    ["Check", "Result", "Evidence / scope"],
    ["Embedded SQL API suite", "14 / 14 PASS", "PGlite in-memory database; real HTTP requests and SQL transactions."],
    ["Native PostgreSQL API suite", "14 / 14 PASS", "The same suite against the configured local PostgreSQL server, in a uniquely named temporary schema."],
    ["Browser suite", "14 / 14 PASS", "Microsoft Edge: existing student workflows plus common-room channel filters, sorting, persistent helpful votes, readable map panels and authenticated field notes."],
    ["Responsive checks", "PASS", "320, 390, 768, 1024 and 1440 px widths; dashboard, discovery, map and login; no horizontal overflow."],
    ["Frontend lint + build", "PASS", "Oxlint with no warnings; Vite production build completed successfully."],
    ["Dependency audits", "0 advisories", "npm audit for both frontend and backend at delivery; compatible patches applied and unused dependency chains removed."],
    ["Visual review", "PASS", "Desktop and mobile feed and map, midnight theme, login, and every final PDF page rendered and inspected."],
]
bottom = table(rows, [128, 83, CW - 211], M, 659, font_size=9)
y = bottom - 27
y = note("Tests exercise failure paths too.", "Invalid pagination and IDs, malformed JSON, unauthorized writes, unsafe URLs, duplicate registrations, self-verification, concurrent toggles, transaction rollback, spoofed comment names, private saves and access to removed content are covered.", M, y)
y = note("Test data is isolated.", "Browser tests use a separate in-memory demo server. Native PostgreSQL tests create a dedicated schema, verify that it is selected, and remove that schema afterwards. Existing campus tables and data are not used for test writes.", M, y)
p("These checks validate the local implementation. They do not constitute a load test, a penetration test, or a deployed production availability guarantee.", M, y - 2, CW, 8.5, color=MUTED)
c.showPage()

# 7 / Runbook and honest limits
page(7, "06  /  RUN & EXTEND", "Ready for your next semester.", "A small runbook for reviewing the project and making it your own.")
y = 658
y = note("01  Start the local demo", "From the repository root: <b>npm install</b>, <b>npm run setup</b>, then <b>npm run dev</b>. Dependencies are already installed in this workspace. Open <b>http://127.0.0.1:5173</b>; the API runs on port 5000. Select <b>Try the student demo</b> on the sign-in page.", M, y)
y = note("02  Keep your changes", "Demo changes persist under <b>backend/.data/campus</b>, which is excluded from Git. Sample events receive upcoming dates when this database is first seeded. The demo endpoint and sample accounts are restricted to explicit demo mode; production rejects that mode.", M, y)
y = note("03  Use standard PostgreSQL", "Configure <b>backend/.env</b> using its example. Run <b>npm run db:init</b> to create the database/schema, then <b>npm run start:backend</b> and <b>npm run dev:frontend</b>. The init command does not insert sample data. Use <b>npm run db:seed</b> only when you intentionally want the sample dataset.", M, y)
y = note("04  Repeat the verification", "Run <b>npm test</b>, <b>npm run test:postgres</b>, <b>npm run test:e2e</b>, <b>npm run lint</b>, and <b>npm run build</b>. Browser tests use Edge on Windows; other platforms need Playwright Chromium. See the README for details and the API reference for request examples.", M, y)
y = note("05  Know the boundaries", "Images are linked by URL; an upload storage service and Google SSO are not configured. The campus map is schematic and the mood forecast is decorative. The daily capsule draws from up to 100 fetched contributions; common-room and discovery feeds are paginated. External images need network access, with a local campus-photo fallback.", M, y)
y = note("06  Before a public deployment", "Supply real campus content and infrastructure, a durable PostgreSQL service, HTTPS, a strong JWT secret and approved origins. Rate limits currently use a process-local store; use a shared store for multiple API instances. Persistent browser sessions use Web Storage and require the usual XSS controls. No external deployment was performed.", M, y)
c.setStrokeColor(LINE); c.line(M, y - 4, W - M, y - 4)
label("OFFICIAL IMPLEMENTATION REFERENCES", M, y - 24)
p('<link href="https://pglite.dev/docs/api" color="#0b1120">PGlite API</link>  |  <link href="https://vite.dev/guide/env-and-mode" color="#0b1120">Vite environment configuration</link>  |  <link href="https://github.com/expressjs/expressjs.com/blob/main/src/content/pages/en/advanced/best-practice-security.mdx" color="#0b1120">Express security guidance</link>', M, y - 35, CW, 8)
c.showPage()
c.save()
print(OUT)
