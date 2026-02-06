
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function getUserIdFromRequest() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);
        return payload.userId as string;
    } catch (error) {
        return null;
    }
}

export async function getUserFromToken() {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return null;

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');
        const { payload } = await jwtVerify(token, secret);
        return {
            userId: payload.userId as string,
            username: payload.username as string,
            isAdmin: payload.isAdmin as boolean,
        };
    } catch (error) {
        return null;
    }
}
