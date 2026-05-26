const prisma = require("../prisma/prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// REGISTER USER
exports.registerUser = async (req, res) => {
  try {

    const {
  employeeId,
  name,
  email,
  password,
  phone,
  role
} = req.body;
    // CHECK EXISTING USER
    const existingUser = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    const roleId = role === "admin" ? 1 : 2;

    // CREATE USER
    const user = await prisma.user.create({
     data: {
    employeeId: employeeId,
    name: name,
    phone: phone,
    email: email,
    password: hashedPassword,
    role: {
      connect: {
        id: roleId,
      },
    },
  },
    });

    res.status(201).json({
      message: "User registered successfully",
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};


// LOGIN USER
exports.loginUser = async (req, res) => {

  try {

    const { email, password } = req.body;

    // FIND USER
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // CHECK PASSWORD
    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials"
      });
    }

    // GENERATE JWT TOKEN
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d"
      }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }
};

exports.getProfile = async (
  req,
  res
) => {

  try {

    const user =
      await prisma.user.findUnique({

        where: {
          id: req.user.id,
        },

        include: {
          role: true,
        },

      });

    res.status(200).json(user);

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};

exports.getAllEmployees = async (
  req,
  res
) => {

  try {

  const employees =
  await prisma.user.findMany({

    where: {
      role: {
        roleName: "Employee",
      },
    },

    include: {
      role: true,
    },

  });
    res.status(200).json(
      employees
    );

  } catch (error) {

    res.status(500).json({
      message: error.message,
    });

  }

};