// Modified ProfileForm.jsx
import { memo } from "react";

const ProfileForm = memo(({
  editableData,
  handleChange,
  handleSubmit,
  loading,
  toggleEditMode,
  statesList,
  submitButtonText = "Save Changes", // Custom button text
  cancelButtonText = "Cancel",       // Custom cancel text
  showCancelButton = true,           // Control cancel button visibility
  additionalFields = null,           // Slot for additional fields
  fieldsToShow = {                   // Control which fields to show
    name: true,
    phone: true,
    address: true
  }
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fieldsToShow.name && (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={editableData.name}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>
      )}
      
      {fieldsToShow.phone && (
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={editableData.phone}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      )}
      
      {fieldsToShow.address && (
        <>
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              Street Address
            </label>
            <input
              type="text"
              id="street"
              name="street"
              value={editableData.street}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={editableData.city}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <select
                id="state"
                name="state"
                value={editableData.state}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select State</option>
                {statesList.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
          </div>
        </>
      )}
      
      {/* Slot for additional fields */}
      {additionalFields}
      
      <div className="flex justify-end space-x-3 pt-4">
        {showCancelButton && (
          <button
            type="button"
            onClick={toggleEditMode}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            {cancelButtonText}
          </button>
        )}
        
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          disabled={loading}
        >
          {loading ? "Processing..." : submitButtonText}
        </button>
      </div>
    </form>
  );
});

ProfileForm.displayName = 'ProfileForm';

export default ProfileForm;
