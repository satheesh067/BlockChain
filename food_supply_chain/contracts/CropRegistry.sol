// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FoodSupplyChain {
    struct Crop {
        uint id;
        string name;
        uint quantity;
        uint price;
        address farmer;
        bool sold;
    }

    uint public cropCount = 0;
    mapping(uint => Crop) public crops;

    event CropRegistered(uint id, string name, uint quantity, uint price, address farmer);
    event CropSold(uint id, address buyer);

    function registerCrop(string memory _name, uint _quantity, uint _price) public {
        cropCount++;
        crops[cropCount] = Crop(cropCount, _name, _quantity, _price, msg.sender, false);
        emit CropRegistered(cropCount, _name, _quantity, _price, msg.sender);
    }

    function buyCrop(uint _id) public payable {
        Crop storage crop = crops[_id];
        require(!crop.sold, "Already sold");
        require(msg.value >= crop.price, "Not enough payment");

        crop.sold = true;
        payable(crop.farmer).transfer(crop.price);

        emit CropSold(_id, msg.sender);
    }

    function getCrop(uint _id) public view returns (
        uint, string memory, uint, uint, address, bool
    ) {
        Crop memory crop = crops[_id];
        return (crop.id, crop.name, crop.quantity, crop.price, crop.farmer, crop.sold);
    }
}
