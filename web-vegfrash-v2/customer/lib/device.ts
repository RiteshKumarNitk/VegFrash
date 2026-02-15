import { headers } from 'next/headers';
import { UAParser } from 'ua-parser-js';

export async function getDeviceType() {
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || '';

    const parser = new UAParser(userAgent);
    const device = parser.getDevice();

    // Simple logic: if type is mobile or tablet -> 'mobile'
    // else -> 'desktop'

    if (device.type === 'mobile' || device.type === 'tablet') {
        return 'mobile';
    }

    return 'desktop';
}
