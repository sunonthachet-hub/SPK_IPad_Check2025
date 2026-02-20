
export const formatDate = (dateString?: string | null): string => {
    if (!dateString) {
        return 'N/A';
    }
    try {
        const date = new Date(dateString);
        // Use 'th-TH-u-ca-buddhist' locale to get the Buddhist Era year.
        return date.toLocaleDateString('th-TH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Bangkok' // Optional: ensure timezone consistency
        });
    } catch (error) {
        console.error("Invalid date string:", dateString, error);
        return 'Invalid Date';
    }
};
