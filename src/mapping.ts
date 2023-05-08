import { ethereum } from "@graphprotocol/graph-ts";
import {
  OrdersMatched,
  OrderApprovedPartOne,
  OrderApprovedPartTwo,
} from "../generated/OpenSea/OpenSea";
import {
  getOrCreateAccount,
  updateBuyerAggregates,
  updateSellerAggregates,
} from "./functions/a1";
import { getOrCreateAuction } from "./functions/a2";
import {
  getOrCreateCollection,
  updateCollectionAggregates,
} from "./functions/c";
import { getOrCreateFee } from "./functions/f";

import { getOrCreateNft, updateNftMetrics } from "./functions/nft";
import { getOrCreateSale, updateSale } from "./functions/sale";
import { getOrCreatePaymentToken } from "./functions/p";
import GlobalConstants from "./utils";


export function handleOrdersMatched(event: OrdersMatched): void {
  let buyHash = event.params.buyHash;
  let sellHash = event.params.sellHash;
  let price = GlobalConstants.convertPriceToBigDecimal(event.params.price);
  let maker = event.params.maker;
  let taker = event.params.taker;

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
        const tokenId = ethereum.decode("uint256", _tokenID)!.toBigInt();

        let buyer = getOrCreateAccount(maker);
        let seller = getOrCreateAccount(taker);
        let collection = getOrCreateCollection(_address.toHexString());
        let nft = getOrCreateNft(tokenId, collection, maker);
        let sale = getOrCreateSale(event);

        updateCollectionAggregates(collection, buyer, price, nft);
        updateNftMetrics(buyer, sale, tokenId, collection, nft);
        updateSellerAggregates(seller, price);
        updateBuyerAggregates(buyer, price);
        updateSale(sale, buyHash, sellHash, buyer, seller, price, collection);

        buyer.save();
        seller.save();
        collection.save();
        nft.save();
        sale.save();
      }
    }
  }
}

export function handleOrderApprovedPartOne(event: OrderApprovedPartOne): void {
  let fee = getOrCreateFee(event);
  let collection = getOrCreateCollection(event.params.feeRecipient.toHexString());

  fee.feeRecipient = collection.id;
  fee.takerProtocolFee = event.params.takerProtocolFee;
  fee.makerProtocolFee = event.params.makerProtocolFee;
  fee.makerRelayerFee = event.params.makerRelayerFee;
  fee.takerProtocolFee = event.params.takerRelayerFee;

  fee.save();
}

export function handleOrderApprovedPartTwo(event: OrderApprovedPartTwo): void {
  let auction = getOrCreateAuction(event.params.hash.toHexString(), event);
  let paymentToken = getOrCreatePaymentToken(event.params.paymentToken);

  auction.listingTime = event.params.listingTime;
  auction.basePrice = event.params.basePrice;
  auction.expirationTime = event.params.expirationTime;
  auction.paymentToken = paymentToken.id;
  auction.staticExtraData = event.params.staticExtradata;
  auction.extra = event.params.extra;
  auction.hash = event.params.hash;
  auction.orderbook = event.params.orderbookInclusionDesired;

  auction.save();
  paymentToken.save();
}

