"use strict";
exports.__esModule = true;
var crypto_js_1 = require("crypto-js");
var Block = /** @class */ (function () {
    function Block(data, previousHash, index) {
        if (index === void 0) { index = 0; }
        this.index = index;
        this.data = data;
        this.timestamp = Date.now();
        this.previousHash = previousHash || null;
        this.hash = this.calculateHash();
        this.nonce = 0; // used to avoid infinite loop on mining method, needed to change the hash
    }
    Block.prototype.calculateHash = function () {
        return crypto_js_1.SHA256("" + this.index + this.previousHash + this.timestamp + this.nonce + JSON.stringify(this.data)).toString();
    };
    /**this method is used as a prof of work, according with difficulty
     * it will try to geerate a hash that has the amount of 0
     */
    Block.prototype.mining = function (difficulty) {
        while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
            this.nonce++;
            this.hash = this.calculateHash();
        }
        console.log("Block mined " + this.hash);
        return this;
    };
    return Block;
}());
var BlockChain = /** @class */ (function () {
    function BlockChain() {
        this.chain = [this.createGenesisBlock()];
        this.difficulty = 2;
    }
    BlockChain.prototype.createGenesisBlock = function () {
        console.log('First block created');
        return new Block({ description: 'Start Block' }, '0', 0);
    };
    BlockChain.prototype.getLastestBlock = function () {
        return this.chain[this.chain.length - 1];
    };
    BlockChain.prototype.add = function (block) {
        var lastBlock = this.getLastestBlock();
        block.previousHash = lastBlock.hash;
        block.index = lastBlock.index + 1;
        block.mining(this.difficulty);
        this.chain.push(block);
        console.log("Block added " + block.hash);
    };
    BlockChain.prototype.show = function () {
        return this.chain;
    };
    BlockChain.prototype.isValid = function () {
        for (var index = 1; index < this.chain.length; index++) {
            var block_1 = this.chain[index];
            var previousBlock = this.chain[index - 1];
            if (block_1.hash !== block_1.calculateHash()) {
                return false;
            }
            if (block_1.previousHash !== previousBlock.hash) {
                return false;
            }
            console.error("Blockchain is invalid");
        }
        console.log("Blockchain is valid");
        return true;
    };
    return BlockChain;
}());
console.log('start');
var blockchain = new BlockChain();
var block = new Block({ amount: 4 });
blockchain.add(block);
var block2 = new Block({ amount: 2 });
blockchain.add(block2);
var chain = blockchain.show();
console.log('chain', chain);
console.log('done');
