
import React from 'react';

const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();
    return (
        <footer className="w-full text-center p-4 text-gray-500 text-xs">
            <p>&copy; {currentYear} Developed by ศูนย์ ไอซีที โรงเรียนสารคามพิทยาคม</p>
        </footer>
    );
};

export default Footer;
