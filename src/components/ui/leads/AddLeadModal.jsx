import React from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";

/**
 * AddLeadModal Component
 * Modal for adding new leads
 */
export default function AddLeadModal({ visible, onHide, onSubmit, formData, setFormData }) {
  const handleSubmit = () => {
    if (!formData.company || !formData.name) {
      alert("Please fill in required fields");
      return;
    }
    onSubmit(formData);
  };

  return (
    <Dialog 
      header="Add New Lead" 
      visible={visible} 
      style={{ width: '400px' }} 
      onHide={onHide}
      className="font-inter"
    >
      <div className="flex flex-col gap-4 pt-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
          <InputText 
            value={formData.company} 
            onChange={(e) => setFormData({...formData, company: e.target.value})} 
            className="w-full p-2 border rounded-lg"
            placeholder="e.g. Brew Corner"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name *</label>
          <InputText 
            value={formData.name} 
            onChange={(e) => setFormData({...formData, name: e.target.value})} 
            className="w-full p-2 border rounded-lg"
            placeholder="e.g. John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <InputText 
            value={formData.role} 
            onChange={(e) => setFormData({...formData, role: e.target.value})} 
            className="w-full p-2 border rounded-lg"
            placeholder="e.g. Owner"
          />
        </div>
        <div className="flex justify-end gap-2 mt-2">
          <button 
            onClick={onHide}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 bg-theme text-white rounded-lg hover:bg-themeDark"
          >
            Add Lead
          </button>
        </div>
      </div>
    </Dialog>
  );
}
