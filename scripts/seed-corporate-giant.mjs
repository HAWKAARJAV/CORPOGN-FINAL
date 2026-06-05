import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function readEnv() {
  const raw = fs.readFileSync(path.join(__dirname, "../.env.local"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const [key, ...rest] = line.split("=");
    if (key && rest.length) env[key.trim()] = rest.join("=").trim();
  }
  return env;
}

const env = readEnv();
const URL = env["NEXT_PUBLIC_SUPABASE_URL"];
const KEY = env["SUPABASE_SERVICE_ROLE_KEY"];
const supabase = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

async function main() {
  const email = "admin@corporate-giant.example";
  const password = "Employee@2026";

  console.log("Seeding Corporate Giant...");

  // 1. Create Auth User
  const { data: existingUsers } = await supabase.auth.admin.listUsers();
  let userId = existingUsers?.users?.find(u => u.email === email)?.id;

  if (userId) {
    console.log(`Corporate Giant auth user already exists: ${userId}`);
  } else {
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: "Corporate Giant Admin",
        account_type: "corporate",
      }
    });

    if (createError) {
      throw createError;
    }
    userId = newUser.user.id;
    console.log(`Created auth user: ${userId}`);
  }

  // 2. Insert Corporate Record
  const { data: existingCorp } = await supabase
    .from("corporates")
    .select("id")
    .eq("slug", "corporate-giant")
    .maybeSingle();

  if (existingCorp) {
    console.log("Corporate Giant record already exists in public.corporates");
  } else {
    const { error: insertError } = await supabase
      .from("corporates")
      .insert({
        auth_user_id: userId,
        slug: "corporate-giant",
        company_name: "Corporate Giant",
        company_email: email,
        access_status: "active",
      });

    if (insertError) {
      throw insertError;
    }
    console.log("Inserted corporate giant record successfully!");
  }
}

main().catch(err => {
  console.error("Error seeding corporate giant:", err.message);
  process.exit(1);
});
