import React, { ReactNode } from "react";

interface AddModalProps {
    isOpen: boolean;
    text: string;
    onClose: () => void;
    children: ReactNode;
}

const AddModal: React.FC<AddModalProps> = ({
    isOpen,
    text,
    onClose,
    children,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-b from-black/20 to-black/50 z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-md mx-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-black">{text}</h2>
                    <button
                        onClick={onClose}
                        className="text-black bg-transparent border-none text-2xl font-bold focus:ring-2 focus:ring-blue"
                    >
                        &times;
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default AddModal;
