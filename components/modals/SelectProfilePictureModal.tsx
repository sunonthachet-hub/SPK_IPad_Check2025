
import React from 'react';
import { PREDEFINED_STUDENT_PICTURES } from '../../constants';

interface SelectProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (imageUrl: string) => void;
  t: (key: string) => string;
}

const SelectProfilePictureModal: React.FC<SelectProfilePictureModalProps> = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800">
          <span className="material-icons-outlined">close</span>
        </button>
        <h2 className="text-xl font-bold mb-4">Select Your Avatar</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {PREDEFINED_STUDENT_PICTURES.map((url, index) => (
            <button
              key={index}
              onClick={() => onSelect(`https://raw.githubusercontent.com/manopjk/ipadcheck-spk/main/public${url}`)}
              className="rounded-full overflow-hidden border-2 border-transparent hover:border-spk-yellow hover:scale-110 transition-transform"
            >
              <img src={`https://raw.githubusercontent.com/manopjk/ipadcheck-spk/main/public${url}`} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SelectProfilePictureModal;
