import { ethereum, BigInt, Bytes, BigDecimal } from '@graphprotocol/graph-ts'

export default class GlobalConstants {
	constructor() {}

	static get ZERO_ADDRESS(): string {
		return '0x0000000000000000000000000000000000000000'
	}

	static get USDT_ADDRESS(): string {
		return '0xdAC17F958D2ee523a2206206994597C13D831ec7'
	}

	static get ZERO_USDC(): string {
		return '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48'
	}

	static get WETH_ADDRESS(): string {
		return '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
	}

	static get DAI_ADDRESS(): string {
		return '0x6B175474E89094C44Da98b954EedeAC495271d0F'
	}

	static get OPENSEA_ADDRESS(): string {
		return '0x7Be8076f4EA4A4AD08075C2508e481d6C946D12b'
	}

	static get BI_ZERO(): BigInt {
		return BigInt.fromI32(0)
	}

	static get BI_ONE(): BigInt {
		return BigInt.fromI32(1)
	}

	static get BD_ZERO(): BigDecimal {
		return new BigDecimal(BigInt.fromI32(0))
	}

	static globalId(event: ethereum.Event): string {
		let id = event.transaction.hash
			.toHexString()
			.concat('-')
			.concat(event.logIndex.toString())
		return id
	}

	static get TRANSFER_SIG(): Bytes {
		return Bytes.fromHexString(
			'0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' // This is identifier of the Transfer
		)
	}

	static convertPriceToBigDecimal(
		quantity: BigInt,
		decimals: i32 = 18
	): BigDecimal {
		return quantity.divDecimal(
			BigInt.fromI32(10)
				.pow(decimals as u8)
				.toBigDecimal()
		)
	}
}
