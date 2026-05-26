# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: corporate-dashboard.spec.ts >> Locked Dashboard >> locked buttons show a Lock icon
- Location: tests/corporate-dashboard.spec.ts:144:7

# Error details

```
Error: expect(received).toBeGreaterThan(expected)

Expected: > 0
Received:   0
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - main [ref=e12]:
    - paragraph [ref=e13]: Loading dashboard...
```

# Test source

```ts
  50  |   const ts = Date.now();
  51  |   CORP_EMAIL = `corp+${ts}@testcorp.com`;
  52  | 
  53  |   const fields: Record<string, string> = {
  54  |     companyName:                    `Test Corporation ${ts}`,
  55  |     industryType:                   "Technology",
  56  |     cinNumber:                      `U72900MH${ts}`.slice(0, 21),
  57  |     panNumber:                      "AABCT1234D",
  58  |     companyEmail:                   CORP_EMAIL,
  59  |     contactNumber:                  "9876543210",
  60  |     state:                          "Maharashtra",
  61  |     country:                        "India",
  62  |     headquartersAddress:            "123 Test Street, Mumbai 400001",
  63  |     csrFocusAreas:                  "Education",
  64  |     authorizedSignatoryName:        "Test Admin",
  65  |     authorizedSignatoryDesignation: "CEO",
  66  |     fullName:                       "Test Admin",
  67  |     designation:                    "Super Admin",
  68  |     workEmail:                      CORP_EMAIL,
  69  |     phoneNumber:                    "9876543210",
  70  |     password:                       CORP_PASS,
  71  |     confirmPassword:                CORP_PASS,
  72  |   };
  73  | 
  74  |   const res  = await request.post(`${BASE_URL}/api/corporates/register`, {
  75  |     multipart: Object.fromEntries(Object.entries(fields)),
  76  |   });
  77  |   const body = (await res.json()) as { slug?: string; error?: string };
  78  |   if (!body.slug) throw new Error(`Registration failed: ${body.error}`);
  79  |   CORP_SLUG = body.slug;
  80  | });
  81  | 
  82  | // ─── Sign-in helper ───────────────────────────────────────────────────────────
  83  | async function signIn(page: Page) {
  84  |   await page.goto(`${BASE_URL}/signin`);
  85  |   await page.getByLabel("Email address").fill(CORP_EMAIL);
  86  |   await page.getByLabel("Password").fill(CORP_PASS);
  87  |   await page.getByRole("button", { name: "Sign in" }).click();
  88  |   // 40 s – generous enough for cold Supabase start
  89  |   await page.waitForURL(`**/corporate/${CORP_SLUG}/dashboard`, { timeout: 40_000 });
  90  | }
  91  | 
  92  | // ═══════════════════════════════════════════════════════════════════════════════
  93  | // SUITE 1 — Sign-in page
  94  | // ═══════════════════════════════════════════════════════════════════════════════
  95  | test.describe("Sign-In Page", () => {
  96  |   test("shows Corporate / NGO Admin / NGO Member tabs", async ({ page }) => {
  97  |     await page.goto(`${BASE_URL}/signin`);
  98  |     await expect(page.getByRole("button", { name: "Corporate"  })).toBeVisible();
  99  |     await expect(page.getByRole("button", { name: "NGO Admin"  })).toBeVisible();
  100 |     await expect(page.getByRole("button", { name: "NGO Member" })).toBeVisible();
  101 |   });
  102 | 
  103 |   test("wrong tab shows error message for corporate credentials", async ({ page }) => {
  104 |     await page.goto(`${BASE_URL}/signin`);
  105 |     await page.getByRole("button", { name: "NGO Admin" }).click();
  106 |     await page.getByLabel("Email address").fill(CORP_EMAIL);
  107 |     await page.getByLabel("Password").fill(CORP_PASS);
  108 |     await page.getByRole("button", { name: "Sign in" }).click();
  109 |     await expect(
  110 |       page.getByText(/not an ngo|not a corporate|account type|invalid/i),
  111 |     ).toBeVisible({ timeout: 10_000 });
  112 |   });
  113 | 
  114 |   test("signs in successfully and lands on corporate dashboard", async ({ page }) => {
  115 |     await signIn(page);
  116 |     await expect(page).toHaveURL(`${BASE_URL}/corporate/${CORP_SLUG}/dashboard`);
  117 |     await expect(page.getByText("CorpoGN")).toBeVisible();
  118 |   });
  119 | });
  120 | 
  121 | // ═══════════════════════════════════════════════════════════════════════════════
  122 | // SUITE 2 — Locked dashboard (account just created, access_status = 'locked')
  123 | // ═══════════════════════════════════════════════════════════════════════════════
  124 | test.describe("Locked Dashboard", () => {
  125 |   test.beforeEach(async ({ page }) => { await signIn(page); });
  126 | 
  127 |   test("sidebar shows 'Chat required' badge", async ({ page }) => {
  128 |     await expect(page.getByText("Chat required")).toBeVisible();
  129 |   });
  130 | 
  131 |   test("Support / Chat is selected by default", async ({ page }) => {
  132 |     // The active sidebar item is Support / Chat
  133 |     await expect(
  134 |       page.locator("aside button.bg-blue-600").filter({ hasText: "Support / Chat" }),
  135 |     ).toBeVisible();
  136 |   });
  137 | 
  138 |   test("clicking a locked nav item keeps chat panel visible", async ({ page }) => {
  139 |     await page.getByRole("button", { name: "Dashboard" }).click();
  140 |     // Redirected back to chat — header stays on Support / Chat
  141 |     await expect(page.locator("header h1")).toContainText("Support / Chat");
  142 |   });
  143 | 
  144 |   test("locked buttons show a Lock icon", async ({ page }) => {
  145 |     // At least one Lucide lock icon is rendered in the sidebar
  146 |     const locked = page.locator("aside button").filter({
  147 |       has: page.locator("svg"),
  148 |     });
  149 |     const count = await locked.count();
> 150 |     expect(count).toBeGreaterThan(0);
      |                   ^ Error: expect(received).toBeGreaterThan(expected)
  151 |     // The sidebar itself mentions "Dashboard" (one of the locked items)
  152 |     await expect(page.locator("aside")).toContainText("Dashboard");
  153 |   });
  154 | });
  155 | 
  156 | // ═══════════════════════════════════════════════════════════════════════════════
  157 | // SUITE 3 — Support / Chat panel (account still locked)
  158 | // ═══════════════════════════════════════════════════════════════════════════════
  159 | test.describe("Support / Chat panel", () => {
  160 |   test.beforeEach(async ({ page }) => { await signIn(page); });
  161 | 
  162 |   test("renders a message textarea and Send button", async ({ page }) => {
  163 |     await expect(page.locator("textarea").first()).toBeVisible();
  164 |     await expect(page.getByRole("button", { name: /send/i })).toBeVisible();
  165 |   });
  166 | 
  167 |   test("Send is disabled when textarea is empty", async ({ page }) => {
  168 |     await expect(page.getByRole("button", { name: /send/i })).toBeDisabled();
  169 |   });
  170 | 
  171 |   test("typing into textarea enables Send", async ({ page }) => {
  172 |     await page.locator("textarea").first().fill("Hello, requesting access.");
  173 |     await expect(page.getByRole("button", { name: /send/i })).toBeEnabled();
  174 |   });
  175 | 
  176 |   test("sending a message shows it in the thread", async ({ page }) => {
  177 |     const msg = "Please grant me dashboard access.";
  178 |     await page.locator("textarea").first().fill(msg);
  179 |     await page.getByRole("button", { name: /send/i }).click();
  180 |     await expect(page.getByText(msg)).toBeVisible({ timeout: 12_000 });
  181 |   });
  182 | 
  183 |   test("sidebar badge flips to 'Unlocked' after first message", async ({ page }) => {
  184 |     await page.locator("textarea").first().fill("Unlock me");
  185 |     await page.getByRole("button", { name: /send/i }).click();
  186 |     await expect(page.getByText("Unlocked")).toBeVisible({ timeout: 12_000 });
  187 |   });
  188 | });
  189 | 
  190 | // ═══════════════════════════════════════════════════════════════════════════════
  191 | // SUITE 4 — Navigation (unlock via API first, then sign in once per test)
  192 | // ═══════════════════════════════════════════════════════════════════════════════
  193 | test.describe("Dashboard Navigation (unlocked)", () => {
  194 |   // Unlock the account via Supabase admin PATCH — no browser needed
  195 |   test.beforeAll(async () => {
  196 |     await supabasePatch(
  197 |       "corporates",
  198 |       `slug=eq.${CORP_SLUG}`,
  199 |       { access_status: "active" },
  200 |     );
  201 |   });
  202 | 
  203 |   test.beforeEach(async ({ page }) => { await signIn(page); });
  204 | 
  205 |   const sections = [
  206 |     "Dashboard",
  207 |     "Master Analytics",
  208 |     "Campaign Management",
  209 |     "NGO Management",
  210 |     "Budget & Fund Tracking",
  211 |     "ESG Dashboard",
  212 |     "Impact Monitoring",
  213 |     "Reports & Approvals",
  214 |     "AI Insights",
  215 |     "Audit & Compliance",
  216 |     "Employee Management",
  217 |     "Role & Permissions",
  218 |     "Notifications",
  219 |   ];
  220 | 
  221 |   for (const section of sections) {
  222 |     test(`"${section}" panel loads`, async ({ page }) => {
  223 |       await page.getByRole("button", { name: section }).click();
  224 |       await expect(
  225 |         page.locator("header h1").filter({ hasText: section }),
  226 |       ).toBeVisible({ timeout: 6_000 });
  227 |     });
  228 |   }
  229 | });
  230 | 
  231 | // ═══════════════════════════════════════════════════════════════════════════════
  232 | // SUITE 5 — Dashboard home content
  233 | // ═══════════════════════════════════════════════════════════════════════════════
  234 | test.describe("Dashboard Home Content", () => {
  235 |   test.beforeEach(async ({ page }) => {
  236 |     await signIn(page);
  237 |     await page.getByRole("button", { name: "Dashboard" }).click();
  238 |     await expect(page.getByText(/Welcome back/i)).toBeVisible({ timeout: 8_000 });
  239 |   });
  240 | 
  241 |   test("4 KPI cards are visible", async ({ page }) => {
  242 |     await expect(page.getByText("CSR Budget")).toBeVisible();
  243 |     await expect(page.getByText("Active Campaigns")).toBeVisible();
  244 |     await expect(page.getByText("Pending Approvals")).toBeVisible();
  245 |     await expect(page.getByText("Compliance Health")).toBeVisible();
  246 |   });
  247 | 
  248 |   test("Campaign Overview table is visible", async ({ page }) => {
  249 |     await expect(page.getByText("Campaign Overview")).toBeVisible();
  250 |   });
```