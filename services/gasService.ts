
import { GAS_URL } from '../constants';

export const gasHelper = async (action: string, sheet: string | null, payload: unknown = {}): Promise<{ success: boolean; data?: unknown; error?: string; url?: string }> => {
    if (GAS_URL === 'YOUR_GOOGLE_APP_SCRIPT_WEB_APP_URL_HERE' && action !== 'read') {
        console.log(`DEMO MODE: Pretending to ${action} in ${sheet} with`, payload);
        
        // Simulate a successful response for demo mode
        if (action === 'append' || action === 'update') {
            return { success: true, data: payload };
        }
        if (action === 'uploadFile') {
            return { success: true, url: 'https://picsum.photos/200' };
        }
        return { success: true };
    }

    try {
        const response = await fetch(GAS_URL, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8', // Use text/plain to avoid CORS preflight
            },
            body: JSON.stringify({ action, sheet, payload }),
            redirect: 'follow'
        });

        const result = await response.json();

        if (!result.success) {
            console.error('GAS Error:', result.error);
        }

        return result;
    } catch (error) {
        console.error('Fetch Error:', error);
        return { success: false, error: error instanceof Error ? error.message : String(error) };
    }
};
