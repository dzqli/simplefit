import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import jwt from 'jsonwebtoken';


export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const token = await getToken({ req });
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const targetUrl = `${process.env.API_URL}/exercises/${id}`;

    const signedJwt = jwt.sign(token, process.env.AUTH_SECRET || '', {
        algorithm: "HS256"
    });

    const upstreamRes = await fetch(targetUrl, {
        method: "PUT",
        headers: {
            "Authorization": `Bearer ${signedJwt}`,
        },
        body: req.body,
        duplex: 'half',
    });

    return new NextResponse(await upstreamRes.text(), {
        status: upstreamRes.status,
    });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const token = await getToken({ req });
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUrl = `${process.env.API_URL}/exercises/${params.id}`;

    const signedJwt = jwt.sign(token, process.env.AUTH_SECRET || '', {
        algorithm: "HS256"
    });

    const upstreamRes = await fetch(targetUrl, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${signedJwt}`,
        },
    });

    return new NextResponse(await upstreamRes.text(), {
        status: upstreamRes.status,
    });
}
