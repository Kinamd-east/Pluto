const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("🚀 Deploying from:", deployer.address);

  // 1. Deploy PlutoCoin (ERC20)
  const PlutoCoin = await ethers.getContractFactory("PlutoCoin");
  const coin = await PlutoCoin.deploy(deployer.address);
  await coin.waitForDeployment();
  console.log("✅ PlutoCoin deployed at:", coin.target);

  // 2. Deploy BattleCardNFT
  const BattleCardNFT = await ethers.getContractFactory("BattleCardNFT");
  const nft = await BattleCardNFT.deploy();
  await nft.waitForDeployment();
  console.log("✅ BattleCardNFT deployed at:", nft.target);

  // 3. Deploy CardMarketplace
  const CardMarketplace = await ethers.getContractFactory("CardMarketplace");
  const marketplace = await CardMarketplace.deploy(
    coin.target,
    nft.target,

    deployer.address
  );
  await marketplace.waitForDeployment();
  console.log("✅ CardMarketplace deployed at:", marketplace.target);

  // 4. Deploy PlutoCoinStore
  const PlutoCoinStore = await ethers.getContractFactory("PlutoCoinStore");
  const store = await PlutoCoinStore.deploy(
    coin.target,
    deployer.address,
    deployer.address
  );
  await store.waitForDeployment();
  console.log("✅ PlutoCoinStore deployed at:", store.target);

  // 5. Set PlutoCoinStore as authorized minter
  await coin.setMinter(store.target);
  console.log("🔑 PlutoCoin minter set to PlutoCoinStore");

  console.log("\n🎉 All contracts deployed successfully!");
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exit(1);
});
