  import { connectDB } from "@/lib/mongodb";
  import { getCurrentUser } from "@/lib/auth";
  import Wallet from "@/models/Wallet";

  export async function GET(request) {
    await connectDB();

    const user = await getCurrentUser(request);

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      let wallet = await Wallet.findOne({ user: user._id }).lean();

      if (!wallet) {
        const empty = {};
        ["USDT", "BTC", "ETH", "TRX", "BNB", "SOL", "ADA"].forEach(c => empty[c] = 0);

        wallet = await Wallet.create({
          user: user._id,
          assets: empty,
          funding: empty,
        });
        wallet = wallet.toObject();
      }

      const cleanAssets = Object.fromEntries(
        Object.entries(wallet.assets || {}).filter(([k]) => !k.startsWith('$') && !k.startsWith('__'))
      );

      const symbols = Object.keys(cleanAssets);
      const coinMap = { BTC: "bitcoin", ETH: "ethereum", USDT: "tether", TRX: "tron", BNB: "binancecoin", SOL: "solana", ADA: "cardano" };
      const ids = symbols.map(s => coinMap[s]).filter(Boolean).join(",");

      let prices = {};
      if (ids) {
        const res = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`);
        if (res.ok) prices = await res.json();
      }

      const result = symbols.map(symbol => {
        const balance = Number(cleanAssets[symbol] || 0);
        const p = prices[coinMap[symbol]] || { usd: symbol === "USDT" ? 1 : 0, usd_24h_change: 0 };

        return {
          symbol,
          balance,
          value: Number((balance * p.usd).toFixed(2)),
          change: Number((p.usd_24h_change || 0).toFixed(2)),
        };
      }).sort((a, b) => b.value - a.value);

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });

    } catch (err) {
      console.error("Assets fetch error:", err);
      return new Response(JSON.stringify([]), { status: 500 });
    }
  }