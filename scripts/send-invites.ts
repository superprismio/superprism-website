import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types/supabase";

// Load environment variables from .env file
config();

type EarlySignup = Database["public"]["Tables"]["early_signups"]["Row"];

async function sendInvites() {
  console.log("Starting invite process...");

  // Validate environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error(
      "Error: Missing required environment variables.\n" +
        "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
    );
    process.exit(1);
  }

  // Create admin client with service role
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Get all users from early_signups table
  const { data: signups, error: fetchError } = await supabase
    .from("early_signups")
    .select("*");

  if (fetchError) {
    console.error("Error fetching early signups:", fetchError);
    process.exit(1);
  }

  if (!signups || signups.length === 0) {
    console.log("No early signups found.");
    return;
  }

  console.log(`Found ${signups.length} early signups.`);

  // Filter out records that already have invitedAt in metadata
  const toInvite = signups.filter((signup) => {
    const metadata = signup.metadata as Record<string, unknown> | null;
    return !metadata || !metadata.invitedAt;
  });

  console.log(`${toInvite.length} users need invites (${signups.length - toInvite.length} already invited).`);

  if (toInvite.length === 0) {
    console.log("All users have already been invited.");
    return;
  }

  const inviteDate = new Date().toISOString();
  let successCount = 0;
  let errorCount = 0;

  // Process each user
  for (const signup of toInvite) {
    try {
      console.log(`Sending invite to ${signup.email}...`);

      // Send invite email
      const { data: inviteData, error: inviteError } =
        await supabase.auth.admin.inviteUserByEmail(signup.email);

      if (inviteError) {
        console.error(`Error inviting ${signup.email}:`, inviteError.message);
        errorCount++;
        continue;
      }

      // Update metadata with invitedAt date
      const currentMetadata = (signup.metadata as Record<string, unknown>) || {};
      const updatedMetadata = {
        ...currentMetadata,
        invitedAt: inviteDate,
      };

      const { error: updateError } = await supabase
        .from("early_signups")
        .update({ metadata: updatedMetadata })
        .eq("id", signup.id);

      if (updateError) {
        console.error(
          `Error updating metadata for ${signup.email}:`,
          updateError.message
        );
        errorCount++;
        continue;
      }

      console.log(`✓ Successfully invited ${signup.email}`);
      successCount++;
    } catch (error) {
      console.error(`Unexpected error processing ${signup.email}:`, error);
      errorCount++;
    }
  }

  console.log("\n=== Summary ===");
  console.log(`Total processed: ${toInvite.length}`);
  console.log(`Successful: ${successCount}`);
  console.log(`Errors: ${errorCount}`);
}

// Run the script
sendInvites()
  .then(() => {
    console.log("\nInvite process completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
  });
