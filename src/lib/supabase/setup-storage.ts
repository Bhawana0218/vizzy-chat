import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Run this script once to set up Supabase storage buckets.
 * Usage: npx tsx src/lib/supabase/setup-storage.ts
 */

async function setupStorage() {
  const supabase = createAdminClient();

  const buckets = [
    {
      name: "uploads",
      public: false,
      fileSizeLimit: 50 * 1024 * 1024, // 50MB
      allowedMimeTypes: [
        "image/*",
        "video/*",
        "application/pdf",
        "application/octet-stream",
      ],
    },
    {
      name: "generated-assets",
      public: false,
      fileSizeLimit: 100 * 1024 * 1024, // 100MB
      allowedMimeTypes: ["image/*", "video/*"],
    },
    {
      name: "thumbnails",
      public: true,
      fileSizeLimit: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ["image/*"],
    },
  ];

  for (const bucket of buckets) {
    const { data, error } = await supabase.storage.createBucket(
      bucket.name,
      {
        public: bucket.public,
        fileSizeLimit: bucket.fileSizeLimit,
        allowedMimeTypes: bucket.allowedMimeTypes,
      }
    );

    if (error) {
      if (error.message.includes("already exists")) {
        console.log(`Bucket "${bucket.name}" already exists, skipping.`);
      } else {
        console.error(`Error creating bucket "${bucket.name}":`, error);
      }
    } else {
      console.log(`Bucket "${bucket.name}" created successfully.`, data);
    }
  }

  // Set up RLS policies for user-scoped access
  console.log("\nStorage buckets setup complete.");
  console.log("Note: Configure RLS policies in the Supabase dashboard for:");
  console.log("  - uploads: Users can only access their own files");
  console.log("  - generated-assets: Users can only access their own generated files");
  console.log("  - thumbnails: Public read, authenticated write");
}

setupStorage().catch(console.error);
