import { connectDB } from "@/lib/mongodb";
import { getCurrentUser } from "@/lib/auth"; 
import DepositAddress from "@/models/DepositAddress";

export async function GET(request) {
  await connectDB();

  // This now reads from httpOnly cookie (no Authorization header!)
  const user = await getCurrentUser(request);
  if (!user) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    const addresses = await DepositAddress.find({
      user: user._id,
      isActive: true,
      balance: { $gt: 0 },
    })
      .select("coin network address balance")
      .lean();

    if (addresses.length === 0) {
      return new Response(JSON.stringify([]), { 
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    const priceRes = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,tron,tether&vs_currencies=usd&include_24hr_change=true",
      { next: { revalidate: 60 } }
    );
    const prices = await priceRes.json();

    const assets = addresses.map((addr) => {
      const isUSDT = addr.coin === "USDT";
      const priceData = isUSDT
        ? prices.tether || { usd: 1, usd_24h_change: 0 }
        : prices[addr.coin.toLowerCase()] || { usd: 0, usd_24h_change: 0 };

      const balance = Number(addr.balance);
      const value = balance * priceData.usd;

      return {
        name: isUSDT
          ? "Tether"
          : addr.coin === "BTC"
          ? "Bitcoin"
          : addr.coin === "ETH"
          ? "Ethereum"
          : "TRON",
        symbol: isUSDT ? "USDT" : addr.coin,
        network: addr.network,
        balance: Number(balance.toFixed(8)),
        value: Number(value.toFixed(2)),
        price: Number(priceData.usd.toFixed(6)),
        change: Number((priceData.usd_24h_change || 0).toFixed(2)),
        address: addr.address,
        icon: `/icons/${addr.coin.toLowerCase()}.png`,
      };
    });

    assets.sort((a, b) => b.value - a.value);

    return new Response(JSON.stringify(assets), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=60, stale-while-revalidate=30",
      },
    });

  } catch (error) {
    console.error("Assets API error:", error);
    return new Response(
      JSON.stringify({ error: "Server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}