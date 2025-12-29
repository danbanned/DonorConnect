export async function GET() {
  return Response.json({ message: 'Hello' });
}

export async function POST() {
  return Response.json({ message: 'Hello POST' });
}