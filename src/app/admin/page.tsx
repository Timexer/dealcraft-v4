import { db } from '@/lib/db';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trainer Dashboard - DealCraft',
  description: 'Admin portal for trainers',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Fetch all players with their case results
  const players = await db.player.findMany({
    include: {
      caseResults: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });

  return <AdminDashboard initialPlayers={players} />;
}
