const Issue = require('../models/Issue');
const cloudinary = require('../utils/cloudinary');

exports.createIssue = async (req, res) => {
    try {
        const { title, description, category, location } = req.body;
        
        let imageUrl = '';
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            imageUrl = result.secure_url;
        }

        const newIssue = new Issue({
            title, description, category, location, imageUrl
        });

        await newIssue.save();
        res.status(201).json({ success: true, data: newIssue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getIssues = async (req, res) => {
    try {
        const issues = await Issue.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, count: issues.length, data: issues });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};