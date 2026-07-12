import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

export const applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job || !job.isActive) return res.status(404).json({ message: 'Job not available' });
    const already = await Application.findOne({ job: job._id, student: req.user._id });
    if (already) return res.status(400).json({ message: 'Already applied' });
    const user = await User.findById(req.user._id);
    const p = user.profile || {};
    if (!p.resume || !p.photo || !p.aadharProof || !p.phone || !p.branch || !p.passingYear || !p.cgpa) {
      return res.status(400).json({ message: 'Profile is incomplete. Please complete your profile and upload all required documents before applying.' });
    }
    const application = await Application.create({
      job: job._id,
      student: req.user._id,
      coverLetter: req.body.coverLetter,
      resumeSnapshot: p.resume,
    });
    res.status(201).json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ student: req.user._id })
      .populate({
        path: 'job',
        populate: { path: 'company', select: 'name profile' },
      });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getApplicationsForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });
    if (job.company.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    const applications = await Application.find({ job: req.params.jobId })
      .populate('student', 'name email profile');
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('job');
    if (!application) return res.status(404).json({ message: 'Application not found' });
    const isOwner = application.job.company.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    application.status = req.body.status;
    await application.save();
    res.json(application);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate('student', 'name email profile')
      .populate({ path: 'job', populate: { path: 'company', select: 'name profile' } });
    res.json(applications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
