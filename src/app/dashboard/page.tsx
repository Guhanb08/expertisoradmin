import { redirect } from 'next/navigation';

export default function Dashboard() {
  // Redirect to overview page
  redirect('/dashboard/overview');
}
