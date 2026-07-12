import User from '../models/User.js';

export const createUser = async (req, res) => {
  try {
    const { name, email, role, rollNumber, companyName } = req.body;

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already in use' });

    const defaultPassword = rollNumber || email.split('@')[0];

    const userData = {
      name,
      email,
      password: defaultPassword,
      role,
      rollNumber: rollNumber || '',
      status: 'approved',
      mustChangePassword: true,
    };

    if (role === 'company' && companyName) {
      userData.profile = { companyName };
    }

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      rollNumber: user.rollNumber,
      defaultPassword,
      message: `Account created. Share these credentials: Email: ${email}, Password: ${defaultPassword}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import { Readable } from 'stream';
import csvParser from 'csv-parser';

export const bulkCreateUsers = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No CSV file uploaded' });

  const results = [];
  const errors = [];
  let rowCount = 0;

  const stream = Readable.from(req.file.buffer.toString());

  stream
    .pipe(csvParser())
    .on('data', (data) => {
      rowCount++;
      results.push(data);
    })
    .on('end', async () => {
      const createdUsers = [];

      for (const [index, row] of results.entries()) {
        try {
          const name = row.Name || row.name;
          const email = row.Email || row.email;
          const role = (row.Role || row.role || 'student').toLowerCase();
          const rollNumber = row.RollNumber || row.rollNumber || row.roll || '';
          const companyName = row.CompanyName || row.companyName || '';

          if (!name || !email) {
            errors.push(`Row ${index + 2}: Missing name or email`);
            continue;
          }

          const exists = await User.findOne({ email });
          if (exists) {
            errors.push(`Row ${index + 2}: Email ${email} already exists`);
            continue;
          }

          const defaultPassword = rollNumber || email.split('@')[0];
          
          const userData = {
            name,
            email,
            password: defaultPassword,
            role,
            rollNumber,
            status: 'approved',
            mustChangePassword: true,
          };

          if (role === 'company' && companyName) {
            userData.profile = { companyName };
          }

          const user = await User.create(userData);
          createdUsers.push({ email: user.email, defaultPassword });
        } catch (err) {
          errors.push(`Row ${index + 2}: ${err.message}`);
        }
      }

      res.json({
        message: `Successfully created ${createdUsers.length} accounts.`,
        created: createdUsers,
        errors,
        totalProcessed: rowCount,
      });
    });
};

export const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'pending', role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: 'admin' } }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot reset another admin password' });

    const defaultPassword = user.rollNumber || user.email.split('@')[0];
    user.password = defaultPassword;
    user.mustChangePassword = true;
    user.resetRequested = false;
    await user.save();

    res.json({ message: 'Password reset successfully', defaultPassword });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admin' });
    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
