
const pool = require("../../config/mysql");

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

const User = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      `SELECT *, phone_number AS mobile
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    return rows[0] || null;
  },

  async findByMobile(mobile) {
    const [rows] = await pool.execute(
      `SELECT *, phone_number AS mobile
       FROM users
       WHERE phone_number = ?
       LIMIT 1`,
      [mobile]
    );

    return rows[0] || null;
  },

  async findByPhoneNumber(phoneNumber) {
    return this.findByMobile(phoneNumber);
  },

  async findById(id) {
    const [rows] = await pool.execute(
      `SELECT *, phone_number AS mobile
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [id]
    );

    return rows[0] || null;
  },

  async updateProfile(id, { fname, lname, mobile, phone_number }) {
    const phoneNumber = phone_number ?? mobile;

    if (!phoneNumber) {
      throw new Error("Phone number is required.");
    }

    const currentUser = await this.findById(id);

    if (!currentUser) {
      throw new Error("User not found.");
    }

    await pool.execute(
      `UPDATE users
       SET fname = ?,
           lname = ?,
           phone_number = ?,
           last_update_date = UTC_TIMESTAMP(),
           last_update_by = ?
       WHERE id = ?`,
      [
        fname,
        lname,
        phoneNumber,
        currentUser.user_id,
        id,
      ]
    );

    return this.findById(id);
  },

  async create({
    fname,
    lname,
    email,
    mobile,
    phone_number,
    passwordHash,
    role = "STUDENT",
  }) {
    const phoneNumber = phone_number ?? mobile;

    if (!fname || !lname || !email || !phoneNumber || !passwordHash) {
      throw new Error("All required user fields must be provided.");
    }

    const connection = await pool.getConnection();
    let transactionStarted = false;

    try {
      await connection.beginTransaction();
      transactionStarted = true;

      // Generate a public user ID using the India-local timestamp
      // and the unique sequence ID.
      const [sequenceResult] = await connection.execute(
        "INSERT INTO user_id_sequence () VALUES ()"
      );

      const publicUserId =
        `${getIndiaTimestamp()}${sequenceResult.insertId}`;

      const [result] = await connection.execute(
        `INSERT INTO users (
           user_id,
           fname,
           lname,
           email,
           phone_number,
           password_hash,
           role,
           created_date,
           created_by,
           last_update_date,
           last_update_by,
           effective_start_date,
           effective_end_date,
           password_changed_at,
           must_change_password,
           is_active
         )
         VALUES (
           ?, ?, ?, ?, ?, ?, ?,
           UTC_TIMESTAMP(), ?,
           UTC_TIMESTAMP(), ?,
           UTC_TIMESTAMP(), NULL,
           UTC_TIMESTAMP(), FALSE, TRUE
         )`,
        [
          publicUserId,
          fname,
          lname,
          email,
          phoneNumber,
          passwordHash,
          role,
          publicUserId,
          publicUserId,
        ]
      );

      const userId = result.insertId;

      // Store the initial password version, including public user_id.
      await connection.execute(
        `INSERT INTO user_password_versions (
           user_pk,
           user_id,
           password_hash,
           created_date,
           created_by,
           last_update_date,
           last_update_by,
           effective_start_date,
           effective_end_date
         )
         VALUES (
           ?, ?, ?, UTC_TIMESTAMP(), ?,
           UTC_TIMESTAMP(), ?, UTC_TIMESTAMP(), NULL
         )`,
        [
          userId,
          publicUserId,
          passwordHash,
          publicUserId,
          publicUserId,
        ]
      );

      await connection.commit();
      transactionStarted = false;

      return this.findById(userId);
    } catch (error) {
      if (transactionStarted) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error(
            "User creation rollback failed:",
            rollbackError.message
          );
        }
      }

      throw error;
    } finally {
      connection.release();
    }
  },
};

module.exports = User;
