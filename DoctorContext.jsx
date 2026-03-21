import { useState } from "react";
import { createContext } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'

export const DoctorContext = createContext()

const DoctorContextProvider = (props) =>{

    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [dToken,setDToken] = useState(localStorage.getItem('dToken')?localStorage.getItem('dToken'):'')
    const [appointments,setAppointments] = useState([])
    const [dashData, setDashData] = useState(false)
    const [profileData, setProfileData] = useState(false)

    const getAppointments = async () => {
  try {
    const doctorId = localStorage.getItem('doctorId'); // ✅ fetch saved doctor ID

    const res = await axios.post(
      backendUrl + '/api/doctor/appointments',
      { docId: doctorId }, // ✅ pass docId in body
      {
        headers: {
          dToken
        }
      }
    );

    if (res.data.success) {
      setAppointments(res.data.appointments.reverse());
      console.log(res.data.appointments);
    } else {
      toast.error(res.data.message);
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message);
  }
};

    const completeAppointment = async (appointmentId) => {
  try {
    const docId = localStorage.getItem('doctorId'); // ✅ get docId from localStorage
    const { data } = await axios.post(
      backendUrl + '/api/doctor/complete-appointment',
      { appointmentId, docId }, // ✅ send docId
      { headers: { dToken } }
    );

    if (data.success) {
      toast.success(data.message);
      getAppointments();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message);
  }
};


    const cancelAppointment = async (appointmentId) => {
  try {
    const docId = localStorage.getItem('doctorId'); // ✅ get docId from localStorage
    const { data } = await axios.post(
      backendUrl + '/api/doctor/cancel-appointment',
      { appointmentId, docId }, // ✅ send docId
      { headers: { dToken } }
    );

    if (data.success) {
      toast.success(data.message);
      getAppointments();
    } else {
      toast.error(data.message);
    }
  } catch (error) {
    console.log(error);
    toast.error(error.message);
  }
};


    const getDashData = async()=>{
      try {
        const {data} = await axios.get(backendUrl+'/api/doctor/dashboard',{headers:{dToken}})
        if(data.success){
          setDashData(data.dashData)
          console.log(data.dashData)
        }else{
          toast.error(data.message)
        }
      } catch (error) {
         console.log(error);
    toast.error(error.message);
      }
    }

    const getProfileData = async()=>{
      try {
        const {data} = await axios.get(backendUrl+'/api/doctor/profile',{headers:{dToken}})
        if(data.success){
          setProfileData(data.profileData)
          console.log(data.profileData)
        }
      } catch (error) {
        console.log(error);
    toast.error(error.message);
      }
    }
    const value={
      dToken,setDToken,
      backendUrl,appointments,setAppointments,
      getAppointments,completeAppointment,cancelAppointment,
      dashData,setDashData,getDashData,profileData,setProfileData,
      getProfileData,
    }
    return(
        <DoctorContext.Provider value={value}>
            {props.children}
            </DoctorContext.Provider>
    )
}

export default DoctorContextProvider