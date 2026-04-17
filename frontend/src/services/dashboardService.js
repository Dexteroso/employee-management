export async function getDashboardSummary() {
  const response = await fetch('http://localhost:3000/api/dashboard/summary');

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard summary');
  }

  return response.json();
}