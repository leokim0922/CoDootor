import { NextResponse } from 'next/server';
import { getAccessToken, withApiAuthRequired } from '@auth0/nextjs-auth0';

const GET = withApiAuthRequired(async function GET(req) {
  const res = new NextResponse();
  const { accessToken } = await getAccessToken(req, res, {
    audience: process.env.AUTH0_AUDIENCE,
    scope: 'openid email profile'
  });
  return NextResponse.json({ token: accessToken }, res);
});

export { GET };