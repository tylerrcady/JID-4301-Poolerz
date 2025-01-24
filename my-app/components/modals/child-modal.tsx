import React from "react";

const ChildModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white w-1/3 p-6 rounded shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-black">Add Child</h3>
          <button
            onClick={onClose}
            className="text-black bg-transparent border-none text-2xl font-bold"
          >
            &times;
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default ChildModal;