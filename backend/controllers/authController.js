import User from "../models/user.js";
import Account from "../models/account.js";

const toPaise = (rupees) => Math.round(Number(rupees) * 100);

export const signup = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;
    const signupBonus = Number(process.env.SIGNUP_BONUS || 0);

    // Check duplicates by phone or email (if provided)
    const or = [{ phone }];
    if (email) or.push({ email });
    const existingUser = await User.findOne({ $or: or });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Create user (password hashed via pre-save hook)
    const user = new User({ name, phone, email, password });
    await user.save();

    // Create associated wallet account (optionally with a signup bonus transaction)
    // Create wallet with same phone for easy lookups
    const accountData = {
      userId: user._id,
      phone: user.phone,
      walletBalance: 0,
    };
    if (signupBonus > 0) {
      accountData.walletBalance = toPaise(signupBonus);
      accountData.transactions = [
        {
          type: "credit",
          amount: toPaise(signupBonus),
        },
      ];
    }
    await Account.create(accountData);

    // Generate JWT token if secret is available
    let token = null;
    if (process.env.JWT_SECRET) {
      token = user.generateAuthToken();
    }

    const userSafe = user.toObject();
    delete userSafe.password;

    return res
      .status(201)
      .json({ message: "User created successfully", user: userSafe, token });
  } catch (err) {
    console.error("/api/signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Find user by phone
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(401).json({ message: "Invalid phone or password" });
    }

    // Compare passwords
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid phone or password" });
    }

    if (!process.env.JWT_SECRET) {
      return res
        .status(500)
        .json({ message: "Server misconfigured: JWT secret not set" });
    }

    // Generate JWT token
    const token = user.generateAuthToken();

    const userSafe = user.toObject();
    delete userSafe.password;

    return res
      .status(200)
      .json({ message: "Login successful", user: userSafe, token });
  } catch (err) {
    console.error("/api/login error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// GET /users?name=... or ?phone=...
export const getUsers = async (req, res) => {
  try {
    const { name, phone } = req.query;

    const or = [];
    if (phone) or.push({ phone });
    if (name) or.push({ name: { $regex: name, $options: "i" } });

    const filter = or.length ? { $or: or } : {};

    const users = await User.find(filter)
      .select("name phone email createdAt updatedAt")
      .lean();

    return res.json({ users });
  } catch (err) {
    console.error("/api/users error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};
