const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const cors = require('cors');
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use(cors());


app.post('/api/referral', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const referral = await prisma.referral.create({
      data: { referrerName, referrerEmail, refereeName, refereeEmail }
    });

    // Send email notification
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: referrerEmail,
        pass: process.env.PASSG
      }
    });

    const mailOptions = {
      from: referrerEmail,
      to: refereeEmail,
      subject: 'Referral',
      text: `You have been referred by ${referrerName}.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Email sent: ' + info.response);
    });

    res.status(201).json(referral);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
