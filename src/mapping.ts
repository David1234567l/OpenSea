import { Address, BigDecimal } from '@graphprotocol/graph-ts';
import GlobalConstants from './utils'; 
import { OrdersMatched, OrderApprovedPartOne, OrderApprovedPartTwo } from '../generated/OpenSea/OpenSea';


export function getOrCreateAccount(addr: Address): Account {
  let accountId = addr.toHexString();
  let acc = Account.load(accountId);
  if (!acc) {
    acc = new Account(accountId);
    acc.numberOfSales = GlobalConstants.BI_ZERO;
    acc.numberOfPurchases = GlobalConstants.BI_ZERO;
    acc.totalSpent = GlobalConstants.BD_ZERO;
    acc.totalEarned = GlobalConstants.BD_ZERO;

    acc.save();
  }

  return acc as Account;
}

export function updateSellerAggregates(sellerAcc: Account, cost: BigDecimal): void {
  sellerAcc.numberOfSales = sellerAcc.numberOfSales.plus(GlobalConstants.BI_ONE);
  sellerAcc.totalEarned = sellerAcc.totalEarned.plus(cost);
}

export function updateBuyerAggregates(buyerAcc: Account, cost: BigDecimal): void {
  buyerAcc.totalSpent = buyerAcc.totalSpent.plus(cost);
  buyerAcc.numberOfPurchases = buyerAcc.numberOfPurchases.plus(GlobalConstants.BI_ONE);
}

import { Auction } from '../generated/schema';

export function getOrCreateAuction(auctionHash: string, event: ethereum.Event): Auction {
  let auc = Auction.load(auctionHash);
  if (!auc) {
    auc = new Auction(auctionHash);
    auc.timestamp = event.block.timestamp;
    auc.txHash = event.transaction.hash;
    auc.blockHash = event.block.hash;
    auc.logNumber = event.logIndex;
    auc.blockNumber = event.block.number;
    auc.eventType = 'AUCTION';
  }
  return auc as Auction;
}

import { OpenSea } from '../generated/OpenSea/OpenSea';
import { ERC721 } from '../generated/OpenSea/ERC721';
import { Nft } from '../generated/schema';


export function getOrCreateCollection(collectionId: string): Collection {
  let col = Collection.load(collectionId);

  if (!col) {
    col = new Collection(collectionId);
    col.totalSupply = GlobalConstants.BI_ZERO;
    col.totalSales = GlobalConstants.BD_ZERO;
    col.numberOfSales = GlobalConstants.BI_ZERO;

    // let collectionCall = ERC721.bind(Address.fromString(collectionId));
    // col.name = collectionCall._name;
  }

  return col;
}

export function updateCollectionAggregates(
  col: Collection,
  buyerAcc: Account,
  cost: BigDecimal,
  nftEntity: Nft
): void {
  col.owner = buyerAcc.id;
  col.numberOfSales = col.numberOfSales.plus(
    GlobalConstants.BI_ONE
  );
  col.totalSales = col.totalSales.plus(cost);
  col.nft = nftEntity.id;
}
import { Fee } from '../generated/schema';


export function getOrCreateFee(event: ethereum.Event): Fee {
  let feeEntity = Fee.load(GlobalConstants.globalId(event));
  if (!feeEntity) {
    feeEntity = new Fee(GlobalConstants.globalId(event));
    feeEntity.timestamp = event.block.timestamp;
    feeEntity.txHash = event.transaction.hash;
    feeEntity.blockHash = event.block.hash;
    feeEntity.logNumber = event.logIndex;
    feeEntity.blockNumber = event.block.number;
    feeEntity.eventType = 'FEE';
  }
  return feeEntity as Fee;
}
import { BigInt } from '@graphprotocol/graph-ts';


export function getOrCreateNft(
  tokenID: BigInt,
  col: Collection,
  ownerAddr: Address
): Nft {
  let nftEntity = Nft.load(col.id.concat('-').concat(tokenID.toString()));
  if (!nftEntity) {
    nftEntity = new Nft(col.id.concat('-').concat(tokenID.toString()));
    nftEntity.tokenID = tokenID;
    nftEntity.owner = ownerAddr.toHexString();
    nftEntity.numberOfSales = GlobalConstants.BI_ZERO;
  }
  return nftEntity;
}

import { PaymentToken } from '../generated/schema';


export function getOrCreatePaymentToken(paymentTokenAddress: Address): PaymentToken {
  let payToken = PaymentToken.load(paymentTokenAddress.toHexString());
  if (!payToken) {
    payToken = new PaymentToken(paymentTokenAddress.toHexString());
    //  payToken.symbol = PaymentTokens.get(paymentTokenAddress.toHexString());
    payToken.address = paymentTokenAddress.toHexString();
    payToken.numberOfSales = GlobalConstants.BI_ZERO;
  }
  return payToken as PaymentToken;
}
import { Bytes, ethereum } from '@graphprotocol/graph-ts';
import { Account, Collection, Sale } from '../generated/schema';


export function getOrCreateSale(event: ethereum.Event): Sale {
  let saleEntity = Sale.load(GlobalConstants.globalId(event));
  if (!saleEntity) {
    saleEntity = new Sale(GlobalConstants.globalId(event));
    saleEntity.timestamp = event.block.timestamp;
    saleEntity.txHash = event.transaction.hash;
    saleEntity.blockHash = event.block.hash;
    saleEntity.logNumber = event.logIndex;
    saleEntity.blockNumber = event.block.number;
    saleEntity.eventType = 'SALE';
  }
  return saleEntity as Sale;
}

export function updateSale(
  saleEntity: Sale,
  buyHashData: Bytes,
  sellHashData: Bytes,
  buyerAcc: Account,
  sellerAcc: Account,
  cost: BigDecimal,
  col: Collection
): void {
  saleEntity.buyHash = buyHashData;
  saleEntity.sellHash = sellHashData;
  saleEntity.seller = sellerAcc.id;
  saleEntity.buyer = buyerAcc.id;
  saleEntity.price = cost;
  saleEntity.collection = col.id;
}

export function updateNftMetrics(
  buyerAcc: Account,
  saleEntity: Sale,
  tokenID: BigInt,
  col: Collection,
  nftEntity: Nft
): void {
  nftEntity.owner = buyerAcc.id;
  nftEntity.sale = saleEntity.id;
  nftEntity.tokenID = tokenID;
  nftEntity.collection = col.id;
  nftEntity.numberOfSales = nftEntity.numberOfSales.plus(GlobalConstants.BI_ONE);
}


export function handleOrdersMatched(event: OrdersMatched): void {
  let buyHashData = event.params.buyHash;
  let sellHashData = event.params.sellHash;
  let cost = GlobalConstants.convertPriceToBigDecimal(event.params.price);
  let makerAcc = event.params.maker;
  let takerAcc = event.params.taker;

  let receipt = event.receipt;

  if (receipt) {
    for (let index = 0; index < receipt.logs.length; index++) {
      const _topic0 = receipt.logs[index].topics[0];
      const _address = receipt.logs[index].address;
      if (
        _topic0.equals(GlobalConstants.TRANSFER_SIG) &&
        _address.toHexString() == GlobalConstants.GALAKTIC_GANG
      ) {
        const _tokenID = receipt.logs[index].topics[3];
        const tokenID = ethereum.decode("uint256", _tokenID)!.toBigInt();

        let buyer = getOrCreateAccount(makerAcc);
        let seller = getOrCreateAccount(takerAcc);
        let col = getOrCreateCollection(_address.toHexString());
        let nftEntity = getOrCreateNft(tokenID, col, makerAcc);
        let saleEntity = getOrCreateSale(event);

        updateCollectionAggregates(col, buyer, cost, nftEntity);
        updateNftMetrics(buyer, saleEntity, tokenID, col, nftEntity);
        updateSellerAggregates(seller, cost);
        updateBuyerAggregates(buyer, cost);
        updateSale(saleEntity, buyHashData, sellHashData, buyer, seller, cost, col);

        buyer.save();
        seller.save();
        col.save();
        nftEntity.save();
        saleEntity.save();
      }
    }
  }
}

export function handleOrderApprovedPartOne(event: OrderApprovedPartOne): void {
  let feeEntity = getOrCreateFee(event);
  let col = getOrCreateCollection(event.params.feeRecipient.toHexString());

  feeEntity.feeRecipient = col.id;
  feeEntity.takerProtocolFee = event.params.takerProtocolFee;
  feeEntity.makerProtocolFee = event.params.makerProtocolFee;
  feeEntity.makerRelayerFee = event.params.makerRelayerFee;
  feeEntity.takerProtocolFee = event.params.takerRelayerFee;

  feeEntity.save();
}

export function handleOrderApprovedPartTwo(event: OrderApprovedPartTwo): void {
  let auctionEntity = getOrCreateAuction(event.params.hash.toHexString(), event);
  let payToken = getOrCreatePaymentToken(event.params.paymentToken);

  auctionEntity.listingTime = event.params.listingTime;
  auctionEntity.basePrice = event.params.basePrice;
  auctionEntity.expirationTime = event.params.expirationTime;
  auctionEntity.paymentToken = payToken.id;
  auctionEntity.staticExtraData = event.params.staticExtradata;
  auctionEntity.extra = event.params.extra;
  auctionEntity.hash = event.params.hash;
  auctionEntity.orderbook = event.params.orderbookInclusionDesired;

  auctionEntity.save();
  payToken.save();
}