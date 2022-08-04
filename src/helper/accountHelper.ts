import { Address } from '@graphprotocol/graph-ts'
import { Account } from '../../generated/schema'
import { BI_ZERO } from '../constant'

export function getOrCreateAccount(address: Address): Account {
	let id = address.toHexString()
	let account = Account.load(id)
	if (!account) {
		account = new Account(id)
		account.numberOfSales = BI_ZERO
		account.numberOfPurchases = BI_ZERO

		account.totalSpent = BI_ZERO
		account.totalEarned = BI_ZERO

		//account.nftOwnedAndCollection = new Array<string>()

		account.save()
	}

	return account as Account
}

// /**
//  * @description This function:
//  *   - update the sales of the seller
//  *   - update the total earned by seller
//  *   - update the purchases of buyer
//  *   - update the spending of the buyer
//  *   - calculate average amount spent
//  * @param fromAccount This is the seller account
//  * @param toAccount This is the buyer account
//  * @param price This is the price of the punk
//  * @returns `void`
//  */

// export function updateAccountAggregates(
//   fromAccount: Account,
//   toAccount: Account,
//   price: BigInt
// ): void {
//   //Update fromAccount aggregates
//   fromAccount.numberOfSales = fromAccount.numberOfSales.plus(BIGINT_ONE);
//   fromAccount.totalEarned = fromAccount.totalEarned.plus(price);

//   //Update toAccount aggregates
//   toAccount.totalSpent = toAccount.totalSpent.plus(price);
//   toAccount.numberOfPurchases = toAccount.numberOfPurchases.plus(BIGINT_ONE);

//   //We only calculate average amount spent if there are more than 0 purchases so we don't divide by 0
//   if (toAccount.numberOfPurchases != BIGINT_ZERO) {
//     toAccount.averageAmountSpent = calculateAverage(
//       toAccount.totalSpent,
//       toAccount.numberOfPurchases
//     );
//   }
// }

// export function updateAccountHoldings(
//   toAccount: Account,
//   fromAccount: Account
// ): void {
//   //Update toAccount holdings
//   toAccount.numberOfPunksOwned = toAccount.numberOfPunksOwned.plus(BIGINT_ONE);

//   //Update fromAccount holdings
//   fromAccount.numberOfPunksOwned = fromAccount.numberOfPunksOwned.minus(
//     BIGINT_ONE
//   );
// }
