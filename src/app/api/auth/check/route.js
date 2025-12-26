import { NextResponse } from 'next/server';

export async function GET(request) {
  const cookie = request.cookies.get('access_token');

  if (!cookie) {
    return NextResponse.json(
      { loggedIn: false },
      { status: 401 }
    );
  }

  return NextResponse.json({ loggedIn: true });
}
