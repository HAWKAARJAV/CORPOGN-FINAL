# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: corporate-dashboard.spec.ts >> Sign-In Page >> signs in successfully and lands on corporate dashboard
- Location: tests/corporate-dashboard.spec.ts:114:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('CorpoGN')
Expected: visible
Error: strict mode violation: getByText('CorpoGN') resolved to 2 elements:
    1) <span class="text-xl font-bold tracking-tight text-blue-400">CorpoGN</span> aka getByText('CorpoGN', { exact: true })
    2) <h3 class="text-lg font-semibold">Live chat with Corpogn Admin</h3> aka getByRole('heading', { name: 'Live chat with Corpogn Admin' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('CorpoGN')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - button "Open Next.js Dev Tools" [ref=e7] [cursor=pointer]:
    - img [ref=e8]
  - alert [ref=e11]
  - main [ref=e12]:
    - complementary [ref=e13]:
      - generic [ref=e15]: CorpoGN
      - generic [ref=e16]:
        - generic [ref=e17]:
          - img [ref=e19]
          - generic [ref=e23]:
            - paragraph [ref=e24]: Test Corporation 1779790071315
            - paragraph [ref=e25]: Corporate workspace
        - generic [ref=e26]: Chat required
      - navigation [ref=e27]:
        - button "Dashboard" [ref=e28]:
          - img [ref=e29]
          - generic [ref=e34]: Dashboard
          - img [ref=e35]
        - button "Master Analytics" [ref=e38]:
          - img [ref=e39]
          - generic [ref=e41]: Master Analytics
          - img [ref=e42]
        - button "Campaign Management" [ref=e45]:
          - img [ref=e46]
          - generic [ref=e51]: Campaign Management
          - img [ref=e52]
        - button "NGO Management" [ref=e55]:
          - img [ref=e56]
          - generic [ref=e61]: NGO Management
          - img [ref=e62]
        - button "Budget & Fund Tracking" [ref=e65]:
          - img [ref=e66]
          - generic [ref=e69]: Budget & Fund Tracking
          - img [ref=e70]
        - button "ESG Dashboard" [ref=e73]:
          - img [ref=e74]
          - generic [ref=e77]: ESG Dashboard
          - img [ref=e78]
        - button "Impact Monitoring" [ref=e81]:
          - img [ref=e82]
          - generic [ref=e84]: Impact Monitoring
          - img [ref=e85]
        - button "Reports & Approvals" [ref=e88]:
          - img [ref=e89]
          - generic [ref=e92]: Reports & Approvals
          - img [ref=e93]
        - button "AI Insights" [ref=e96]:
          - img [ref=e97]
          - generic [ref=e100]: AI Insights
          - img [ref=e101]
        - button "Audit & Compliance" [ref=e104]:
          - img [ref=e105]
          - generic [ref=e108]: Audit & Compliance
          - img [ref=e109]
        - button "Employee Management" [ref=e112]:
          - img [ref=e113]
          - generic [ref=e117]: Employee Management
          - img [ref=e118]
        - button "Role & Permissions" [ref=e121]:
          - img [ref=e122]
          - generic [ref=e125]: Role & Permissions
          - img [ref=e126]
        - button "Notifications" [ref=e129]:
          - img [ref=e130]
          - generic [ref=e133]: Notifications
          - img [ref=e134]
        - button "Support / Chat" [ref=e137]:
          - img [ref=e139]
          - generic [ref=e141]: Support / Chat
    - generic [ref=e142]:
      - generic [ref=e143]:
        - generic [ref=e144]:
          - heading "Support / Chat" [level=1] [ref=e145]
          - generic [ref=e146]: Corporate
        - generic [ref=e147]:
          - button [ref=e148]:
            - img [ref=e149]
          - generic [ref=e152]:
            - img [ref=e154]
            - generic [ref=e158]: corp+1779790071315
      - generic [ref=e160]:
        - generic [ref=e161]:
          - generic [ref=e162]:
            - heading "Live chat with Corpogn Admin" [level=3] [ref=e163]
            - paragraph [ref=e164]: Send a first message to unlock the corporate workspace for testing.
          - generic [ref=e165]: Waiting for first message
        - generic [ref=e167]: No messages yet.
        - generic [ref=e169]:
          - textbox "Type your message..." [ref=e170]
          - button "Send" [disabled] [ref=e171]
```

# Test source

```ts
  17  |  */
  18  | 
  19  | import { test, expect, Page } from "@playwright/test";
  20  | 
  21  | // ─── Constants ────────────────────────────────────────────────────────────────
  22  | const BASE_URL        = "http://localhost:3000";
  23  | const SUPABASE_URL    = "https://raputhcphpbataxtwnzd.supabase.co";
  24  | const SERVICE_ROLE    =
  25  |   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhcHV0aGNwaHBiYXRheHR3bnpkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDg4MDUzNiwiZXhwIjoyMDkwNDU2NTM2fQ.tlSAqFZVxvDc4dhcOShBHydq_F-mZLrtCdGORvhzw3Q";
  26  | 
  27  | const CORP_PASS = "TestCorp@2026!";
  28  | let CORP_EMAIL  = "";
  29  | let CORP_SLUG   = "";
  30  | 
  31  | // ─── Supabase helpers (used outside the browser) ──────────────────────────────
  32  | async function supabasePatch(table: string, filter: string, body: object) {
  33  |   const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
  34  |     method: "PATCH",
  35  |     headers: {
  36  |       apikey: SERVICE_ROLE,
  37  |       Authorization: `Bearer ${SERVICE_ROLE}`,
  38  |       "Content-Type": "application/json",
  39  |       Prefer: "return=minimal",
  40  |     },
  41  |     body: JSON.stringify(body),
  42  |   });
  43  |   if (!res.ok && res.status !== 204) {
  44  |     throw new Error(`PATCH ${table} failed: ${await res.text()}`);
  45  |   }
  46  | }
  47  | 
  48  | // ─── Create the test account once before all tests ───────────────────────────
  49  | test.beforeAll(async ({ request }) => {
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
> 117 |     await expect(page.getByText("CorpoGN")).toBeVisible();
      |                                             ^ Error: expect(locator).toBeVisible() failed
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
  150 |     expect(count).toBeGreaterThan(0);
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
```