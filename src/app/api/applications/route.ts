import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const applications = await db.application.findMany({
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(applications);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const application = await db.application.create({
      data: {
        userId: body.userId,
        serviceId: body.serviceId,
        serviceName: body.serviceName,
        status: body.status || 'pending',
        amount: body.amount,
        paymentStatus: body.paymentStatus || 'unpaid',
        paymentMethod: body.paymentMethod,
        formData: JSON.stringify(body.formData),
      },
    });
    return NextResponse.json(application, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
