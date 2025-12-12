// wallet-token-balances.mjs
// Demo for Moralis "Get Native & ERC20 Token Balances by Wallet" endpoint.
// Node.js v18+ (native fetch)

import 'dotenv/config';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

if (!MORALIS_API_KEY) {
  throw new Error(
    'Missing MORALIS_API_KEY. Please set it in a .env file or your environment.',
  );
}

// Demo wallet address
const address = '0xcB1C1FdE09f811B294172696404e88E658659905';
const chain = 'eth';

async function main() {
  // Build URL with query params
  const url = new URL(
    `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens`,
  );

  url.searchParams.set('chain', chain);
  url.searchParams.set('limit', '25');

  // Cleaning portfolio for exclude spam tokens and unverified contracts (switch to false to unfilter)
  url.searchParams.set('exclude_spam', 'true');
  url.searchParams.set('exclude_unverified_contracts', 'true');

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'X-API-Key': MORALIS_API_KEY,
    },
  };

  const res = await fetch(url, options);

  if (!res.ok) {
    console.error('Error from Moralis:', res.status, res.statusText);
    const text = await res.text();
    console.error(text);
    return;
  }

  const data = await res.json();

  const tokens = data.result ?? [];

  const totalUsd = tokens.reduce(
    (sum, token) => sum + Number(token.usd_value || 0),
    0,
  );

  console.log('==========================');
  console.log(`Wallet: ${address}`);
  console.log(`Chain:  ${chain}`);
  console.log(`Block:  ${data.block_number}`);
  console.log(`Tokens found: ${tokens.length}`);
  console.log(`Estimated portfolio value: $${totalUsd.toFixed(2)}`);
  console.log('==========================\n');

  // Top 5 tokens por valor en USD
  tokens
    .sort((a, b) => Number(b.usd_value || 0) - Number(a.usd_value || 0))
    .slice(0, 5)
    .forEach((token, index) => {
      const symbol = token.symbol || 'UNKNOWN';
      const balance = token.balance_formatted || token.balance;
      const usdValue = Number(token.usd_value || 0);
      const pct = Number(token.portfolio_percentage || 0);

      console.log(
        `${index + 1}. ${symbol} — ${balance} ` +
          `(≈ $${usdValue.toFixed(2)} | ${pct.toFixed(2)}%)`,
      );
    });
}

main().catch(console.error);
