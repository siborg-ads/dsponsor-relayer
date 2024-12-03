import { NextResponse } from "next/server";

export async function GET() {
  const url = `https://imagedelivery.net/TlQ5vhoyTS5z9qx4oGD5gA/cryptoast-parcelle-8453-37/public?v=${Date.now()}`;
  return NextResponse.redirect(url, 302);
}
