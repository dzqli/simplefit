// File: /app/api/proxy/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import jwt from 'jsonwebtoken';

export async function GET(req: NextRequest) {
    const token = await getToken({ req });
    if (!token) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const targetUrl = `${process.env.API_URL}`;

    const signedJwt = jwt.sign(token, process.env.AUTH_SECRET || '', {
        algorithm: "HS256"
    });

    const upstreamRes = await fetch(targetUrl, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${signedJwt}`,
        },
    });

    return new NextResponse(await upstreamRes.text(), {
        status: upstreamRes.status,
    });
}
