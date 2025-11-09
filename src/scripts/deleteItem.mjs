import { createClient } from "@sanity/client";
import dotenv from "dotenv";
import inquirer from "inquirer";
import chalk from "chalk";

dotenv.config({ path: ".env.local" });

const {
  NEXT_PUBLIC_SANITY_PROJECT_ID,
  NEXT_PUBLIC_SANITY_DATASET,
  SANITY_API_TOKEN,
  NEXT_PUBLIC_SANITY_API_VERSION,
} = process.env;

// Check required environment variables
if (!NEXT_PUBLIC_SANITY_PROJECT_ID || !SANITY_API_TOKEN) {
  console.error(chalk.red.bold("❌ Missing required environment variables!"));
  console.log(chalk.yellow("Please check your .env.local file."));
  process.exit(1);
}

// Initialize Sanity client
const client = createClient({
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: NEXT_PUBLIC_SANITY_DATASET || "production",
  token: SANITY_API_TOKEN,
  apiVersion: NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-15",
  useCdn: false,
});

// Function to delete a document by ID
async function deleteData(id) {
  try {
    const deletedItem = await client.delete(id);
    console.log(chalk.green.bold("\n✅ Item deleted successfully!"));
    console.log(chalk.green(`Deleted ID: ${deletedItem._id}\n`));
  } catch (error) {
    const referencing = error?.response?.body?.error?.items?.[0]?.error?.referencingIDs || [];
    console.error(chalk.red.bold("\n❌ Error deleting item!"));
    console.error(chalk.red(`ID: ${id}`));
    if (referencing.length) {
      console.log(chalk.yellow("Cannot delete because it is referenced by:"));
      referencing.forEach(refId => console.log(chalk.yellow(`   • ${refId}`)));
    } else {
      console.error(chalk.red("Unexpected error:"), error.message || error);
    }
    console.log("\n");
  }
}

// Prompt user for the document ID
async function promptDeletion() {
  const { docId } = await inquirer.prompt([
    {
      type: "input",
      name: "docId",
      message: chalk.cyan("Enter the ID of the document you want to delete:"),
      validate: input => input ? true : "ID cannot be empty!",
    },
  ]);

  const { confirmDelete } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDelete",
      message: chalk.yellow(`Are you sure you want to delete the document with ID "${docId}"?`),
      default: false,
    },
  ]);

  if (confirmDelete) {
    console.log(chalk.blue.bold(`\nDeleting document with ID "${docId}"...\n`));
    await deleteData(docId);
  } else {
    console.log(chalk.gray("❌ Deletion canceled.\n"));
  }
}

// Run the prompt
promptDeletion();
