const AutoChain = artifacts.require("AutoChain");

contract("AutoChain", (accounts) => {
  let autoChain;
  const [admin, constructor1, user1, user2] = accounts;

  beforeEach(async () => {
    autoChain = await AutoChain.new({ from: admin });
  });

  it("Admin peut ajouter un constructeur", async () => {
    await autoChain.addConstructor(constructor1, { from: admin });
    const isCtor = await autoChain.isConstructor(constructor1);
    assert.equal(isCtor, true, "Constructeur ajouté avec succès");
  });

  it("Constructeur peut créer une voiture", async () => {
    await autoChain.addConstructor(constructor1, { from: admin });
    const tx = await autoChain.createCar("VIN123", "Toyota", "Corolla", { from: constructor1 });
    const car = await autoChain.getCar(1);

    assert.equal(car.vin, "VIN123", "VIN correct");
    assert.equal(car.marque, "Toyota", "Marque correcte");
    assert.equal(car.modele, "Corolla", "Modèle correct");
  });

  it("Propriétaire peut mettre en vente une voiture", async () => {
    await autoChain.addConstructor(constructor1, { from: admin });
    await autoChain.createCar("VIN123", "Toyota", "Corolla", { from: constructor1 });
    await autoChain.putCarForSale(1, web3.utils.toWei("1", "ether"), { from: constructor1 });

    const car = await autoChain.getCar(1);
    assert.equal(car.enVente, true, "La voiture est en vente");
    assert.equal(car.prix.toString(), web3.utils.toWei("1", "ether"), "Prix correct");
  });

  it("Un utilisateur peut acheter une voiture", async () => {
    await autoChain.addConstructor(constructor1, { from: admin });
    await autoChain.createCar("VIN123", "Toyota", "Corolla", { from: constructor1 });
    await autoChain.putCarForSale(1, web3.utils.toWei("1", "ether"), { from: constructor1 });

    const sellerBalanceBefore = web3.utils.toBN(await web3.eth.getBalance(constructor1));

    await autoChain.buyCar(1, { from: user1, value: web3.utils.toWei("1", "ether") });

    const car = await autoChain.getCar(1);
    assert.equal(car.enVente, false, "La voiture n’est plus en vente");
    const newOwner = await autoChain.ownerOf(1);
    assert.equal(newOwner, user1, "Propriétaire mis à jour");

    const sellerBalanceAfter = web3.utils.toBN(await web3.eth.getBalance(constructor1));
    assert(sellerBalanceAfter.gt(sellerBalanceBefore), "Le vendeur a reçu l’argent");
  });

  it("Peut annuler la vente", async () => {
    await autoChain.addConstructor(constructor1, { from: admin });
    await autoChain.createCar("VIN123", "Toyota", "Corolla", { from: constructor1 });
    await autoChain.putCarForSale(1, web3.utils.toWei("1", "ether"), { from: constructor1 });
    await autoChain.cancelSale(1, { from: constructor1 });

    const car = await autoChain.getCar(1);
    assert.equal(car.enVente, false, "La vente a été annulée");
  });

  it("Retourne l’historique des propriétaires", async () => {
    await autoChain.addConstructor(constructor1, { from: admin });
    await autoChain.createCar("VIN123", "Toyota", "Corolla", { from: constructor1 });
    await autoChain.putCarForSale(1, web3.utils.toWei("1", "ether"), { from: constructor1 });
    await autoChain.buyCar(1, { from: user1, value: web3.utils.toWei("1", "ether") });

    const history = await autoChain.getCarHistory(1);
    assert.equal(history.length, 2, "Historique correct");
    assert.equal(history[0], constructor1, "Premier propriétaire");
    assert.equal(history[1], user1, "Deuxième propriétaire");
  });
});
