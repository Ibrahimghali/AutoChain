// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title AutoChain - enregistrement, vente et historique des véhicules
contract AutoChain {
    /* ---------------------- EVENTS ---------------------- */
    event ConstructorAdded(address indexed ctor);
    event ConstructorRemoved(address indexed ctor);
    event CarCreated(uint indexed carId, address indexed creator, string vin);
    event CarListed(uint indexed carId, address indexed seller, uint price);
    event CarSold(uint indexed carId, address indexed seller, address indexed buyer, uint price);

    /* ---------------------- STRUCTS & STATE ---------------------- */
    struct Car {
        uint id;
        string vin;
        string marque;
        string modele;
        address[] proprietaires; // historique
        bool enVente;
        uint prix;
    }

    address public admin;
    uint public nextCarId = 1;
    mapping(uint => Car) private cars;
    mapping(address => bool) public isConstructor;

    /* ---------------------- REENTRANCY GUARD ---------------------- */
    uint private _status; // 1 = not entered, 2 = entered

    constructor() {
        admin = msg.sender;
        _status = 1;
    }

    modifier nonReentrant() {
        require(_status == 1, "Reentrant call");
        _status = 2;
        _;
        _status = 1;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Seul l'admin peut appeler");
        _;
    }

    modifier onlyConstructor() {
        require(isConstructor[msg.sender], "Vous n'etes pas constructeur certifie");
        _;
    }

    modifier carExists(uint carId) {
        require(carId > 0 && carId < nextCarId, "Voiture inexistante");
        _;
    }

    modifier onlyOwner(uint carId) {
        Car storage c = cars[carId];
        require(c.proprietaires.length > 0, "Voiture vide");
        require(c.proprietaires[c.proprietaires.length - 1] == msg.sender, "Vous n'etes pas le proprietaire actuel");
        _;
    }

    /* ---------------------- ADMIN / CONSTRUCTEUR ---------------------- */
    function addConstructor(address ctor) external onlyAdmin {
        require(ctor != address(0), "Adresse invalide");
        isConstructor[ctor] = true;
        emit ConstructorAdded(ctor);
    }

    function removeConstructor(address ctor) external onlyAdmin {
        require(isConstructor[ctor], "Pas un constructeur");
        isConstructor[ctor] = false;
        emit ConstructorRemoved(ctor);
    }

    /* ---------------------- CREATION / VENTE / ACHAT ---------------------- */
    function createCar(string memory vin, string memory marque, string memory modele)
        external
        onlyConstructor
        returns (uint)
    {
        uint carId = nextCarId++;
        Car storage c = cars[carId];
        c.id = carId;
        c.vin = vin;
        c.marque = marque;
        c.modele = modele;
        c.proprietaires.push(msg.sender);
        c.enVente = false;
        c.prix = 0;

        emit CarCreated(carId, msg.sender, vin);
        return carId;
    }

    function putCarForSale(uint carId, uint prix) external carExists(carId) onlyOwner(carId) {
        require(prix > 0, "Prix doit etre > 0");
        Car storage c = cars[carId];
        c.enVente = true;
        c.prix = prix;
        emit CarListed(carId, msg.sender, prix);
    }

    function cancelSale(uint carId) external carExists(carId) onlyOwner(carId) {
        Car storage c = cars[carId];
        require(c.enVente, "Voiture pas en vente");
        c.enVente = false;
        c.prix = 0;
    }

    function buyCar(uint carId) external payable carExists(carId) nonReentrant {
        Car storage c = cars[carId];
        require(c.enVente, "Voiture non en vente");
        require(msg.sender != c.proprietaires[c.proprietaires.length - 1], "Impossible d'acheter votre propre voiture");
        require(msg.value >= c.prix, "Valeur envoyee insuffisante");

        address seller = c.proprietaires[c.proprietaires.length - 1];
        uint price = c.prix;

        // Désactiver vente avant transfert
        c.enVente = false;
        c.prix = 0;
        c.proprietaires.push(msg.sender);

        // Transfert du paiement
        (bool sent, ) = payable(seller).call{value: price}("");
        require(sent, "Echec du virement au vendeur");

        // Remboursement excès
        if (msg.value > price) {
            uint excess = msg.value - price;
            (bool refunded, ) = payable(msg.sender).call{value: excess}("");
            require(refunded, "Echec remboursement excedent");
        }

        emit CarSold(carId, seller, msg.sender, price);
    }

    /* ---------------------- GETTERS ---------------------- */
    function getCarHistory(uint carId) external view carExists(carId) returns (address[] memory) {
        return cars[carId].proprietaires;
    }

    function ownerOf(uint carId) public view carExists(carId) returns (address) {
        Car storage c = cars[carId];
        require(c.proprietaires.length > 0, "Aucun proprietaire");
        return c.proprietaires[c.proprietaires.length - 1];
    }

    function getCar(uint carId)
        external
        view
        carExists(carId)
        returns (
            uint id,
            string memory vin,
            string memory marque,
            string memory modele,
            bool enVente,
            uint prix
        )
    {
        Car storage c = cars[carId];
        return (c.id, c.vin, c.marque, c.modele, c.enVente, c.prix);
    }

    function getCarsForSale() external view returns (uint[] memory) {
        uint count = 0;
        for (uint i = 1; i < nextCarId; i++) {
            if (cars[i].enVente) {
                count++;
            }
        }
        uint[] memory list = new uint[](count);
        uint idx = 0;
        for (uint i = 1; i < nextCarId; i++) {
            if (cars[i].enVente) {
                list[idx++] = i;
            }
        }
        return list;
    }
}
