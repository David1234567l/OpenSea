import { BigInt } from "@graphprotocol/graph-ts";
 import { Transfer } from "../generated/NFTContract/NFTContract";
 import { Token, Transfer as TransferEntity } from "../generated/schema";
 export function handleTransfer(event: Transfer): void {
 let token = Token.load(event.params.tokenId.toString());
 if (token == null) {
 token = new Token(event.params.tokenId.toString());
 token.metadataURI = "";
 }
 token.owner = event.params.to;
 token.save();
 let transfer = new TransferEntity(
 event.transaction.hash.toHex() + "-" + event.logIndex.toString()
 );
 transfer.token = token.id;
 transfer.from = event.params.from;
 transfer.to = event.params.to;
 transfer.timestamp = event.block.timestamp;
 transfer.save();
 }