import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Admins must use the dedicated admin portal to log in.' });
    }
    if (user.status === 'pending') {
      return res.status(403).json({ message: 'Your account is pending admin approval. Please wait.', status: 'pending' });
    }
    if (user.status === 'rejected') {
      return res.status(403).json({ message: 'Your account has been rejected. Contact the admin.', status: 'rejected' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      mustChangePassword: user.mustChangePassword,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. This portal is for administrators only.' });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }
    const user = await User.findById(req.user._id);
    user.password = newPassword;
    user.mustChangePassword = false;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    // We don't want to leak if the email exists to bad actors, 
    // so we always return a success message either way.
    if (user) {
      user.resetRequested = true;
      await user.save();
    }
    
    res.json({ message: 'If that email exists in our system, the administrator has been notified to reset your password. Please contact the Placement Cell or wait for their update.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMe = async (req, res) => {
  res.json(req.user);
};
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Text fields
    const { phone, branch, passingYear, cgpa, skills } = req.body;
    
    if (!user.profile) user.profile = {};
    if (phone) user.profile.phone = phone;
    if (branch) user.profile.branch = branch;
    if (passingYear) user.profile.passingYear = Number(passingYear);
    if (cgpa) user.profile.cgpa = Number(cgpa);
    
    if (skills) {
      user.profile.skills = Array.isArray(skills) 
        ? skills 
        : skills.split(',').map(s => s.trim()).filter(Boolean);
    }

    // Files
    if (req.files) {
      if (req.files.resume) {
        user.profile.resume = `/uploads/${req.files.resume[0].filename}`;
      }
      if (req.files.photo) {
        user.profile.photo = `/uploads/${req.files.photo[0].filename}`;
      }
      if (req.files.aadharProof) {
        user.profile.aadharProof = `/uploads/${req.files.aadharProof[0].filename}`;
      }
    }

    await user.save();
    
    // Return updated user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
