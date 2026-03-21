import React, { useContext, useEffect, useState } from 'react'
import { DoctorContext } from '../../context/DoctorContext'
import { AppContext } from '../../context/AppContext'
import axios from 'axios'
import { toast } from 'react-toastify'

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } = useContext(DoctorContext)
  const { currency } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)

  const handleInputChange = (field, value) => {
    setProfileData((prev) => ({ ...prev, [field]: value }))
  }

  const handleAddressChange = (field, value) => {
    setProfileData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }))
  }

  const updateProfile = async () => {
    try {
      const updateData = {
        fees: profileData.fees,
        available: profileData.available,
        address: {
          line1: profileData.address.line1,
          line2: profileData.address.line2
        }
      }

      const { data } = await axios.post(
        `${backendUrl}/api/doctor/update-profile`,
        updateData,
        { headers: { dToken } }
      )

      if (data.success) {
        toast.success(data.message)
        setIsEdit(false)
        getProfileData()
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.error(error)
      toast.error("Update failed. Try again.")
    }
  }

  useEffect(() => {
    if (dToken) {
      getProfileData()
    }
  }, [dToken])

  return profileData && (
    <div className='flex flex-col gap-4 m-5'>
      <div>
        <img className='bg-primary/80 w-full sm:max-w-64 rounded-lg' src={profileData.image} alt="doctor" />
      </div>

      <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
        <p className='text-3xl font-medium text-gray-700'>{profileData.name}</p>
        <div className='flex items-center gap-2 mt-1 text-gray-600'>
          <p>{profileData.degree} - {profileData.speciality}</p>
          <button className='py-0.5 px-2 border text-xs rounded-full'>{profileData.experience}</button>
        </div>

        <div className='mt-3'>
          <p className='text-sm font-medium text-neutral-800'>About:</p>
          <p className='text-sm text-gray-600 mt-1'>{profileData.about}</p>
        </div>

        <div className='mt-4'>
          <label className='font-medium text-gray-600'>Appointment Fee:</label>
          {isEdit ? (
            <input
              type="number"
              className='border p-1 rounded ml-2 w-24'
              value={profileData.fees}
              onChange={(e) => handleInputChange("fees", e.target.value)}
            />
          ) : (
            <span className='text-gray-800 ml-2'>{currency} {profileData.fees}</span>
          )}
        </div>

        <div className='flex flex-col gap-2 mt-3'>
          <label className='font-medium text-gray-600'>Address:</label>
          {isEdit ? (
            <>
              <input
                type="text"
                className='border p-1 rounded'
                placeholder="Line 1"
                value={profileData.address?.line1 || ""}
                onChange={(e) => handleAddressChange("line1", e.target.value)}
              />
              <input
                type="text"
                className='border p-1 rounded'
                placeholder="Line 2"
                value={profileData.address?.line2 || ""}
                onChange={(e) => handleAddressChange("line2", e.target.value)}
              />
            </>
          ) : (
            <p className='text-sm text-gray-700'>
              {profileData.address?.line1}<br />
              {profileData.address?.line2}
            </p>
          )}
        </div>

        <div className='flex items-center gap-2 mt-4'>
          <input
            type="checkbox"
            checked={profileData.available}
            onChange={() => isEdit && handleInputChange("available", !profileData.available)}
          />
          <label>Available</label>
        </div>

        {isEdit ? (
          <button
            onClick={updateProfile}
            className='mt-5 px-4 py-1 border border-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all'
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className='mt-5 px-4 py-1 border border-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all'
          >
            Edit
          </button>
        )}
      </div>
    </div>
  )
}

export default DoctorProfile
