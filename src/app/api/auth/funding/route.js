import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import Wallet from '@/models/Wallet';
import { connectDB } from '@/lib/mongodb';

const VALID_NETWORKS = {
  USDT: ['TRC20', 'ERC20'],
  BTC: ['BTC', 'BECH32'],
  ETH: ['ERC20'],
  BNB: ['BEP20'],
  SOL: ['SOL'],
  TRX: ['TRC20'],
  ADA: ['ADA'],
};

export async function GET(request) {
  await connectDB();

  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    let wallet = await Wallet.findOne({ user: user._id }).lean();

    if (!wallet) {
      const empty = {};
      Object.keys(VALID_NETWORKS).forEach(c => (empty[c] = 0));

      wallet = await Wallet.create({
        user: user._id,
        assets: empty,
        funding: empty,
      });
      wallet = wallet.toObject();
    }

    const funding = wallet.funding instanceof Map ? Object.fromEntries(wallet.funding) : wallet.funding;

    return NextResponse.json({ funding });
  } catch (err) {
    console.error('Funding fetch error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  await connectDB();

  const user = await getCurrentUser(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { coin, amount, address, network } = await request.json();

    if (!coin || !amount || !address || !network) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!VALID_NETWORKS[coin]) {
      return NextResponse.json({ error: 'Invalid coin' }, { status: 400 });
    }

    if (!VALID_NETWORKS[coin].includes(network)) {
      return NextResponse.json(
        { error: `Invalid network for ${coin}. Supported: ${VALID_NETWORKS[coin].join(', ')}` },
        { status: 400 }
      );
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const wallet = await Wallet.findOne({ user: user._id });
    if (!wallet) {
      return NextResponse.json({ error: 'Wallet not found' }, { status: 404 });
    }

    const currentBalance = wallet.funding.get(coin) ?? 0;
    if (currentBalance < numAmount) {
      return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
    }

    wallet.funding.set(coin, currentBalance - numAmount);
    await wallet.save();

    return NextResponse.json({
      success: true,
      message: `Withdrawal of ${numAmount} ${coin} submitted successfully!`,
      coin,
      amount: numAmount,
      address,
      network,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
