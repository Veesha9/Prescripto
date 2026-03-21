import doctorModel from '../models/doctorModel.js';
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import appointmentModel from '../models/appointmentModel.js';
const changeAvailablility = async(req,res)=>{
    try {
        const {docId} = req.body

        const docData = await doctorModel.findById(docId)
        await doctorModel.findByIdAndUpdate(docId,{available: !docData.available})
        res.json({success:true, message:'Availability Changed'})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

const doctorList = async(req,res)=>{
    try {
        const doctors = await doctorModel.find({}).select(['-password','-email'])
        res.json({success:true,doctors})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}


// API for doctor login
const loginDoctor= async(req,res)=>{
    try {
        const {email,password} = req.body
        const doctor = await doctorModel.findOne({email})

        if(!doctor){
          return res.json({success:false, message:'Invalid credentials'})
        }

        const isMatch = await bcrypt.compare(password, doctor.password)

        if(isMatch){
          const token = jwt.sign({id:doctor._id},process.env.JWT_SECRET)
          res.json({success:true,token,doctor})
        }else{
            res.json({success:false, message:'Invalid credentials'})
        }
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

// API to get doctor appointments for doctor panel
const appointmentsDoctor = async(req,res)=>{
    try {
       const docId = req.docId; // ✅ get from token middleware
       const appointments = await appointmentModel.find({docId});
       res.json({success:true,appointments});
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message}); 
    }
}


// API to mark appointment completed for doctor panel
const appointmentComplete = async (req, res) => {
  try {
    const docId = req.docId; // From authDoctor middleware
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Optional debug logs
    console.log("Appointment docId:", appointmentData.docId.toString());
    console.log("Current docId:", docId.toString());

    if (appointmentData.docId.toString() === docId.toString()) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
      return res.json({ success: true, message: "Appointment marked as completed" });
    } else {
      return res.json({ success: false, message: "Doctor not authorized for this appointment" });
    }
  } catch (error) {
    console.error("Error in appointmentComplete:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};



// API to cancel appointment cancelled for doctor panel
const appointmentCancel = async (req, res) => {
  try {
    const docId = req.docId;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.json({ success: false, message: "Appointment not found" });
    }

    // Optional debug logs
    console.log("Appointment docId:", appointmentData.docId.toString());
    console.log("Current docId:", docId.toString());

    if (appointmentData.docId.toString() === docId.toString()) {
      await appointmentModel.findByIdAndUpdate(appointmentId, { isCancelled: true });
      return res.json({ success: true, message: "Appointment cancelled" });
    } else {
      return res.json({ success: false, message: "Doctor not authorized for this appointment" });
    }
  } catch (error) {
    console.error("Error in appointmentCancel:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


// API to get dashboard data for doctor panel
const doctorDashboard = async(req,res)=>{
    try {
const docId = req.docId;  // ✅ correct: this comes from authDoctor middleware
      const appointments = await appointmentModel.find({docId})
      let earnings = 0
      appointments.map((item)=>{
       if(item.isCompleted || item.payment){
         earnings +=item.amount
       }
      })
      let patients = []
      appointments.map((item)=>{
        if(!patients.includes(item.userId)){
             patients.push(item.userId)
        }
      })

      const dashData = {
        earnings,
        appointments: appointments.length,
        patients: patients.length,
        latestAppointments: appointments.reverse().slice(0,5)
      }
      res.json({success:true, dashData})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

// API to get doctor profile for doctor panel
const doctorProfile = async(req,res)=>{
    try {
       const docId = req.docId 
       const profileData = await doctorModel.findById(docId).select('-password')
       res.json({success:true, profileData})
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

// API to update doctor profile data from Doctor Panel
const updateDoctorProfile = async(req,res)=>{
  try {
    const docId = req.docId; // ✅ Get from token, not body
    const { fees, address, available } = req.body;

    await doctorModel.findByIdAndUpdate(docId, {
      ...(fees !== undefined && { fees }),
      ...(address !== undefined && { address }),
      ...(available !== undefined && { available }),
    });

    res.json({ success: true, message: 'Profile Updated' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
}

export {changeAvailablility,doctorList,loginDoctor,appointmentsDoctor,appointmentCancel,appointmentComplete, doctorDashboard,doctorProfile,updateDoctorProfile}