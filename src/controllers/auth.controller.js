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
    
    } = req.body;
    // CHECK EMPTY FIELDS
    if (
      !employeeId ||
      !name ||
      !email ||
      !password ||
      !phone 
     
    ) {
      
      return res.status(400).json({
        message: "All fields are required",
      });
    }
    //EMPLOYEE ID VALIDATION
    const employeeIdRegex = /^[A-Za-z0-9_-]{3,20}$/;

    if (!employeeIdRegex.test(employeeId)) {
      return res.status(400).json({
        message:
          "Employee ID must be 3-20 characters and contain only letters, numbers, _ or -",
      });
    }
    // NAME VALIDATION
    const nameRegex = /^[A-Za-z\s'-]{3,50}$/;

    if (!nameRegex.test(name)) {
      return res.status(400).json({
        message:
          "Name must contain only letters and spaces (3-50 characters)",
      });
    }

    // EMAIL VALIDATION
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // PHONE VALIDATION
    const phoneRegex = /^[0-9]{10}$/;

    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        message: "Invalid phone number",
      });
    }

    // PASSWORD LENGTH CHECK
    if (password.length < 8 || password.length > 20) {
    return res.status(400).json({
      message:
        "Password must be between 8 and 20 characters",
    });
  }

    // STRONG PASSWORD CHECK
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain uppercase, lowercase, and number",
      });
    }

    if (email.length > 100)
      return res.status(400).json({ message: "Email too long" });

    if (password.length > 20)
      return res.status(400).json({ message: "Password too long" });

    
    // CHECK EXISTING USER
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }
    // CHECK EXISTING EMPLOYEE ID
    const existingEmployeeId =
      await prisma.user.findUnique({
        where: {
          employeeId,
        },
      });

    if (existingEmployeeId) {

      return res.status(400).json({
        message:
          "Employee ID already exists",
      });

    }
   
    // DELETE EXPIRED TOKENS
    await prisma.refreshToken.deleteMany({
      where: {
        expiresAt: {
          lt: new Date(),
        },
      },
    });
    // HASH PASSWORD
    const hashedPassword = await bcrypt.hash(password, 10);

    // FIND EMPLOYEE ROLE
    const employeeRole =
      await prisma.role.findFirst({
        where: {
          roleName: "Employee",
        },
      });

    if (!employeeRole) {

      return res.status(500).json({
        message: "Role not found",
      });

    }

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
            id: employeeRole.id,
          },
       },
      },
    });
    const safeUser = {
      id: user.id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      phone: user.phone,
    };

    res.status(201).json({
      message: "User registered successfully",
       user: safeUser,
    });
  } catch (error) {
    
    res.status(500).json({
      message:"Registration failed",
    });
  }
};
exports.loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 🔥 1. ENV ADMIN LOGIN (ADD THIS FIRST)
    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const accessToken = jwt.sign(
        {
          id: "admin",
          role: "ADMIN",
        },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      return res.status(200).json({
        message: "Admin login successful",
        accessToken,
        user: {
          email,
          role: "ADMIN",
        },
      });
    }

    // 🔥 2. NORMAL DB LOGIN (YOUR EXISTING LOGIC)
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (
      user.role.roleName.toLowerCase() !== role.toLowerCase()
    ) {
      return res.status(403).json({ message: "Invalid role selected" });
    }

    const accessToken = jwt.sign(
      { id: user.id, role: user.role.roleName },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role.roleName,
      },
    });

  } catch (error) {
    return res.status(500).json({ message: "Login failed" });
  }
  };
// REFRESH ACCESS TOKEN
exports.refreshAccessToken = async ( req,  res) => {

  try {
    const { refreshToken } = req.body;

    // CHECK TOKEN EXISTS
    if (!refreshToken) {

      return res.status(401).json({
        message: "Refresh token required",
      });

    }

    // CHECK TOKEN IN DATABASE
    const storedToken =
      await prisma.refreshToken.findUnique({
        where: {
          token: refreshToken,
        },
      });

    // TOKEN NOT FOUND
    if (!storedToken) {

      return res.status(403).json({
        message: "Invalid refresh token",
      });

    }

    // VERIFY JWT
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );
    // DELETE OLD REFRESH TOKEN
    await prisma.refreshToken.delete({
      where: {
        token: refreshToken,
      },
    });

    // CREATE NEW ACCESS TOKEN
    const accessToken = jwt.sign(
      {
        id: decoded.id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );
    // CREATE NEW REFRESH TOKEN
const newRefreshToken = jwt.sign(
  {
    id: decoded.id,
  },
  process.env.JWT_REFRESH_SECRET,
  {
    expiresIn: "7d",
  }
);

    // SAVE NEW REFRESH TOKEN
    await prisma.refreshToken.create({
      data: {
        token: newRefreshToken,
        userId: decoded.id,
        expiresAt: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
      },
    });

    res.status(200).json({
      accessToken,
      refreshToken: newRefreshToken,
    });

  } catch (error) {

    console.error(error);

    res.status(403).json({
      message: "Invalid refresh token",
    });

  }

};



// LOGOUT USER
exports.logoutUser = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // deleteMany won't throw if token doesn't exist
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken },
      });
    }

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Logout failed" });
  }
};

// GET PROFILE
exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: req.user.id,
      },
      include: {
        role: true,
      },
    });

    const safeUser = {
    id: user.id,
    employeeId: user.employeeId,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role.roleName,
  };
    res.status(200).json(safeUser);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
};

// GET ALL EMPLOYEES
exports.getAllEmployees = async (req, res) => {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: {
          roleName: "Employee",
        },
      },
      include: {
        role: true,
      },
    });
    const safeEmployees = employees.map(
      (employee) => ({
        id: employee.id,
        employeeId: employee.employeeId,
        name: employee.name,
        email: employee.email,
        phone: employee.phone,
        status: employee.status,
        role: employee.role.roleName,
      })
    );

    res.status(200).json(safeEmployees);

    
  } catch (error) {
    res.status(500).json({
      message:  "Failed to fetch employees",
    });
  }
};

// DELETE EMPLOYEE
exports.deleteEmployee = async (req, res) => {
  try {
    const id = Number(req.params.id);

    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      return res.status(404).json({ message: "Employee not found" });
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete employee" });
  }
};
