import { NextResponse } from 'next/server';

export function middleware(req) {
  const res = NextResponse.next();
  res.headers.set('x-penko-node', process.env.HOSTNAME || 'local');
  return res;
}

export const config = {
  matcher: ['/r/:path*', '/api/:path*']
};