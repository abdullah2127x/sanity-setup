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

if (!NEXT_PUBLIC_SANITY_PROJECT_ID || !SANITY_API_TOKEN) {
  console.error(chalk.red.bold("❌ Missing required environment variables!"));
  console.log(chalk.yellow("Please check your .env.local file."));
  process.exit(1);
}

const client = createClient({
  projectId: NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: NEXT_PUBLIC_SANITY_DATASET || "production",
  token: SANITY_API_TOKEN,
  apiVersion: NEXT_PUBLIC_SANITY_API_VERSION || "2025-01-15",
  useCdn: false,
});

async function deleteData(productType) {
  try {
    const dataToDelete = await client.fetch(
      `*[_type == "${productType}"]{_id, _type}`
    );

    if (!dataToDelete.length) {
      console.log(chalk.gray(`⚪ No "${productType}" items found to delete.`));
      return;
    }

    console.log(chalk.blue.bold(`\nDeleting all "${productType}" items...\n`));

    let success = [];
    let failed = [];

    for (const [index, item] of dataToDelete.entries()) {
      process.stdout.write(
        chalk.cyan(
          `Processing ${index + 1}/${dataToDelete.length} → ${item._id} ... `
        )
      );
      try {
        await client.delete(item._id);
        success.push(item._id);
        console.log(chalk.green.bold("Deleted ✅"));
      } catch (err) {
        const referencing =
          err?.response?.body?.error?.items?.[0]?.error?.referencingIDs || [];
        failed.push({ id: item._id, referencing });
        console.log(chalk.red.bold("Failed ❌"));
      }
    }

    console.log(
      chalk.green.bold(`\n🟢 Successfully deleted: ${success.length} item(s)`)
    );
    if (success.length)
      success.forEach((id) => console.log(chalk.green(`   ✅ ${id}`)));

    if (failed.length) {
      console.log(
        chalk.red.bold(
          `\n🔴 Failed to delete: ${failed.length} item(s) (still referenced)`
        )
      );
      failed.forEach((f) => {
        console.log(chalk.red(`   ❌ ID: ${f.id}`));
        if (f.referencing.length)
          console.log(
            chalk.yellow(`      Referenced by: ${f.referencing.join(", ")}`)
          );
      });
    }

    console.log("\n" + "-".repeat(50) + "\n"); // Separator
  } catch (error) {
    console.error(chalk.red.bold("❌ Unexpected error:"), error);
  }
}

async function promptDeletion() {
  const { typeToDelete } = await inquirer.prompt([
    {
      type: "list",
      name: "typeToDelete",
      message: chalk.cyan("Select the data type you want to delete:"),
      choices: ["product", "color", "fabric"],
    },
  ]);

  const { confirmDelete } = await inquirer.prompt([
    {
      type: "confirm",
      name: "confirmDelete",
      message: chalk.yellow(
        `Are you sure you want to delete all "${typeToDelete}" items?`
      ),
      default: false,
    },
  ]);

  if (confirmDelete) {
    await deleteData(typeToDelete);
  } else {
    console.log(chalk.gray("❌ Deletion canceled."));
  }
}

promptDeletion();
