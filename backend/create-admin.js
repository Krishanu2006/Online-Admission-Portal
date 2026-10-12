require("dotenv").config();

const bcrypt = require("bcryptjs");
const mysqlPool = require("./src/config/mysql");

function getIndiaTimestamp(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);

  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );

  return (
    values.day +
    values.month +
    values.year +
    values.hour +
    values.minute +
    values.second
  );
}

const ADMIN = {
  fname: "System",
  lname: "Admin",
  email: "admin@iem.edu",
  phone_number: "9000000000",
  password: "Admin@123",
  role: "ADMIN",
};

async function createAdmin() {
  let connection;

  try {
    connection = await mysqlPool.getConnection();

    // Check whether this email already exists.
    const [existingUsers] = await connection.execute(
      `SELECT id, user_id, role
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [ADMIN.email]
    );

    if (existingUsers.length > 0) {
      const existingUser = existingUsers[0];

      if (existingUser.role === "ADMIN") {
        console.log("An admin account already exists.");
        console.log("Admin email:", ADMIN.email);
        console.log("Public user ID:", existingUser.user_id);
      } else {
        throw new Error(
          "This email belongs to a non-admin account. Use a different email."
        );
      }

      return;
    }

    // Check the new phone_number column.
    const [existingPhones] = await connection.execute(
      `SELECT id FROM users
       WHERE phone_number = ?
       LIMIT 1`,
      [ADMIN.phone_number]
    );

    if (existingPhones.length > 0) {
      throw new Error(
        "This phone number is already registered. Choose another number."
      );
    }

    const passwordHash = await bcrypt.hash(ADMIN.password, 12);

    await connection.beginTransaction();

    try {
      // Generate the globally unique sequence number.
      const [sequenceResult] = await connection.execute(
        "INSERT INTO user_id_sequence () VALUES ()"
      );

      const publicUserId =
        getIndiaTimestamp() + String(sequenceResult.insertId);

      // Insert the admin using the new schema.
      const [result] = await connection.execute(
        `INSERT INTO users (
          user_id,
          fname,
          lname,
          email,
          phone_number,
          password_hash,
          role,
          is_active,
          created_date,
          created_by,
          last_update_date,
          last_update_by,
          effective_start_date,
          effective_end_date,
          password_changed_at,
          must_change_password
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, TRUE,
          UTC_TIMESTAMP(), ?,
          UTC_TIMESTAMP(), ?,
          UTC_TIMESTAMP(), NULL,
          UTC_TIMESTAMP(), TRUE
        )`,
        [
          publicUserId,
          ADMIN.fname,
          ADMIN.lname,
          ADMIN.email,
          ADMIN.phone_number,
          passwordHash,
          ADMIN.role,
          publicUserId,
          publicUserId,
        ]
      );

      // Save the initial password in password history.
      await connection.execute(
        `INSERT INTO user_password_versions (
          user_pk,
          password_hash,
          created_date,
          created_by,
          last_update_date,
          last_update_by,
          effective_start_date,
          effective_end_date
        ) VALUES (
          ?, ?, UTC_TIMESTAMP(), ?,
          UTC_TIMESTAMP(), ?,
          UTC_TIMESTAMP(), NULL
        )`,
        [
          result.insertId,
          passwordHash,
          publicUserId,
          publicUserId,
        ]
      );

      await connection.commit();

      console.log("Admin account created successfully.");
      console.log("Database ID:", result.insertId);
      console.log("Public user ID:", publicUserId);
      console.log("Admin email:", ADMIN.email);
      console.log("Phone number:", ADMIN.phone_number);
      console.log(
        "A password change will be required at the next login."
      );
      console.log(
        "For security, do not share or print the temporary password."
      );
    } catch (error) {
      await connection.rollback();
      throw error;
    }
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exitCode = 1;
  } finally {
    if (connection) {
      connection.release();
    }

    await mysqlPool.end();
  }
}

createAdmin();