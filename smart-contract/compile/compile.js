const hre = require("hardhat");

async function main() {
  await hre.run("compile");
  console.log("✅ Contract compiled");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
