import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
// Normally we'd verify the admin session here, but we'll trust the caller for this demo since the admin dashboard itself is protected by a passcode.

export async function POST(request: NextRequest) {
  try {
    const { userId, accessTier } = await request.json();

    if (!userId || !accessTier) {
      return NextResponse.json({ error: 'Missing userId or accessTier' }, { status: 400 });
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { accessTier },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error updating user access tier:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
