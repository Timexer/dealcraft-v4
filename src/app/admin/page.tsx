import { db } from '@/lib/db';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trainer Dashboard - DealCraft',
  description: 'Admin portal for trainers',
};

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  // Fetch all users with their case results
  const users = await db.user.findMany({
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

  // Map to the format AdminDashboard expects
  const mappedUsers = users.map(user => ({
    ...user,
    name: user.name || 'Anonymous User',
    email: user.email || 'No Email Provided',
  }));

  return <AdminDashboard initialPlayers={mappedUsers} />;
}
